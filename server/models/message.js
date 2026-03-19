'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      
      Message.belongsTo(models.GroupChat, {
        foreignKey: 'groupchat_id',
        as: 'groupchat',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      
      Message.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user', 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Message.init(
    {
      groupchat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'Messages',
      underscored: true,
      timestamps: true,
    }
  );
  return Message;
};
