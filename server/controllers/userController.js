const { User, Event, Inscription } = require('../models');


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error("Erreur lors du chargement du profil:", error);
    res.status(500).json({ error: 'Erreur lors du chargement du profil' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const eventsCreated = await Event.count({
      where: { organizer_id: userId }
    });

    const eventsAttended = await Inscription.count({
      where: { user_id: userId, status: 'confirmed' }
    });

    res.json({
      eventsCreated,
      eventsAttended,
      totalEvents: eventsCreated + eventsAttended
    });
  } catch (error) {
    console.error("Erreur lors du chargement des stats:", error);
    res.status(500).json({ error: 'Erreur lors du chargement des stats' });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, username, email, phone, bio } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    user.nom = nom || user.nom;
    user.prenom = prenom || user.prenom;
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    
    
    user.password_hash = newPassword; 
    await user.save();
    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    await user.destroy();
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
  }
};
