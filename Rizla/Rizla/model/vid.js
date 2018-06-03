const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const IdeaSchema = new Schema({
    titl:{
        type: String,
        required: true
    },
    detail:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});



const Idea = module.exports = mongoose.model('ideas', IdeaSchema);