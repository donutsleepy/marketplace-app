// require necessary modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const recordRoutes = require('./routes/recordRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const User = require('./models/user');

// create express app
const app = express();

// configure app
const port = process.env.PORT || 3000;
const host = 'localhost';
const mongoURL = process.env.MONGO_URL;
app.set('view engine', 'ejs');


// Connect to the database
mongoose.connect(mongoURL)
.then(()=>{
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    })
})
.catch((err)=>{
    console.log('Could not connect to mongodb', err);
});

// mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('short'));
app.use(methodOverride('_method'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongoUrl: mongoURL}),
    cookie: {maxAge: 60*60*1000}
}));

app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user || null;     // keep track of logged in user
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

// set up routes
app.get('/', (req, res) => {
    res.render('index');
});

// mount vinyl record routes on root url
app.use('/items', recordRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server could not locate the specified resource of ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status){
        err.status = 500;
        err.message = "Internal Server Error";
    }

    res.status(err.status);
    res.render('error', { error: err });
});
