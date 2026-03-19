'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Localisation extends Model {
    static associate(models) {
      
      Localisation.hasMany(models.Event, {
        foreignKey: 'location_id',
        as: 'events',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Localisation.init(
    {
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Localisation',
      tableName: 'Localisation',
      underscored: true,
      timestamps: true
    }
  );
  return Localisation;
};
