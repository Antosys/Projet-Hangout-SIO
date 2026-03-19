const { Message, GroupChat, Event, User, Inscription } = require('../models');

module.exports = {
 async getMessagesByGroupChatId(req, res) {
  try {
    const { groupchatId } = req.params;
    const userId = req.user.id;

    
    const hasAccess = await Inscription.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: GroupChat,
              as: 'groupchat',
              where: { id: groupchatId }
            }
          ]
        }
      ]
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Vous n\'avez pas accès à ce groupchat.' });
    }

    const messages = await Message.findAll({
      where: { groupchat_id: groupchatId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nom', 'prenom'],
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages.' });
  }
},

  async createMessage(req, res) {
    try {
      const { content, groupchat_id } = req.body;
      const userId = req.user.id;

      
      const groupChat = await GroupChat.findByPk(groupchat_id, {
        include: [
          {
            model: Event,
            as: 'event',
            include: [
              {
                model: Inscription,
                as: 'inscriptions',
                where: { user_id: userId }
              }
            ]
          }
        ]
      });

      if (!groupChat || groupChat.event.inscriptions.length === 0) {
        return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à poster dans ce groupchat.' });
      }

      
      const message = await Message.create({
        content,
        user_id: userId,
        groupchat_id: groupchat_id,
      });

      const createdMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nom', 'prenom'],
          }
        ]
      });

      return res.status(201).json(createdMessage);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la création du message.' });
    }
  },

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const message = await Message.findByPk(id, {
        include: [
          {
            model: GroupChat,
            as: 'groupchat',
            include: [
              {
                model: Event,
                as: 'event',
                include: [
                  {
                    model: Inscription,
                    as: 'inscriptions',
                    where: { user_id: userId }
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!message) {
        return res.status(404).json({ message: 'Message introuvable.' });
      }

      
      if (message.groupchat.event.inscriptions.length === 0 && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à supprimer ce message.' });
      }

      if (message.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à supprimer ce message.' });
      }

      await message.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur lors de la suppression du message.' });
    }
  }
};
