'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inscription extends Model {
    static associate(models) {
      
      Inscription.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      
      Inscription.belongsTo(models.Event, {
        foreignKey: 'event_id',
        as: 'event',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Inscription.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Inscription',
      tableName: 'Inscriptions',
      underscored: true,
      timestamps: true, 
    }
  );

  return Inscription;
};
