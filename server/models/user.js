'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      
      User.hasMany(models.Event, {
        foreignKey: 'organizer_id',
        as: 'organizedEvents',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      
      User.hasMany(models.Inscription, {
        foreignKey: 'user_id',
        as: 'inscriptions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      
      User.hasMany(models.Payment, {
        foreignKey: 'user_id',
        as: 'payments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      
      User.hasMany(models.Message, {
        foreignKey: 'user_id',
        as: 'messages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      
      User.belongsToMany(models.GroupChat, {
        through: 'UserGroupChat',
        as: 'groupchats',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  User.init(
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'participant',
        validate: {
          isIn: [['admin', 'organizer', 'participant']],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      underscored: true,
      timestamps: true,
    }
  );
  return User;
};
