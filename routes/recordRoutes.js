const express = require('express');
const controller = require('../controllers/recordController');
const offerRoutes = require('./offerRoutes');
const router = express.Router();
const {upload} = require('../middleware/fileUpload');
const {isLoggedIn, isSeller} = require('../middleware/auth');
const {validateId, validateRecord, validateResult} = require('../middleware/validator');


// GET/items: get all vinyl records
router.get('/', controller.index);

// GET/items/new: form to add new vinyl record
router.get('/new', isLoggedIn, controller.new);

// POST/item: create a new vinyl record entry
router.post('/', upload, isLoggedIn, validateRecord, validateResult, controller.create);

// GET/items/:id: send details of a vinyl record given id
router.get('/:id', validateId, controller.show);

// GET/items/:id/edit: form to edit a vinyl record given id
router.get('/:id/edit', isLoggedIn, validateId, isSeller, controller.edit);

// PUT/items/:id: update a vinyl record given id
router.put('/:id', isLoggedIn, upload, validateId, validateRecord, validateResult, isSeller, controller.update);

// DELETE/items/:id: delete a vinyl record given id
router.delete('/:id', isLoggedIn, validateId, isSeller, controller.delete);

// Nested routes for offers
router.use('/:id/offers', offerRoutes);

module.exports = router;