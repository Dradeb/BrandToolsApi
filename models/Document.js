const mongoose = require('mongoose');



const documentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    tags: {
        type: String,
        required: true,

    },
    date: {
        type: Date,
        default: Date.now,
    },
    docType: {
        type: String,
        required: true
    }
});





module.exports = mongoose.model('Documents', documentSchema);