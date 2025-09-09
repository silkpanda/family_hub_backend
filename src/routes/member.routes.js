const express = require('express');
const memberController = require('../controllers/member.controller');

const memberRouter = express.Router({ mergeParams: true });

// The base path (/api/households/:householdId/members) is now handled by the main household router.
// These routes are relative to that base path.
memberRouter.post('/', memberController.addMember);
memberRouter.put('/:memberId', memberController.updateMember);
memberRouter.delete('/:memberId', memberController.deleteMember);
memberRouter.post('/:memberId/link-calendar', memberController.linkCalendar);
memberRouter.put('/:memberId/color', memberController.updateMemberColor);

module.exports = memberRouter;

