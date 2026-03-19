const rateLimit = require('express-rate-limit');


module.exports = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5,
  message: { message: 'Trop de tentatives, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});
