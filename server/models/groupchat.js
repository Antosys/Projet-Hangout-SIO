'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupChat extends Model {
    static associate(models) {
      
      GroupChat.belongsTo(models.Event, {
        foreignKey: 'event_id',
        as: 'event',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      
      GroupChat.hasMany(models.Message, {
        foreignKey: 'groupchat_id',
        as: 'messages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  GroupChat.init(
    {
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'GroupChat',
      tableName: 'GroupChats',
      underscored: true,
      timestamps: true
    }
  );
  return GroupChat;
};
