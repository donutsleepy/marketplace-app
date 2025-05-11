const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Offer schema
const offerSchema = new Schema({
    amount: {type: Number, min: [0.01, 'Amount must be positive and at least $0.01'], required: [true, 'Amount is required']},
    status: {type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending'},
    record: {type: Schema.Types.ObjectId, ref: 'Record'},
    buyer: {type: Schema.Types.ObjectId, ref: 'User'},
});

module.exports = mongoose.model('Offer', offerSchema);