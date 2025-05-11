const Records = require('../models/record');
// Check if user is a guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are already logged in');
        req.session.save(() => {
            return res.redirect('/users/profile');
        });
    }
};

// Check if user is logged in
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        req.session.save(() => {
            return res.redirect('/users/login');
        });
    }
};

// Check if user is the seller of the vinyl record
exports.isSeller = (req, res, next) => {
    let id = req.params.id;

    Records.findById(id)
    .then(record =>{
        if (record) {
            if (record.seller == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized access to this resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
};