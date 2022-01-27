'use strict';
const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@db/covid_riskcalk'
);

module.exports = {
  sequelize,
  DataTypes
};