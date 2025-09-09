const express = require('express');
const householdController = require('../controllers/household.controller');
const { protect, isHouseholdMember } = require('../middleware/auth.middleware');

// Import sub-routers
const memberRouter = require('./member.routes');
const taskRouter = require('./task.routes');
const calendarRouter = require('./calendar.routes');
const rewardRouter = require('./reward.routes');
const mealPlannerRouter = require('./mealPlanner.routes');

const householdRouter = express.Router();

// --- Main Household Route ---
// Handles GET requests directly to /api/households/:householdId
householdRouter.get(
    '/:householdId',
    (req, res, next) => {
        console.log(`[ household.routes.js ] - Handling GET request for householdId: ${req.params.householdId}`);
        next();
    },
    protect,
    isHouseholdMember,
    householdController.getHouseholdDetails
);

// --- Mount Sub-Routers ---
// Each sub-router is now mounted on its own specific path prefix.
householdRouter.use(
    '/:householdId/members',
    (req, res, next) => {
        console.log(`[ household.routes.js ] - Routing to members sub-router for householdId: ${req.params.householdId}`);
        next();
    },
    protect,
    isHouseholdMember,
    memberRouter
);
householdRouter.use(
    '/:householdId/tasks',
    (req, res, next) => {
        console.log(`[ household.routes.js ] - Routing to tasks sub-router for householdId: ${req.params.householdId}`);
        next();
    },
    protect,
    isHouseholdMember,
    taskRouter
);
householdRouter.use(
    '/:householdId/events',
    (req, res, next) => {
        console.log(`[ household.routes.js ] - Routing to events sub-router for householdId: ${req.params.householdId}`);
        next();
    },
    protect,
    isHouseholdMember,
    calendarRouter
);
householdRouter.use(
    '/:householdId/rewards',
    (req, res, next) => {
        console.log(`[ household.routes.js ] - Routing to rewards sub-router for householdId: ${req.params.householdId}`);
        next();
    },
    protect,
    isHouseholdMember,
    rewardRouter
);
householdRouter.use(
    '/:householdId/meal-planner',
    (req, res, next) => {
        console.log(`[ household.routes.js ] - Routing to meal-planner sub-router for householdId: ${req.params.householdId}`);
        next();
    },
    protect,
    isHouseholdMember,
    mealPlannerRouter
);

module.exports = householdRouter;

