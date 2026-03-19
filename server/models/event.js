'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      
      Event.belongsTo(models.User, {
        foreignKey: 'organizer_id',
        as: 'organizer',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      
      Event.hasOne(models.GroupChat, {
        foreignKey: 'event_id',
        as: 'groupchat',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      
      Event.belongsTo(models.Localisation, {
        foreignKey: 'location_id',
        as: 'localisation',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      
      Event.hasMany(models.Inscription, {
        foreignKey: 'event_id',
        as: 'inscriptions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      
      Event.hasMany(models.Payment, {
        foreignKey: 'event_id',
        as: 'payments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Event.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Le titre est requis'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'La description est requise'
          }
        }
      },
      max_people: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: 'Le nombre maximum de participants doit être un nombre entier'
          },
          min: {
            args: [1],
            msg: 'Le nombre maximum de participants doit être au moins 1'
          }
        }
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: 'La date doit être une date valide'
          },
          isAfter: {
            args: new Date().toString(),
            msg: 'La date doit être dans le futur'
          }
        }
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isFloat: {
            msg: 'Le prix doit être un nombre'
          },
          min: {
            args: [0],
            msg: 'Le prix ne peut pas être négatif'
          }
        }
      },
      photos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
      },
      
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'Events',
      underscored: true,
      timestamps: true,
      paranoid: false, 
      hooks: {
        beforeUpdate: (event) => {
          event.updated_at = new Date();
        }
      }
    }
  );
  return Event;
};
