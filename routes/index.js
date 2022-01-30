'use strict'
const express = require('express');
const router = express.Router();
const Dataset = require('../models/dataset');

/* GET home page. */
router.get('/', function (req, res, next) {
  const title = 'covidリスク確認くん';
  if (req.user) {
    Dataset.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['updatedAt', 'DESC']]
    }).then(datasets => {
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