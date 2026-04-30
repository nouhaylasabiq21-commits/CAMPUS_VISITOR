const express = require('express');
const router = express.Router();

const {
  getAllHosts,
  getHostById,
  createHost,
  updateHost,
  deleteHost,
} = require('../controllers/hosts.controller');

const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

router.get('/', authMiddleware, getAllHosts);
router.get('/:id', authMiddleware, getHostById);
router.post('/', authMiddleware, authorizeRoles('admin'), createHost);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateHost);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteHost);

module.exports = router;