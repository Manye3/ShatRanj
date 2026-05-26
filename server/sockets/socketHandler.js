const { v4: uuidv4 } = require('uuid');
const { Chess } = require('chess.js');
const User = require('../models/User');
const Game = require('../models/Game');
const { calculateElo } = require('../utils/elo');

// In-memory room storage
const rooms = {};

function parseTimeControl(tc) {
  const [base, inc] = tc.split('+').map(Number);
  return { baseMs: base * 60 * 1000, incrementMs: (inc || 0) * 1000 };
}

function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── Create Room ──
    socket.on('createRoom', ({ username, timeControl }) => {
      if (!username || !timeControl) {
        return socket.emit('error', { message: 'Username and time control required' });
      }

      const roomId = uuidv4().slice(0, 8);
      const { baseMs, incrementMs } = parseTimeControl(timeControl);

      rooms[roomId] = {
        id: roomId,
        players: [{ socketId: socket.id, username, color: 'w' }],
        game: new Chess(),
        timeControl,
        whiteTimeMs: baseMs,
        blackTimeMs: baseMs,
        incrementMs,
        clockInterval: null,
        lastMoveTimestamp: 0,
        drawOfferedBy: null,
        gameOver: false,
        rematchRequests: new Set(),
      };

      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;
      socket.playerColor = 'w';

      socket.emit('roomCreated', { roomId, timeControl });
      console.log(`[Game] ${username} created room ${roomId} (${timeControl})`);
    });

    // ── Join Room ──
    socket.on('joinRoom', ({ roomId, username }) => {
      const room = rooms[roomId];
      if (!room) return socket.emit('error', { message: 'Room not found' });

      // Handle creator re-entering game page (they already have a player entry)
      const existingPlayer = room.players.find(
        p => p.socketId === socket.id || p.username === username
      );
      if (existingPlayer) {
        // Update socket reference and re-join the socket.io room
        existingPlayer.socketId = socket.id;
        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = username;
        socket.playerColor = existingPlayer.color;
        // If game already has 2 players, re-send gameStart to this socket
        if (room.players.length === 2) {
          const white = room.players.find(p => p.color === 'w');
          const black = room.players.find(p => p.color === 'b');
          socket.emit('gameStart', {
            roomId,
            white: { username: white.username, rating: white.rating || 1200 },
            black: { username: black.username, rating: black.rating || 1200 },
            fen: room.game.fen(),
            timeControl: room.timeControl,
            whiteTimeMs: room.whiteTimeMs,
            blackTimeMs: room.blackTimeMs,
          });
        }
        return;
      }

      if (room.players.length >= 2) return socket.emit('error', { message: 'Room is full' });

      room.players.push({ socketId: socket.id, username, color: 'b' });
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;
      socket.playerColor = 'b';

      // Emit game start to both players
      io.to(roomId).emit('gameStart', {
        roomId,
        white: { username: room.players[0].username, rating: room.players[0].rating || 1200 },
        black: { username: room.players[1].username, rating: room.players[1].rating || 1200 },
        fen: room.game.fen(),
        timeControl: room.timeControl,
        whiteTimeMs: room.whiteTimeMs,
        blackTimeMs: room.blackTimeMs,
      });

      // Load actual ratings from DB
      loadPlayerRatings(room);

      startClock(io, room);
      console.log(`[Game] ${username} joined room ${roomId}. Game starting!`);
    });

    // ── Make Move ──
    socket.on('makeMove', ({ roomId, move }) => {
      const room = rooms[roomId];
      if (!room || room.gameOver) return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return socket.emit('error', { message: 'Not in this room' });

      const turn = room.game.turn();
      if (turn !== player.color) {
        return socket.emit('error', { message: 'Not your turn' });
      }

      // Try the move
      let result;
      try {
        result = room.game.move(move);
      } catch {
        return socket.emit('error', { message: 'Invalid move' });
      }
      if (!result) return socket.emit('error', { message: 'Invalid move' });

      // Clock: deduct time + add increment
      const now = Date.now();
      if (room.lastMoveTimestamp > 0) {
        const elapsed = now - room.lastMoveTimestamp;
        if (turn === 'w') {
          room.whiteTimeMs = Math.max(0, room.whiteTimeMs - elapsed) + room.incrementMs;
        } else {
          room.blackTimeMs = Math.max(0, room.blackTimeMs - elapsed) + room.incrementMs;
        }
      }
      room.lastMoveTimestamp = now;
      room.drawOfferedBy = null;

      io.to(roomId).emit('moveMade', {
        move: result,
        fen: room.game.fen(),
        pgn: room.game.pgn(),
        turn: room.game.turn(),
        whiteTimeMs: room.whiteTimeMs,
        blackTimeMs: room.blackTimeMs,
      });

      // Check game-over conditions
      if (room.game.isGameOver()) {
        let gameResult, termination;
        if (room.game.isCheckmate()) {
          // After the move, it's the OTHER player's turn — they're checkmated
          // So the player who just moved (turn before move = `turn`) wins
          gameResult = turn === 'w' ? 'white_win' : 'black_win';
          termination = 'checkmate';
        } else if (room.game.isStalemate()) {
          gameResult = 'draw';
          termination = 'stalemate';
        } else if (room.game.isThreefoldRepetition()) {
          gameResult = 'draw';
          termination = 'threefold_repetition';
        } else if (room.game.isInsufficientMaterial()) {
          gameResult = 'draw';
          termination = 'insufficient_material';
        } else {
          gameResult = 'draw';
          termination = 'fifty_move_rule';
        }
        handleGameOver(io, room, gameResult, termination);
      }
    });

    // ── Resign ──
    socket.on('resign', ({ roomId }) => {
      const room = rooms[roomId];
      if (!room || room.gameOver) return;
      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      const result = player.color === 'w' ? 'black_win' : 'white_win';
      handleGameOver(io, room, result, 'resignation');
    });

    // ── Draw Offer ──
    socket.on('offerDraw', ({ roomId }) => {
      const room = rooms[roomId];
      if (!room || room.gameOver) return;
      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      room.drawOfferedBy = player.color;
      const opponent = room.players.find(p => p.color !== player.color);
      if (opponent) {
        io.to(opponent.socketId).emit('drawOffered', { by: player.username });
      }
    });

    socket.on('acceptDraw', ({ roomId }) => {
      const room = rooms[roomId];
      if (!room || room.gameOver || !room.drawOfferedBy) return;
      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || room.drawOfferedBy === player.color) return;

      handleGameOver(io, room, 'draw', 'draw_agreement');
    });

    socket.on('declineDraw', ({ roomId }) => {
      const room = rooms[roomId];
      if (room) room.drawOfferedBy = null;
    });

    // ── Rematch ──
    socket.on('requestRematch', ({ roomId }) => {
      const room = rooms[roomId];
      if (!room || !room.gameOver) return;

      room.rematchRequests.add(socket.username);

      if (room.rematchRequests.size >= 2) {
        // Swap colors, reset game
        const { baseMs, incrementMs } = parseTimeControl(room.timeControl);
        const p0 = room.players[0];
        const p1 = room.players[1];
        // Swap colors
        [p0.color, p1.color] = [p1.color, p0.color];

        room.game = new Chess();
        room.whiteTimeMs = baseMs;
        room.blackTimeMs = baseMs;
        room.incrementMs = incrementMs;
        room.lastMoveTimestamp = 0;
        room.drawOfferedBy = null;
        room.gameOver = false;
        room.rematchRequests.clear();

        const white = room.players.find(p => p.color === 'w');
        const black = room.players.find(p => p.color === 'b');

        io.to(roomId).emit('gameStart', {
          roomId,
          white: { username: white.username, rating: white.rating || 1200 },
          black: { username: black.username, rating: black.rating || 1200 },
          fen: room.game.fen(),
          timeControl: room.timeControl,
          whiteTimeMs: room.whiteTimeMs,
          blackTimeMs: room.blackTimeMs,
        });

        startClock(io, room);
        console.log(`[Game] Rematch in room ${roomId}! Colors swapped.`);
      } else {
        const opponent = room.players.find(p => p.username !== socket.username);
        if (opponent) {
          io.to(opponent.socketId).emit('rematchRequested', { by: socket.username });
        }
      }
    });

    // ── WebRTC Signaling (preserved from old project) ──
    socket.on('signal', ({ roomId, data }) => {
      socket.to(roomId).emit('signal', { from: socket.id, data });
    });

    // ── Chat ──
    socket.on('sendMessage', ({ roomId, text }) => {
      if (!text || !text.trim()) return;
      io.to(roomId).emit('chatMessage', {
        username: socket.username || 'Anonymous',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      });
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      const roomId = socket.roomId;
      if (roomId && rooms[roomId] && !rooms[roomId].gameOver) {
        const room = rooms[roomId];
        const player = room.players.find(p => p.socketId === socket.id);
        if (player && room.players.length === 2) {
          // Forfeit after 15s disconnect
          const grace = setTimeout(() => {
            if (!rooms[roomId] || rooms[roomId].gameOver) return;
            const result = player.color === 'w' ? 'black_win' : 'white_win';
            handleGameOver(io, rooms[roomId], result, 'abandonment');
          }, 15000);

          io.to(roomId).emit('opponentDisconnected', {
            username: player.username,
            gracePeriodMs: 15000,
          });

          socket.disconnectTimeout = grace;
        } else {
          // Solo room, just clean up
          delete rooms[roomId];
        }
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

// ── Clock Management ──
function startClock(io, room) {
  room.lastMoveTimestamp = Date.now();
  let lastTick = Date.now();

  room.clockInterval = setInterval(() => {
    if (room.gameOver) {
      clearInterval(room.clockInterval);
      return;
    }

    const now = Date.now();
    const elapsed = now - room.lastMoveTimestamp;
    const turn = room.game.turn();

    const whiteTime = turn === 'w'
      ? Math.max(0, room.whiteTimeMs - elapsed) : room.whiteTimeMs;
    const blackTime = turn === 'b'
      ? Math.max(0, room.blackTimeMs - elapsed) : room.blackTimeMs;

    // Timeout check
    if (whiteTime <= 0) {
      room.whiteTimeMs = 0;
      handleGameOver(io, room, 'black_win', 'timeout');
      return;
    }
    if (blackTime <= 0) {
      room.blackTimeMs = 0;
      handleGameOver(io, room, 'white_win', 'timeout');
      return;
    }

    // Emit clock tick every ~1s
    if (now - lastTick >= 1000) {
      io.to(room.id).emit('clockTick', {
        whiteTimeMs: Math.round(whiteTime),
        blackTimeMs: Math.round(blackTime),
      });
      lastTick = now;
    }
  }, 100);
}

// ── Game Over Handler ──
async function handleGameOver(io, room, result, termination) {
  if (room.gameOver) return;
  room.gameOver = true;

  if (room.clockInterval) {
    clearInterval(room.clockInterval);
    room.clockInterval = null;
  }

  const white = room.players.find(p => p.color === 'w');
  const black = room.players.find(p => p.color === 'b');
  if (!white || !black) return;

  const pgn = room.game.pgn();
  const moves = room.game.history().length;

  // Calculate Elo changes
  const whiteRating = white.rating || 1200;
  const blackRating = black.rating || 1200;
  const elo = calculateElo(whiteRating, blackRating, result);

  // Save to DB (non-blocking, don't crash if DB is down)
  saveGame(room, white, black, result, termination, pgn, moves, elo).catch(
    err => console.error('[DB] Failed to save game:', err.message)
  );

  io.to(room.id).emit('gameOver', {
    result,
    termination,
    pgn,
    moves,
    whiteRatingDelta: elo.whiteDelta,
    blackRatingDelta: elo.blackDelta,
    whiteNewRating: elo.whiteNew,
    blackNewRating: elo.blackNew,
  });

  console.log(
    `[Game] Over in ${room.id}: ${result} by ${termination}. ` +
    `White ${elo.whiteDelta > 0 ? '+' : ''}${elo.whiteDelta}, ` +
    `Black ${elo.blackDelta > 0 ? '+' : ''}${elo.blackDelta}`
  );

  // Clean up room after 5 min
  setTimeout(() => {
    if (rooms[room.id]?.gameOver && rooms[room.id].rematchRequests.size === 0) {
      delete rooms[room.id];
    }
  }, 5 * 60 * 1000);
}

async function saveGame(room, white, black, result, termination, pgn, moves, elo) {
  const whiteUser = await User.findOne({ username: white.username });
  const blackUser = await User.findOne({ username: black.username });
  if (!whiteUser || !blackUser) return;

  // Update ratings and stats
  whiteUser.rating = elo.whiteNew;
  blackUser.rating = elo.blackNew;
  whiteUser.gamesPlayed += 1;
  blackUser.gamesPlayed += 1;

  if (result === 'white_win') {
    whiteUser.wins += 1;
    blackUser.losses += 1;
  } else if (result === 'black_win') {
    blackUser.wins += 1;
    whiteUser.losses += 1;
  } else {
    whiteUser.draws += 1;
    blackUser.draws += 1;
  }

  await Promise.all([whiteUser.save(), blackUser.save()]);

  // Save game record with PGN (Phase 2 reads this for AI summary)
  await Game.create({
    white: { userId: whiteUser._id, username: white.username, rating: elo.whiteNew },
    black: { userId: blackUser._id, username: black.username, rating: elo.blackNew },
    result,
    termination,
    pgn,
    timeControl: room.timeControl,
    moves,
    whiteRatingDelta: elo.whiteDelta,
    blackRatingDelta: elo.blackDelta,
  });

  // Update in-memory ratings for rematch
  white.rating = elo.whiteNew;
  black.rating = elo.blackNew;
}

async function loadPlayerRatings(room) {
  try {
    for (const player of room.players) {
      const user = await User.findOne({ username: player.username });
      if (user) player.rating = user.rating;
    }
  } catch { /* DB might not be connected */ }
}

module.exports = setupSockets;
