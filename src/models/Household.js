const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Subdocument Schemas ---

const memberSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    color: { type: String, default: '#CCCCCC' }
});

const taskSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['routine', 'chore', 'quest'], required: true },
    points: { type: Number, default: 0 },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['incomplete', 'pending_approval', 'complete'], default: 'incomplete' },
    // ... other task fields
});

const eventSchema = new Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false }
});

const rewardSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    cost: { type: Number, required: true, min: 0 }
});

const redemptionRequestSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reward: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
    cost: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: Date
});

const recipeSchema = new Schema({
    name: { type: String, required: true },
    ingredients: String,
    instructions: String
});

const restaurantSchema = new Schema({
    name: { type: String, required: true },
    details: String
});

const mealPlanSchema = new Schema({
    // Using a Map for flexible date keys (YYYY-MM-DD)
    plan: {
        type: Map,
        of: new Schema({
            Breakfast: { type: { type: String }, itemId: { type: Schema.Types.ObjectId } },
            Lunch: { type: { type: String }, itemId: { type: Schema.Types.ObjectId } },
            Dinner: { type: { type: String }, itemId: { type: Schema.Types.ObjectId } }
        }, { _id: false })
    }
});

// --- Main Household Schema ---

const HouseholdSchema = new Schema({
    name: { type: String, required: true },
    members: [memberSchema],
    // FIX: Add default empty arrays to all subdocument arrays
    tasks: { type: [taskSchema], default: [] },
    calendarEvents: { type: [eventSchema], default: [] },
    rewards: { type: [rewardSchema], default: [] },
    redemptionRequests: { type: [redemptionRequestSchema], default: [] },
    recipes: { type: [recipeSchema], default: [] },
    restaurants: { type: [restaurantSchema], default: [] },
    mealPlan: { type: mealPlanSchema, default: () => ({ plan: new Map() }) }
}, { timestamps: true });

module.exports = mongoose.model('Household', HouseholdSchema);

