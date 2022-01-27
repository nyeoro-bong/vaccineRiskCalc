'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Candidate = sequelize.define(
  'candidates',
  {
    candidateId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    candidateName: {
      type: DataTypes.STRING,
      allowNull: false
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

module.exports = Candidate;