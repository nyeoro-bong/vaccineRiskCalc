'use strict'
const express = require('express');
const router = express.Router();
const Dataset = require('../models/dataset');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
/* GET home page. */
router.get('/', (req, res, next) => {
  const title = 'covidリスク確認くん';
  if (req.user) {
    Dataset.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['updatedAt', 'DESC']]
    }).then(datasets => {
      datasets.forEach(dataset => {
        dataset.formattedUpdatedAt = dayjs(dataset.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
      });
      res.render('index', {
        title: title,
        user: req.user,
        datasets: datasets
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;