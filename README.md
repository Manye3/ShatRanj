# ShatRanj ♛
**Play. Compete. Evolve.**

ShatRanj is a next-generation real-time multiplayer chess platform. It integrates a MERN stack core with WebRTC video streaming, a custom-built Minimax AI engine, and a suite of advanced **Generative AI features** powered by the **Google Gemini API**, **LangChain**, and **LangGraph**.

---

## 🚀 Key Engineering & Architecture Highlights

### 1. Real-Time Multiplayer Engine
- **Move Synchronization:** Built on **Socket.IO** to handle 50+ concurrent players with sub-100ms state synchronization latency.
- **Server-Side Validation:** All move checks and state transitions are validated on the backend via `chess.js`, protecting against client-side tampering.
- **Server-Managed Clocks:** Accurate server-side timer management supporting multiple time controls (Bullet, Blitz, Rapid) with automatic lag compensation and reconnection handling.

### 2. Custom Minimax AI Engine
- **Alpha-Beta Pruning:** Features a custom-written backend search algorithm in JavaScript, utilizing piece-square evaluation tables and alpha-beta pruning.
- **Blunder Simulation:** Configurable difficulty scaling which mimics human mistakes by selecting suboptimal moves based on a probability curve rather than raw minimax outputs.

### 3. Generative AI Core (The "Wow" Factor)
- 🎭 **Bot Arena (LLM Personalities):** Features 10+ distinct computer opponents (modeled after champions like Vishy Anand, Beth Harmon, Magnus Carlsen, Hikaru Nakamura, and custom personalities like "Danny Rensch" and "Chess Coach"). Powered by **Gemini-1.5-Flash** via system prompts, these bots react in-game with dynamic, in-character commentary based on board events (checks, captures, blunders, and checkmates).
- 🧠 **RAG-Powered Chess Coach:** Performs real-time semantic vector search over a custom strategic chess corpus. Using **Google Gemini Embeddings (`text-embedding-004`)** and LangChain's **MemoryVectorStore**, the system retrieves relevant tactical concepts (e.g., "Sicilian Defense ideas," "knight fork patterns") matching the game's PGN and generates concise, context-aware coaching advice.
- 🕵️ **Autonomous Analyst Agent (LangGraph):** Orchestrates an autonomous post-game analyst agent using **LangGraph** to execute ReAct tool-calling loops. The agent invokes two custom tools:
  1. `engine_evaluator`: Reconstructs the board state FEN and runs backend minimax evaluations (centipawn scoring).
  2. `strategy_retriever`: Queries the vector database for strategic concepts.
  The agent processes these tool outputs to synthesize multi-perspective game critiques.

---

## 📐 System Architecture

```mermaid
graph TD
    subgraph Client (React 18 + Vite + TS)
        C_UI[Chess Board UI]
        C_WebRTC[WebRTC Video Stream]
        C_Socket[Socket.IO Client]
    end

    subgraph Server (Node.js + Express)
        S_Socket[Socket.IO Gateway]
        S_Controller[AI & Game Controllers]
        S_Minimax[Custom Minimax Engine]
    end

    subgraph Database & Vector Store
        DB_Mongo[(MongoDB - Game Logs & Users)]
        VS_Memory[(MemoryVectorStore - Chess Corpus)]
    end

    subgraph GenAI Engine (LangChain & LangGraph)
        AI_Gemini[Gemini-1.5-Flash LLM]
        AI_Agent[LangGraph ReAct Agent]
    end

    C_Socket <-->|Real-Time Moves & Signals| S_Socket
    C_WebRTC <-->|P2P Audio/Video| C_WebRTC
    S_Socket --> S_Controller
    S_Controller --> S_Minimax
    S_Controller -->|Semantic Search| VS_Memory
    S_Controller -->|ReAct Agent Invoke| AI_Agent
    AI_Agent -->|Tool call: engine_eval| S_Minimax
    AI_Agent -->|Tool call: search_vector| VS_Memory
    AI_Agent -->|Synthesis| AI_Gemini
    S_Controller --> DB_Mongo
```

---

## 🛠️ Directory Structure

```
├── client/                 # Frontend App (React 18 + Vite + TS)
│   ├── src/
│   │   ├── ai/             # Client-side minimax fallback engine
│   │   ├── components/     # UI elements (Board, Video Chat, Game Panels)
│   │   ├── context/        # Global Auth & State Management
│   │   ├── hooks/          # Custom hooks for game state & Socket connection
│   │   └── types/          # TypeScript interfaces
│   └── ...
│
├── server/                 # Backend App (Node.js + Express)
│   ├── config/             # DB Connection Config
│   ├── controllers/        # Route logic (Auth, User, AI analysis endpoints)
│   ├── middleware/         # Session validation & CORS handlers
│   ├── models/             # Mongoose schemas (User, Game, Move)
│   ├── routes/             # REST endpoints
│   ├── sockets/            # Socket.IO game loops & signalling
│   ├── utils/              # Main logic modules:
│   │   ├── minimax.js      # Backend chess engine
│   │   ├── agentTools.js   # LangGraph ReAct Agent & custom tool setups
│   │   ├── geminiClient.js # LangChain, Google Gemini API & Embeddings client
│   │   ├── vectorDb.js     # In-memory Vector database initialization
│   │   └── personalityData.js # Bot persona prompts
│   └── server.js           # Server bootstrap & API routes
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/shatranj` |
| `JWT_SECRET` | Secret key for session tokens | `your_secret_key` |
| `PORT` | Backend application port | `4000` |
| `CLIENT_URL` | Frontend URL (CORS authorization) | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` (Leaves AI features in mock mode if unset) |

### Client (`client/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend gateway URL | `http://localhost:4000` |

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB (Local instance or Atlas Connection URI)
- Google Gemini API Key (Optional but required to run AI coaching and analyst features)

### 2. Backend Setup
```bash
cd server
npm install
# Configure your variables in .env (see .env.example)
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Verify server url in .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
