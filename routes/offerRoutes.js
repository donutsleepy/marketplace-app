const express = require('express');
const router = express.Router({mergeParams: true});
const controller = require('../controllers/offerController');
const {validateId} = require('../middleware/validator');
const {isLoggedIn, isSeller} = require('../middleware/auth');
const {validateOffer, validateResult} = require('../middleware/validator');

// GET /offers: get all offers for a record
router.get('/', validateId, isLoggedIn, isSeller, controller.show);

// POST /offers: create a new offer
router.post('/', validateId, isLoggedIn, validateOffer, validateResult, controller.new);

// POST /offers/:id: accept an offer
router.post('/:offerId/accept', validateId, isLoggedIn, isSeller, controller.accept); 

module.exports = router;