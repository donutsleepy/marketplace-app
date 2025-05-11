const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const isCurrency = require('validator/lib/isCurrency');

// Validator to check if amount is valid currency and > 0
const validAmount = value => {
  if (!isCurrency(value, { 
    require_symbol: false, 
    allow_negatives: false,
    thousands_separator: ',',
    decimal_separator: '.',
    digits_after_decimal: [2], 
  })) {
    throw new Error('Must be a valid currency amount');
  }
  
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
  if (numericValue <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  return true;
};

// Middleware to validate the ID in the request parameters
exports.validateId = (req, res, next) => {
    if (mongoose.isValidObjectId(req.params.id)) {
        next();
    } else {
        let err = new Error('Invalid ID, resource not found');
        err.status = 400;
        return next(err);
    }
};

exports.validateSignUp = [
    body('firstName', 'First name cannot be empty').trim().escape().notEmpty(),
    body('lastName', 'Last name cannot be empty').trim().escape().notEmpty(),
    body('email', 'Email must be a valid email address').trim().escape().notEmpty().isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({ min: 8, max: 64 }).notEmpty()
];

exports.validateLogin = body('email', 'Email must be a valid email address').trim().escape().notEmpty().isEmail().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({ min: 8, max: 64 }).notEmpty();

exports.validateRecord = [
    body('title', 'Title cannot be empty').trim().escape().notEmpty(),
    body('artist', 'Artist cannot be empty').trim().escape().notEmpty(),
    body('genre', 'Genre cannot be empty').trim().escape().notEmpty(),
    body('label', 'Label cannot be empty').trim().escape().notEmpty(),
    body('condition', 'Condition cannot be empty').trim().escape().notEmpty().isIn(['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good', 'Fair', 'Poor']),
    body('price', 'Price must be greater than 0').trim().escape().notEmpty().custom(validAmount),
    body('details', 'Details must be at least 10 characters').isLength({ min: 10 }).trim().escape().notEmpty(),
    body('image', 'Image cannot be empty').trim(),
    body('active', 'Active status must be Active or Inactive').optional().trim().escape().notEmpty().isIn(['Active', 'Inactive']),
    body('totalOffers', 'Total offers must be greater than 0').optional().trim().escape().notEmpty(),
    body('highestOffer', 'Highest offer must be greater than 0').optional().trim().escape().notEmpty(),
];

exports.validateOffer = [
    body('amount', 'Amount must be greater than 0').trim().escape().notEmpty().custom(validAmount),
    body('status', 'Status must be pending, accepted, or rejected').optional().trim().escape().isIn(['Pending', 'Accepted', 'Rejected']),
    body('record').optional().trim(),
    body('buyer').optional().trim()
];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(err => {
            req.flash('error', err.msg);
        });
        req.session.save(() => {
            res.redirect(req.get("Referrer") || "/")
        });
    } else {
        return next();
    }
}
