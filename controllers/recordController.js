const model = require ('../models/record');
const Offer = require ('../models/offer');

// Controller to get list of all record albums
exports.index = async (req, res, next) => {
    try {
        const term = req.query.search;
        if (term) {
            // Search for records that match the search term in title or details
            const records = await model.find({$or
                : [
                    {title: {$regex: term, $options: 'i'}},
                    {details: {$regex: term, $options: 'i'}},
                ]}
            );
            return res.render('./record/items', { records });
        } else {
            // Get records sorted by price in ascending order
            const records = await model.find({}).sort({price: 1});
            return res.render('./record/items', { records });
        }
    } catch (err) {
        next(err);
    }
};

// Controller to get form for creating new record album
exports.new = (req, res) => {
    res.render('./record/new');
};

// Controller to create new record album
exports.create = async (req, res, next) => {
    try {
        // Handle image upload if req.file exists
        if (req.file && req.file.filename) {
            req.body.image = '/images/' + req.file.filename;
        }
        const record = new model(req.body);
        record.seller = req.session.user;
        await record.save();
        req.flash('success', 'Item successfully created!');
        req.session.save(() => {
            return res.redirect('/items/');
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

// Controller to display specific record album given an id
exports.show = async (req, res, next) => {
    try {
        const id = req.params.id;
        const record = await model.findById(id).populate('seller', "firstName lastName");

        if (record) {
            // Render the item page with the record information
            res.render('./record/item', { record });
        } else {
            const err = new Error('The server could not find a record with id ' + id);
            err.status = 404;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

// Controller to get form for editing specific record album given an id
exports.edit = async (req, res, next) => {
    try {
        const id = req.params.id;
        const record = await model.findById(id);

        if (record) {
            // Render the item page with the record information
            res.render('./record/edit', { record });
        } else {
            const err = new Error('The server could not find a record with id ' + id);
            err.status = 404;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

// Controller to update specific record album given an id
exports.update = async (req, res, next) => {
    try {
        const newRecord = req.body;
        const id = req.params.id;

        // Handle image upload
        if (req.file && req.file.filename) {
            newRecord.image = '/images/' + req.file.filename;
        } else {
            // If no new image is uploaded, keep the old image
            const record = await model.findById(id);
            if (record) {
                newRecord.image = record.image;
            } else {
                const err = new Error('The server could not find a record with id ' + id);
                err.status = 404;
                throw err;
            }
        }

        // Find and update the record, checking for validation errors
        const record = await model.findByIdAndUpdate(id, newRecord, {useFindAndModify: false, runValidators: true});

        if (record) {
            res.redirect('/items/' + id);
        } else {
            const err = new Error('The server could not find a record with id ' + id);
            err.status = 404;
            next(err);
        }
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

// Controller to delete specific record album given an id
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;
        const record = await model.findByIdAndDelete(id, {useFindAndModify: false});
        // Delete all offers associated with the record
        await Offer.deleteMany({record: id});

        if (record) {
            res.redirect('/items');
        } else {
            let err = new Error('The server could not find a record with id ' + id);
            err.status = 404;
            throw err;
        }
    } catch (err) {
        // If the error is a validation error
        if (err.name === 'ValidationError') {
            req.flash('error', err.message);
            return req.session.save(() => {
                res.redirect(req.get("Referrer") || "/")
            });
        }
        next(err);
    }
};

