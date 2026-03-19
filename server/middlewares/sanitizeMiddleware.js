const { body, sanitize } = require('express-validator');

module.exports = [
  body('*').trim().escape(),
];
