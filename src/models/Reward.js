const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
    household: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

const Reward = mongoose.model('Reward', RewardSchema);

module.exports = Reward;
