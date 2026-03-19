'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      
      Payment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      
      Payment.belongsTo(models.Event, {
        foreignKey: 'event_id',
        as: 'event',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Payment.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'Payments',
      underscored: true,
      timestamps: false, 
    }
  );
  return Payment;
};
