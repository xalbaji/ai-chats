const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  handleGetSessions,
  handleSaveSessions,
  handleDeleteSessions,
} = require('../controllers/sessionController');

const router = express.Router();
router.use(requireAuth);

router.get('/', handleGetSessions);
router.put('/', handleSaveSessions);
router.delete('/', handleDeleteSessions);

module.exports = router;
