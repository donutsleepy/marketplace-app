const model  = require('../models/offer.js');
const Record = require('../models/record');

// Get all offers for a record
exports.show = async (req, res, next) => {
    try {
        // Find all offers for the record with the given id
        const id = req.params.id;
        const record = await Record.findById(id);
        const offers = await model.find({ record: id }).populate('buyer', 'firstName lastName');
        if (record && offers) {
            res.render('./offer/offers', {record, offers});
        } else {
            const err = new Error('The server could not find any offers for the record with id  ' + id);
            err.status = 404;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

// Create a new offer for a record
exports.new = async (req, res, next) => {
    try {
        // Check if record exists
        const id = req.params.id;
        const record = await Record.findById(id);
        if (!record) {
            const err = new Error('The server could not find a record with id ' + id);
            err.status = 404;
            return next(err); 
        }
        
        // Check that the user is not the seller of the record
        if (req.session.user === record.seller.toString()) {
            const err = new Error('You cannot make an offer on your own record!');
            err.status = 401;
            return next(err);
        }

        // Fill in offer fields and save to database
        const offer = new model(req.body);
        offer.record = id;
        offer.buyer = req.session.user;
        await offer.save();

        // Update the record with new offer details and save to database 
        record.totalOffers++;
        record.highestOffer = Math.max(record.highestOffer, offer.amount);
        await record.save();

        req.flash('success', 'Offer successfully created!');
        req.session.save(() => {
            return res.redirect('/items/' + id);
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            req.flash('error', err.message);
            return req.session.save(() => {
                res.redirect(req.get("Referrer") || "/")
            });
        }
        next(err);
    }
};

// Accept an offer for a record
exports.accept = async (req, res, next) => {
    try {
        // Get id for record and offer
        const id = req.params.id;
        const offerId = req.params.offerId;

        // Check if record exists
        const record = await Record.findById(id);
        if (!record) {
            const err = new Error('The server could not find a record with id ' + id);
            err.status = 404;
            return next(err); 
        }

        // Get all offers for the record 
        const offers = await model.find({ record: id });
        if (offers.length === 0) {
            const err = new Error('The server could not find any offers for the record with id ' + id);
            err.status = 404;
            return next(err); 
        }

        // Change the item active field to inactive
        record.active = 'Inactive';
        await record.save();

        await Promise.all(offers.map(async (offer) => {
            if (offer.id !== offerId) {
                // Update the offer status to rejected
                offer.status = 'Rejected';
            } else {
                // Update the offer status to accepted
                offer.status = 'Accepted';
            }
            await offer.save();
        }));

        req.flash('success', 'Offer successfully accepted!');
        req.session.save(() => {
            return res.redirect('/items/' + id + '/offers');
        });

    } catch (err) {
        next(err);
    }
};
