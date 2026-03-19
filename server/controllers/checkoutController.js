const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Inscription, Event } = require('../models');

const checkoutController = {
  async verifyCheckoutSession(req, res) {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: "ID de session de paiement manquant." });
    }

    try {
      
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "La session de paiement n'est pas valide ou le paiement n'a pas été effectué." });
      }

      
      const userId = session.client_reference_id;
      const eventId = session.metadata.event_id;

      const inscription = await Inscription.findOne({
        where: { user_id: userId, event_id: eventId }
      });

      if (!inscription) {
        return res.status(404).json({ error: "Inscription non trouvée." });
      }

      
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ error: "Événement non trouvé." });
      }

      res.json({
        success: true,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
        }
      });

    } catch (error) {
      console.error("Erreur lors de la vérification de la session de paiement:", error);
      res.status(500).json({ error: "Erreur serveur lors de la vérification de la session de paiement." });
    }
  }
};

module.exports = checkoutController;
