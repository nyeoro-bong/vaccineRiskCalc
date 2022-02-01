'use strict';
const {Sequelize, DataTypes} = require('sequelize');
// const sequelize = new Sequelize(
//   'postgres://postgres:postgres@db/covid_riskcalk'
// );
const dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};
const sequelize = process.env.DATABASE_URL ?
  // 本番環境
  new Sequelize(
    process.env.DATABASE_URL,
    {
      logging: false,
      dialectOptions
    }
  )
  :
  // 開発環境
  new Sequelize(
    'postgres://postgres:postgres@db/covid_riskcalk',
    {
      logging: false
    }
  );

module.exports = {
  sequelize,
  DataTypes
};