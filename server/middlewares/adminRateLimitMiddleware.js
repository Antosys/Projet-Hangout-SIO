const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: { message: 'Trop de requetes admin, reessayez dans quelques instants.' },
  standardHeaders: true,
  legacyHeaders: false,
});