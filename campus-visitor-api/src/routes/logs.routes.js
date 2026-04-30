const express = require('express');
const router = express.Router();

const { getAllLogs, getLogsByVisitId } = require('../controllers/logs.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

router.get('/', authMiddleware, authorizeRoles('admin', 'agent', 'host'), getAllLogs);
router.get('/:visit_id', authMiddleware, authorizeRoles('admin', 'agent', 'host'), getLogsByVisitId);

module.exports = router;