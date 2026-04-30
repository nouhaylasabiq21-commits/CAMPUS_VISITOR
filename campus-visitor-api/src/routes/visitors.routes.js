const express = require('express');
const router = express.Router();

const {
  getAllVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
} = require('../controllers/visitors.controller');

const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

router.get('/', authMiddleware, authorizeRoles('admin', 'agent', 'host'), getAllVisitors);
router.get('/:id', authMiddleware, authorizeRoles('admin', 'agent', 'host'), getVisitorById);
router.post('/', authMiddleware, authorizeRoles('admin', 'agent'), createVisitor);
router.put('/:id', authMiddleware, authorizeRoles('admin', 'agent'), updateVisitor);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteVisitor);

module.exports = router;