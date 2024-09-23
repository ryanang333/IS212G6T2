import  express  from "express";
const express = require('express');
const router = express.Router();
const flexibleArrangementController = require('../controllers/flexibleArrangement.controller');

// Route to apply for flexible work arrangement
router.post('/apply', flexibleArrangementController.applyFlexibleArrangement);

module.exports = router;
