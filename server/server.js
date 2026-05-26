require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { initVectorStore } = require('./utils/vectorDb');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const setupSockets = require('./sockets/socketHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Socket.IO setup
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSockets(io);

// Start server and initialize RAG vector store
const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI)
  .then(() => {
    return initVectorStore();
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║       ♛ ShatRanj Server v2.0         ║
║───────────────────────────────────────║
║  Port:   ${String(PORT).padEnd(28)}║
║  Mode:   ${(process.env.NODE_ENV || 'development').padEnd(28)}║
║  Client: ${(process.env.CLIENT_URL || 'http://localhost:5173').padEnd(28)}║
╚═══════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    // Still initialize vector store and start server without DB
    initVectorStore().then(() => {
      server.listen(PORT, () => {
        console.log(`Server running on ${PORT} (DB not connected — some features unavailable)`);
      });
    });
  });
