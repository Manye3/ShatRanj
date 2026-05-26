const { Chess } = require('chess.js');
const { computeBestMove } = require('../utils/minimax');
const { getAllPersonalities } = require('../utils/personalityData');
const { generatePersonalityChat, generateMoveAnalysis } = require('../utils/geminiClient');
const { searchStrategy } = require('../utils/vectorDb');
const { createChessAnalystAgent } = require('../utils/agentTools');

// Cache the agent instance so we don't recreate it on every request
let agentInstance = null;

// ── Existing: Compute AI move (Minimax engine) ──
async function suggestMove(req, res) {
  try {
    const { fen, level } = req.body;
    if (!fen) return res.status(400).json({ error: 'FEN string required' });

    const chess = new Chess(fen);
    if (chess.isGameOver()) {
      return res.status(400).json({ error: 'Game is already over' });
    }

    const move = computeBestMove(chess, level || 2);
    if (!move) {
      return res.status(400).json({ error: 'No legal moves available' });
    }

    return res.json({ move, fen: chess.fen() });
  } catch (err) {
    console.error('AI error:', err);
    return res.status(500).json({ error: 'Failed to compute move' });
  }
}

// ── Phase 2: Get all bot personalities (public, without system prompts) ──
async function getPersonalities(req, res) {
  try {
    const list = getAllPersonalities();
    return res.json(list);
  } catch (err) {
    console.error('Personalities error:', err);
    return res.status(500).json({ error: 'Failed to load personalities' });
  }
}

// ── Phase 2: Generate in-game chat commentary from a bot persona ──
async function getPersonalityChat(req, res) {
  try {
    const { personalityId, gameContext } = req.body;
    if (!personalityId) {
      return res.status(400).json({ error: 'personalityId required' });
    }

    const message = await generatePersonalityChat(personalityId, gameContext || {});
    return res.json({ message });
  } catch (err) {
    console.error('Personality chat error:', err);
    return res.status(500).json({ error: 'Failed to generate chat', message: 'Good move!' });
  }
}

// ── Phase 2: RAG-powered move analysis (with optional agent mode) ──
async function explainMove(req, res) {
  try {
    const { pgn, moveIndex } = req.body;
    const useAgent = req.query.agent === 'true';

    if (!pgn || moveIndex === undefined) {
      return res.status(400).json({ error: 'pgn and moveIndex required' });
    }

    // Parse the PGN to extract the specific move and surrounding context
    const moves = pgn
      .replace(/\d+\.\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(m => m && !['1-0', '0-1', '1/2-1/2', '*'].includes(m));

    const targetMove = moves[moveIndex] || 'unknown';
    const moveContext = moves.slice(Math.max(0, moveIndex - 4), moveIndex + 2).join(' ');

    // ── Agent Mode (Phase 2.2) ──
    if (useAgent) {
      let analysis;
      try {
        // Lazily create the agent
        if (!agentInstance) {
          agentInstance = await createChessAnalystAgent();
        }

        if (agentInstance) {
          // Reconstruct FEN at the target move for the engine tool
          const chess = new Chess();
          for (let i = 0; i <= moveIndex && i < moves.length; i++) {
            try { chess.move(moves[i]); } catch { break; }
          }
          const fen = chess.fen();

          const result = await agentInstance.invoke({
            messages: [{
              role: 'user',
              content: `Analyze move ${moveIndex + 1} (${targetMove}) from this chess game. ` +
                       `The move sequence around it is: ${moveContext}. ` +
                       `The position FEN after this move is: ${fen}. ` +
                       `The full PGN is: ${pgn}. ` +
                       `Use your tools to evaluate the position and find relevant strategy, then provide your analysis.`,
            }],
          });

          // Extract the final text response from the agent
          const agentMessages = result.messages || [];
          const lastMessage = agentMessages[agentMessages.length - 1];
          analysis = lastMessage?.content || lastMessage?.text || 'Agent analysis complete.';
        } else {
          // Agent not available, fall through to RAG
          analysis = null;
        }
      } catch (err) {
        console.error('Agent analysis error:', err.message);
        analysis = null;
      }

      if (analysis) {
        return res.json({ analysis, mode: 'agent' });
      }
      // Fall through to RAG if agent failed
    }

    // ── RAG Mode (Phase 2.1) ──
    // Step 1: Search the vector store for relevant strategy
    const searchQuery = `${targetMove} ${moveContext}`;
    const retrievedDocs = await searchStrategy(searchQuery, 3);

    // Step 2: Generate the analysis using the LLM with retrieved context
    const analysis = await generateMoveAnalysis(pgn, moveIndex, retrievedDocs);

    return res.json({ analysis, mode: 'rag' });
  } catch (err) {
    console.error('Coach analysis error:', err);
    return res.status(500).json({
      error: 'Failed to analyze move',
      analysis: 'Unable to analyze this move right now. Please try again.',
    });
  }
}

module.exports = { suggestMove, getPersonalities, getPersonalityChat, explainMove };
