const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const memStore = require('../utils/memoryStore');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id || user._id || user.username, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function toPublic(user) {
  return {
    id: user.id || user._id || user.username,
    username: user.username,
    rating: user.rating || 1200,
    wins: user.wins || 0,
    losses: user.losses || 0,
    draws: user.draws || 0,
    gamesPlayed: user.gamesPlayed || 0,
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username must be 3-20 characters' });
    }
    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }

    if (isDBConnected()) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({ message: 'Username already taken' });
      }
      const user = await User.create({ username, passwordHash: password });
      const token = makeToken(user);
      res.cookie('token', token, COOKIE_OPTIONS);
      return res.status(201).json(user.toPublic());
    } else {
      if (memStore.users.has(username)) {
        return res.status(409).json({ message: 'Username already taken' });
      }
      const user = {
        id: username,
        username,
        password,
        rating: 1200, wins: 0, losses: 0, draws: 0, gamesPlayed: 0,
        createdAt: new Date().toISOString(),
      };
      memStore.users.set(username, user);
      const token = makeToken(user);
      res.cookie('token', token, COOKIE_OPTIONS);
      return res.status(201).json(toPublic(user));
    }
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (isDBConnected()) {
      const user = await User.findOne({ username });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const valid = await user.comparePassword(password);
      if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
      const token = makeToken(user);
      res.cookie('token', token, COOKIE_OPTIONS);
      return res.json(user.toPublic());
    } else {
      const user = memStore.users.get(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = makeToken(user);
      res.cookie('token', token, COOKIE_OPTIONS);
      return res.json(toPublic(user));
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

function logout(req, res) {
  res.clearCookie('token', COOKIE_OPTIONS);
  return res.json({ message: 'Logged out' });
}

async function me(req, res) {
  try {
    if (isDBConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user.toPublic());
    } else {
      const user = memStore.users.get(req.user.username);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(toPublic(user));
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login, logout, me };
