const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Record schema
const recordSchema = new Schema({
    title: {type: String, required: [true, 'Title is required']},
    artist: {type: String, required: [true, 'Artist is required']},
    genre: {type: String, required: [true, 'Genre is required']},
    label: {type: String, required: [true, 'Label is required']},
    seller: {type: Schema.Types.ObjectId, ref: 'User'},
    condition: {
        type: String, 
        enum: ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good', 'Fair', 'Poor'], 
        required: [true, 'Condition is required and must be one of the following: Mint, Near Mint, Very Good Plus, Very Good, Good, Fair, Poor']
        },
    price: {type: Number, min: [0.01, 'Price must be positive and at least $0.01'], required: [true, 'Price is required']},
    details: {
        type: String, required: [true, 'Details is required'], 
        minLength: [10, 'Content must be at least 10 characters long']
    },
    image: {type: String},
    active: {type: String, enum: ['Active', 'Inactive'], default: 'Active'},
    totalOffers: {type: Number, default: 0, min: 0},
    highestOffer: {type: Number, default: 0, min: 0},
})

module.exports = mongoose.model('Record', recordSchema);