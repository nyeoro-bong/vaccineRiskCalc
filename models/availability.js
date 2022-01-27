'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Availability = sequelize.define(
  'availabilities',
  {
    candidateId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    availability: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    datasetId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['datasetId']
      }
    ]
  }
);

module.exports = Availability;