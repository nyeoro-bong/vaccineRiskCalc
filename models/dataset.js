'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Dataset = sequelize.define(
  'datasets',
  {
    datasetId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    datasetName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uAge: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uVac: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uPref: {
      type: DataTypes.STRING,
      allowNull: false
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['createdBy']
      }
    ]
  }
);

module.exports = Dataset;