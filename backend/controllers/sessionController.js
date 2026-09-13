const { getSessions, saveSessions, deleteSessions } = require('../services/databaseService');

const getUserId = (req) => req.user?.sub;

const handleGetSessions = async (req, res) => {
  const userId = getUserId(req);
  try {
    res.json({ sessions: await getSessions(userId) });
  } catch (error) {
    console.error('Could not load chat sessions:', error.message);
    res.status(503).json({ error: 'Database is unavailable.' });
  }
};

const handleSaveSessions = async (req, res) => {
  const userId = getUserId(req);
  const sessions = req.body?.sessions;
  if (!Array.isArray(sessions) || sessions.length > 100) {
    return res.status(400).json({ error: 'sessions must be an array with at most 100 items.' });
  }

  try {
    await saveSessions(userId, sessions);
    res.status(204).end();
  } catch (error) {
    console.error('Could not save chat sessions:', error.message);
    res.status(503).json({ error: 'Database is unavailable.' });
  }
};

const handleDeleteSessions = async (req, res) => {
  const userId = getUserId(req);
  try {
    await deleteSessions(userId);
    res.status(204).end();
  } catch (error) {
    console.error('Could not delete chat sessions:', error.message);
    res.status(503).json({ error: 'Database is unavailable.' });
  }
};

module.exports = { handleGetSessions, handleSaveSessions, handleDeleteSessions };
