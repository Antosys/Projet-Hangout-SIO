const { GroupChat, Event, Inscription, Localisation } = require('../models');
module.exports = {
  async getGroupChats(req, res) {
    try {
      const userId = req.user.id;
      
      const inscriptions = await Inscription.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Event,
            as: 'event',
            include: [
              {
                model: GroupChat,
                as: 'groupchat',
              },
              {
                model: Localisation,
                as: 'localisation',
                attributes: ['city'],
              }
            ],
            attributes: ['id', 'title', 'date']
          }
        ]
      });

      
      const uniqueGroupChats = [];
      const seenGroupChatIds = new Set();

      inscriptions.forEach(inscription => {
        if (inscription.event.groupchat && !seenGroupChatIds.has(inscription.event.groupchat.id)) {
          const groupChat = inscription.event.groupchat.toJSON();
          groupChat.event = {
            id: inscription.event.id,
            title: inscription.event.title,
            date: inscription.event.date,
            localisation: inscription.event.localisation
          };
          uniqueGroupChats.push(groupChat);
          seenGroupChatIds.add(groupChat.id);
        }
      });

      return res.json(uniqueGroupChats);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération des groupchats.' });
    }
  },
  async getGroupChatByEventId(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      
      const inscription = await Inscription.findOne({
        where: { user_id: userId, event_id: eventId }
      });
      if (!inscription) {
        return res.status(403).json({ message: 'Vous n\'êtes pas inscrit à cet événement.' });
      }
      const groupChat = await GroupChat.findOne({
        where: { event_id: eventId },
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'date'],
            include: [
              {
                model: Localisation,
                as: 'localisation',
                attributes: ['city'],
              }
            ]
          }
        ]
      });
      if (!groupChat) {
        return res.status(404).json({ message: 'GroupChat introuvable.' });
      }
      return res.json(groupChat);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération du groupchat.' });
    }
  }
};
