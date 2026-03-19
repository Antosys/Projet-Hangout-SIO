const { Message } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ message: 'Message introuvable.' });
    }

    if (message.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce message.' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur lors de la vérification des autorisations.' });
  }
};
