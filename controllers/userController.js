const model = require('../models/user');
const Record = require('../models/record');
const Offer = require('../models/offer');

// Controller to get form for creating new user account
exports.new = (req, res) => {
    res.render('./user/new');
};

// Controller to handle creating a new user account
exports.create = (req, res, next) => {
    let user = new model(req.body);
    user.save()
    .then(user=> {
        req.flash('success', 'You are now registered! Please log in!');
        req.session.save(()=> {
            return res.redirect('/users/login');
        });
    })
    .catch(err=>{
        if (err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return req.session.save(() => {
                res.redirect(req.get("Referrer") || "/")
            });
        }

        // Handle duplicate email error (MongoDB error code 11000)
        if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
            req.flash('error', 'This email is already in use');
            return req.session.save(() => {
                return res.redirect('/users/new');
            });
        }
        
        next(err);
    }); 
};

// Controller to get the login form
exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
};

exports.login = async (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    try {
        let user = await model.findOne({ email: email });
        if (user) {
            let result = await user.comparePassword(password);
            if (result) {
                req.session.user = user._id;
                req.flash('success', 'You are now logged in!');
                req.session.save(() => {
                    res.redirect('/users/profile');
                });            
            } else {
                req.flash('error', 'Wrong password!');
                req.session.save(() => {
                    res.redirect('/users/login');
                });      
            }
        } else {
            req.flash('error', 'Wrong email address!');
            req.session.save(() => {
                res.redirect('/users/login');
            });      
        }
    } catch (err) {
        next(err);
    }
};

exports.profile = async (req, res, next) => {
    let id = req.session.user;
    try {
        // results contains an array where the first element is the user object and the second element is the list of records authored by the user
        const results = await Promise.all([model.findById(id), Record.find({ seller: id }), Offer.find({ buyer: id }).populate('record','title id')]);
        const [user, records, offers] = results;
        res.render('./user/profile', { user, records: records || [] , offers: offers || [] });
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            return next(err);
        } else {
            res.redirect('/');
        }
    });
};
