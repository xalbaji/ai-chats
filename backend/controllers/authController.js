const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../services/databaseService');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const createToken = (user) => jwt.sign(
  { sub: user._id.toString(), email: user.email, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: '7d' },
);

const publicUser = (user) => ({ id: user._id.toString(), email: user.email, name: user.name });

const isMongoAuthError = (error) => /bad auth|authentication failed|auth failed/i.test(error?.message || '');

const databaseErrorResponse = (res, error) => {
  if (isMongoAuthError(error)) {
    return res.status(503).json({
      error: 'MongoDB authentication failed. Check the Atlas database username, password, and MONGODB_URI in Render.',
    });
  }
  return res.status(503).json({ error: 'Database is unavailable.' });
};

const register = async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 80);
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Enter a name, valid email, and password of at least 8 characters.' });
  }

  try {
    if (await findUserByEmail(email)) return res.status(409).json({ error: 'An account with that email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({
      name,
      email,
      passwordHash,
      createdAt: new Date(),
      accountId: crypto.randomUUID(),
    });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'An account with that email already exists.' });
    console.error('Registration failed:', error.message);
    return databaseErrorResponse(res, error);
  }
};

const login = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return databaseErrorResponse(res, error);
  }
};

module.exports = { register, login };
