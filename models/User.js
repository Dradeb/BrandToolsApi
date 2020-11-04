const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,

    },
    changesDate: {
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model('User', userSchema);