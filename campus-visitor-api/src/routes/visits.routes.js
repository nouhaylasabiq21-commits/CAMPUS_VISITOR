const express = require('express');
const router = express.Router();

const {
  getAllVisits,
  getVisitById,
  createVisit,
  updateVisit,
  updateVisitStatus,
  checkInVisit,
  checkOutVisit,
  getDashboardStats,
} = require('../controllers/visits.controller');

const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

router.get('/', authMiddleware, getAllVisits);
router.get('/dashboard/stats', authMiddleware, authorizeRoles('admin', 'agent', 'host'), getDashboardStats);
router.get('/:id', authMiddleware, getVisitById);

router.post('/', authMiddleware, createVisit);
router.put('/:id', authMiddleware, updateVisit);

router.patch('/:id/status', authMiddleware, authorizeRoles('admin', 'agent', 'host'), updateVisitStatus);
router.post('/:id/check-in', authMiddleware, authorizeRoles('admin', 'agent'), checkInVisit);
router.post('/:id/check-out', authMiddleware, authorizeRoles('admin', 'agent'), checkOutVisit);

module.exports = router;