const { generateResponse } = require('../services/chatService');

const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body || {};
    const file = req.file;

    if ((!message || message.trim() === '') && !file) {
      return res.status(400).json({
        type: 'text',
        reply: 'Please type a message or upload an image.',
      });
    }

    let parsedHistory = [];
    if (Array.isArray(history)) {
      parsedHistory = history;
    } else if (typeof history === 'string') {
      try {
        parsedHistory = JSON.parse(history);
      } catch (error) {
        parsedHistory = [];
      }
    }

    const responseData = await generateResponse(message, file, parsedHistory);
    res.json(responseData);
  } catch (error) {
    console.error('Error handling chat request:', error);
    res.status(500).json({
      type: 'text',
      reply: 'Internal server error. Please try again later.',
    });
  }
};

module.exports = { handleChat };