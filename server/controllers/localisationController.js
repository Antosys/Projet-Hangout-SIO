const { Op } = require('sequelize');
const { Localisation } = require('../models');

module.exports = {
  async getAllLocalisations(req, res) {
    try {
      const { search } = req.query;
      let localisations;

      if (search && search.length >= 2) {
        
        localisations = await Localisation.findAll({
          where: {
            city: {
              [Op.iLike]: `${search}%`
            }
          },
          attributes: ['city']
        });
      } else {
        
        localisations = await Localisation.findAll({
          attributes: ['city']
        });
      }

      const cities = localisations.map(loc => loc.city);

      return res.json(cities);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération des localisations.' });
    }
  }
};
