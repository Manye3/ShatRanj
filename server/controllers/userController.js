const User = require('../models/User');
const Game = require('../models/Game');
const mongoose = require('mongoose');
const memStore = require('../utils/memoryStore');

function isDBConnected() {
  return mongoose.connection.readyState === 1;
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

async function getProfile(req, res) {
  try {
    if (isDBConnected()) {
      const user = await User.findOne({ username: req.params.username });
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user.toPublic());
    } else {
      const user = memStore.users.get(req.params.username);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(toPublic(user));
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getGameHistory(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    if (isDBConnected()) {
      const user = await User.findOne({ username: req.params.username });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const skip = (page - 1) * limit;
      const filter = {
        $or: [{ 'white.userId': user._id }, { 'black.userId': user._id }],
      };

      const [games, total] = await Promise.all([
        Game.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Game.countDocuments(filter),
      ]);

      return res.json({ games, total, page, pages: Math.ceil(total / limit) });
    } else {
      // In-memory: filter games by username
      const username = req.params.username;
      const allGames = memStore.games.filter(
        g => g.white.username === username || g.black.username === username
      );
      const total = allGames.length;
      const skip = (page - 1) * limit;
      const games = allGames.slice(skip, skip + limit);
      return res.json({ games, total, page, pages: Math.ceil(total / limit) || 1 });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getLeaderboard(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    if (isDBConnected()) {
      const users = await User.find({})
        .sort({ rating: -1 })
        .limit(limit)
        .select('username rating wins losses draws gamesPlayed');
      return res.json(users);
    } else {
      const users = Array.from(memStore.users.values())
        .map(toPublic)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
      return res.json(users);
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getProfile, getGameHistory, getLeaderboard };
