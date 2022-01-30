'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Availability = require('../models/availability');

router.post(
  '/:datasetId/users/:userId/candidates/:candidateId',
  authenticationEnsurer,
  (req, res, next) => {
    const datasetId = req.params.datasetId;
    const userId = req.params.userId;
    const candidateId = req.params.candidateId;
    let availability = req.body.availability;
    availability = availability ? parseInt(availability) : 0;

    Availability.upsert({
      datasetId: datasetId,
      userId: userId,
      candidateId: candidateId,
      availability: availability
    }).then(() => {
      res.json({ status: 'OK', availability: availability });
    });
  }
);

module.exports = router;