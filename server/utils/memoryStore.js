// Shared in-memory store for development without MongoDB
// When MongoDB is connected, these are not used
const users = new Map();
const games = [];

module.exports = { users, games };
