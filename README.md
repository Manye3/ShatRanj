# ShatRanj ♛

**Play. Compete. Evolve.**

A real-time multiplayer chess platform built with the MERN stack, featuring a custom Minimax AI engine, WebRTC video chat, and FIDE-style Elo ratings.

## Tech Stack

### Frontend (`/client`)
- React 18 + Vite + TypeScript
- Tailwind CSS
- `react-chessboard` — interactive drag & drop board
- `chess.js` — move generation & validation
- `socket.io-client` — real-time communication
- WebRTC — peer-to-peer video chat

### Backend (`/server`)
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO — real-time game state, clocks, signaling
- JWT (httpOnly cookies) + bcrypt — secure authentication
- Custom Minimax AI with alpha-beta pruning

## Features

- ♟️ Real-time multiplayer chess with **server-side move validation**
- ⏱️ **Server-managed clocks** — Bullet (1+0), Blitz (3+2), Rapid (10+0)
- 🤖 **Custom Minimax AI** — alpha-beta pruning + piece-square tables, 3 difficulty levels
- 📹 **WebRTC Video Chat** — play face-to-face with your opponent
- 🏆 **FIDE-style Elo rating system** with K-factor brackets
- 💬 In-game text chat
- 🔐 JWT auth with bcrypt password hashing
- 🎮 Game controls — resign, draw offers, rematch
- 📊 Player profiles with match history
- 📱 Fully responsive (mobile + desktop)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd server
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

### Server (`server/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/shatranj` |
| `JWT_SECRET` | Secret for JWT tokens | — |
| `PORT` | Server port | `4000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Client (`client/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend URL | `http://localhost:4000` |

## Architecture

```
├── client/             # React + Vite + TypeScript
│   ├── src/
│   │   ├── ai/         # Minimax engine (client-side for vs AI)
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth context
│   │   ├── hooks/      # Custom hooks (chess game, sound)
│   │   ├── lib/        # API client, socket singleton
│   │   ├── pages/      # Route pages
│   │   └── types/      # TypeScript interfaces
│   └── ...
│
├── server/             # Node.js + Express
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/      # JWT auth
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── sockets/        # Socket.IO game handler
│   ├── utils/          # Minimax AI, Elo calculator
│   └── server.js       # Entry point
└── ...
```

## Phase 2 (Planned)
- 🧠 AI Post-Match Summarizer (Game.aiSummary field ready)
- 🐳 Docker containerization
- 🔄 CI/CD pipeline
