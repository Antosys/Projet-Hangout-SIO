const { Op, fn, col } = require('sequelize');
const { User, Event, Inscription, Payment, Localisation } = require('../models');
const bcrypt = require('bcrypt');

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const buildPagination = (query, defaultLimit = 20, maxLimit = 100) => {
  const page = toPositiveInt(query.page, 1);
  const requestedLimit = toPositiveInt(query.limit, defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

module.exports = {
  async getOverview(req, res) {
    try {
      const [usersTotal, adminsTotal, organizersTotal, eventsTotal, inscriptionsTotal, paidPayments] = await Promise.all([
        User.count(),
        User.count({ where: { role: 'admin' } }),
        User.count({ where: { role: 'organisateur' } }),
        Event.count(),
        Inscription.count(),
        Payment.count({ where: { status: { [Op.in]: ['paid', 'succeeded', 'confirmed'] } } }),
      ]);

      const revenueResult = await Payment.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'totalRevenue']],
        raw: true,
      });

      const topEvents = await Event.findAll({
        attributes: ['id', 'title', 'date', 'max_people'],
        include: [
          {
            model: Inscription,
            as: 'inscriptions',
            attributes: ['id'],
          },
        ],
        order: [['date', 'DESC']],
        limit: 5,
      });

      return res.json({
        users: {
          total: usersTotal,
          admins: adminsTotal,
          organizers: organizersTotal,
          participants: usersTotal - adminsTotal - organizersTotal,
        },
        events: {
          total: eventsTotal,
        },
        inscriptions: {
          total: inscriptionsTotal,
        },
        payments: {
          paidCount: paidPayments,
          totalRevenue: Number(revenueResult?.totalRevenue || 0),
        },
        highlights: topEvents.map((event) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          maxPeople: event.max_people,
          participantsCount: event.inscriptions?.length || 0,
        })),
      });
    } catch (error) {
      console.error('Admin overview error:', error);
      return res.status(500).json({ message: 'Server error while loading admin overview.' });
    }
  },

  async getUsers(req, res) {
    try {
      const { search, role } = req.query;
      const { page, limit, offset } = buildPagination(req.query);
      const where = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where[Op.or] = [
          { email: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
          { prenom: { [Op.iLike]: `%${search}%` } },
          { nom: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows, count } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password_hash'] },
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return res.json({
        total: count,
        page,
        limit,
        users: rows,
      });
    } catch (error) {
      console.error('Admin users error:', error);
      return res.status(500).json({ message: 'Server error while loading users.' });
    }
  },

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Normalize 'organizer' (legacy) to 'organisateur'
      const normalizedRole = role === 'organizer' ? 'organisateur' : role;
      const allowedRoles = ['admin', 'organisateur', 'participant'];

      if (!allowedRoles.includes(normalizedRole)) {
        return res.status(400).json({ message: 'Invalid role.' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      user.role = normalizedRole;
      await user.save();

      return res.json({
        message: 'User role updated.',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Admin update role error:', error);
      return res.status(500).json({ message: 'Server error while updating role.' });
    }
  },

  async createUser(req, res) {
    try {
      const { nom, prenom, username, email, password, role } = req.body;
      const roleMap = {
        administrateur: 'admin',
        organisateur: 'organisateur',
        organizer: 'organisateur',
        utilisateur: 'participant',
        admin: 'admin',
        participant: 'participant',
      };

      const normalizedRole = roleMap[String(role || '').trim().toLowerCase()];

      if (!nom || !prenom || !username || !email || !password || !normalizedRole) {
        return res.status(400).json({
          message: 'Missing or invalid fields. Required: nom, prenom, username, email, password, role.',
        });
      }

      const existing = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (existing) {
        return res.status(409).json({ message: 'Email or username already exists.' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        nom,
        prenom,
        username,
        email,
        password_hash,
        role: normalizedRole,
      });

      return res.status(201).json({
        message: 'User created.',
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Admin create user error:', error);
      return res.status(500).json({ message: 'Server error while creating user.' });
    }
  },

  async createLocalisation(req, res) {
    try {
      const { address, city, postal_code } = req.body;

      if (!address || !city || !postal_code) {
        return res.status(400).json({ message: 'Missing required fields: address, city, postal_code.' });
      }

      const localisation = await Localisation.create({
        address,
        city,
        postal_code,
      });

      return res.status(201).json({
        message: 'Localisation created.',
        localisation,
      });
    } catch (error) {
      console.error('Admin create localisation error:', error);
      return res.status(500).json({ message: 'Server error while creating localisation.' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (Number(req.user.id) === Number(id)) {
        return res.status(400).json({ message: 'You cannot delete your own admin account from this endpoint.' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      await user.destroy();
      return res.status(200).json({ message: 'User deleted.' });
    } catch (error) {
      console.error('Admin delete user error:', error);
      return res.status(500).json({ message: 'Server error while deleting user.' });
    }
  },

  async getEvents(req, res) {
    try {
      const { search } = req.query;
      const { page, limit, offset } = buildPagination(req.query);
      const where = {};

      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows, count } = await Event.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'organizer',
            attributes: ['id', 'username', 'email'],
          },
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
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      const events = rows.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        price: event.price,
        maxPeople: event.max_people,
        participantsCount: event.inscriptions?.length || 0,
        organizer: event.organizer,
        location: event.localisation,
      }));

      return res.json({ total: count, page, limit, events });
    } catch (error) {
      console.error('Admin events error:', error);
      return res.status(500).json({ message: 'Server error while loading events.' });
    }
  },

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found.' });
      }

      await event.destroy();
      return res.status(200).json({ message: 'Event deleted.' });
    } catch (error) {
      console.error('Admin delete event error:', error);
      return res.status(500).json({ message: 'Server error while deleting event.' });
    }
  },

  async getInscriptions(req, res) {
    try {
      const { search, status } = req.query;
      const { page, limit, offset } = buildPagination(req.query);
      const where = {};

      if (status) {
        where.status = status;
      }

      const include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'prenom', 'nom'],
          required: !!search,
          where: search
            ? {
                [Op.or]: [
                  { username: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } },
                  { prenom: { [Op.iLike]: `%${search}%` } },
                  { nom: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : undefined,
        },
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'date', 'price'],
        },
      ];

      const { rows, count } = await Inscription.findAndCountAll({
        where,
        include,
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return res.json({ total: count, page, limit, inscriptions: rows });
    } catch (error) {
      console.error('Admin inscriptions error:', error);
      return res.status(500).json({ message: 'Server error while loading inscriptions.' });
    }
  },

  async deleteInscription(req, res) {
    try {
      const { id } = req.params;
      const inscription = await Inscription.findByPk(id);

      if (!inscription) {
        return res.status(404).json({ message: 'Inscription not found.' });
      }

      await inscription.destroy();
      return res.status(200).json({ message: 'Inscription deleted.' });
    } catch (error) {
      console.error('Admin delete inscription error:', error);
      return res.status(500).json({ message: 'Server error while deleting inscription.' });
    }
  },
};