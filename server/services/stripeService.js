const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    success_url: `http://localhost:8080/achat-reussi?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:8080/achat-annule`,
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
