const { Op } = require('sequelize');
const { Event, User, Inscription, Localisation, GroupChat, UserGroupChat } = require('../models');
const stripeService = require('../services/stripeService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { normalizePhotoEntries } = require('../utils/imageStorage');

module.exports = {
  async getAllEvents(req, res) {
    try {
      const { search, city, sort = 'date', order = 'asc', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }
      if (city) {
        const localisation = await Localisation.findOne({ where: { city } });
        if (localisation) {
          where.location_id = localisation.id;
        }
      }
      const { rows, count } = await Event.findAndCountAll({
        where,
        include: [
          {
            model: Localisation,
            as: 'localisation',
            attributes: ['city', 'postal_code'],
          },
          {
            model: Inscription,
            as: 'inscriptions',
            attributes: ['id'],
          },
        ],
        limit: parseInt(limit),
        offset,
        order: [[sort, order.toUpperCase()]],
      });
      const formattedEvents = rows.map((event) => {
        const normalizedPhotos = normalizePhotoEntries(event.photos);

        return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        price: event.price,
        location: `${event.localisation?.city || 'Non précisée'} (${event.localisation?.postal_code || ''})`,
        participants: event.inscriptions.length,
        maxParticipants: event.max_people,
        photo: normalizedPhotos[0] || null,
        photos: normalizedPhotos,
        };
      });
      return res.json({
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        events: formattedEvents,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération des événements.' });
    }
  },

 async getRandomEvents(req, res) {
    try {
      const allEvents = await Event.findAll({
        include: [
          {
            model: Localisation,
            as: 'localisation',
            attributes: ['city', 'postal_code'],
          }
        ]
      });
      const shuffled = allEvents.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);

      const formatted = selected.map(event => {
        const normalizedPhotos = normalizePhotoEntries(event.photos);

        return {
          id: event.id,
          title: event.title,
          description: event.description ? event.description.substring(0, 35) + '...' : '',
          date: event.date,
          location: `${event.localisation?.city || 'Non précisée'} (${event.localisation?.postal_code || ''})`,
          photo: normalizedPhotos[0] || null,
          photos: normalizedPhotos,
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération aléatoire des événements.' });
    }
},



  async getEventById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const event = await Event.findByPk(id, {
        include: [
          {
            model: User,
            as: 'organizer',
            attributes: ['id', 'username', 'nom', 'prenom'],
          },
          {
            model: Localisation,
            as: 'localisation',
            attributes: ['city', 'postal_code', 'address'],
          },
          {
            model: Inscription,
            as: 'inscriptions',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }]
          },
        ],
      });
      if (!event) {
        return res.status(404).json({ message: 'Événement introuvable.' });
      }
      const isParticipant = event.inscriptions.some(insc => insc.user_id === userId);
      const isOrganizer = event.organizer?.id === userId;
      const normalizedPhotos = normalizePhotoEntries(event.photos);

      return res.json({
        ...event.toJSON(),
        participantsCount: event.inscriptions.length,
        photos: normalizedPhotos,
        photo: normalizedPhotos[0] || null,
        isParticipant,
        isOrganizer,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  async createEvent(req, res) {
    try {
      const { role, id: userId } = req.user;
      if (role !== 'admin' && role !== 'organisateur') {
        return res.status(403).json({ message: 'Accès refusé. Seuls les organisateurs ou administrateurs peuvent créer un événement.' });
      }

      const { title, description, location_id, max_people, date, price, photos } = req.body;

      const location = await Localisation.findOne({
        where: { city: location_id }
      });

      if (!location) {
        return res.status(404).json({ message: 'Localisation non trouvée. Veuillez vérifier le nom de la ville.' });
      }

      const cleanPhotos = normalizePhotoEntries(photos);

      const event = await Event.create({
        title,
        description,
        location_id: location.id,
        max_people,
        date,
        price,
        photos: cleanPhotos,
        organizer_id: userId,
      });

      await GroupChat.create({
        event_id: event.id
      });

      await Inscription.create({
        user_id: userId,
        event_id: event.id,
        status: 'confirmed'
      });

      return res.status(201).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la création de l\'événement.' });
    }
  },

  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const { title, description, location_id, max_people, date, price, photos } = req.body;
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ message: 'Événement introuvable.' });
      }
      if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à modifier cet événement.' });
      }

      const cleanPhotos = normalizePhotoEntries(photos);

      await event.update({
        title,
        description,
        location_id,
        max_people,
        date,
        price,
        photos: cleanPhotos,
      });
      return res.json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'événement.' });
    }
  },

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ message: 'Événement introuvable.' });
      }
      if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à supprimer cet événement.' });
      }
      await event.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'événement.' });
    }
  },

  async joinEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: 'Événement introuvable.' });
      }

      const existingInscription = await Inscription.findOne({
        where: { user_id: userId, event_id: eventId }
      });

      if (existingInscription) {
        return res.status(400).json({ message: 'Vous êtes déjà inscrit à cet événement.' });
      }

      const count = await Inscription.count({ where: { event_id: eventId } });
      if (event.max_people && count >= event.max_people) {
        return res.status(400).json({ message: 'Événement complet.' });
      }

      if (event.price > 0) {
        const session = await stripeService.createCheckoutSession(event, userId, eventId);
        return res.status(200).json({ url: session.url });
      } else {
        await Inscription.create({ user_id: userId, event_id: eventId, status: 'confirmed' });

        return res.status(201).json({ message: 'Inscription réussie.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la participation.' });
    }
  },

  async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {

      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          const userId = session.client_reference_id;
          const eventId = session.metadata.event_id;
          const existingInscription = await Inscription.findOne({
            where: { user_id: userId, event_id: eventId }
          });
          if (!existingInscription) {
            await Inscription.create({
              user_id: userId,
              event_id: eventId,
              status: 'confirmed'
            });

            const groupChat = await GroupChat.findOne({
              where: { event_id: eventId }
            });

            if (groupChat) {
              await UserGroupChat.create({
                user_id: userId,
                groupchat_id: groupChat.id,
              });
            }
          }
        }
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return res.status(200).send();
  },

  async leaveEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const inscription = await Inscription.findOne({
        where: { user_id: userId, event_id: eventId }
      });
      if (!inscription) {
        return res.status(404).json({ message: 'Inscription introuvable.' });
      }
      await inscription.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la sortie de l\'événement.' });
    }
  }
};
