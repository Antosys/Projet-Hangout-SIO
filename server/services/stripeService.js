const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CLIENT_URL = 'https://antoinegiblin-projet-bts.com';

const createCheckoutSession = async (event, userId, eventId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: event.title,
        },
        unit_amount: Math.round(event.price * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${CLIENT_URL}/achat-reussi?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/achat-annule`,
    client_reference_id: userId,
    metadata: {
      event_id: eventId,
    },
  });

  return session;
};

module.exports = {
  createCheckoutSession,
};
