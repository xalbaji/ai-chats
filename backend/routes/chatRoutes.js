const express = require('express');
const router = express.Router();
const multer = require('multer');
// ⬆️ ADDED: Imported multer above to handle file uploads.

const { handleChat } = require('../controllers/chatController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});
// ⬆️ ADDED: Configured multer memory storage above to store uploaded files in memory buffers.

// POST /api/chat
router.post('/', upload.any(), handleChat);
// ⬆️ MODIFIED: Added `upload.single('image')` middleware above to intercept image uploads under the key 'image'.

module.exports = router;
