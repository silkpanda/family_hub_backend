// FILE: /src/models/Recipe.js
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    household: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    instructions: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', RecipeSchema);
module.exports = Recipe;