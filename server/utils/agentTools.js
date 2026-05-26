/**
 * agentTools.js — LangChain Agent Tools + ReAct Chess Analyst Agent
 *
 * Defines two tools for the autonomous chess analyst agent:
 *   1. engine_evaluator  — runs minimax evaluation on a FEN position
 *   2. strategy_retriever — semantic search over the chess knowledge base
 *
 * Exports createChessAnalystAgent() which builds a LangGraph ReAct agent
 * combining both tools with the Gemini LLM.
 */

const { Chess } = require('chess.js');
const { evaluateBoard } = require('./minimax');
const { searchStrategy } = require('./vectorDb');

/**
 * Create the chess analyst ReAct agent with engine + strategy tools.
 * Returns null if LangChain/Gemini is unavailable.
 *
 * @returns {Promise<object|null>} The agent executor, or null if unavailable
 */
async function createChessAnalystAgent() {
  const { llm, langchainAvailable } = require('./geminiClient');

  if (!langchainAvailable || !llm) {
    console.warn('⚠️  Agent unavailable — Gemini LLM not initialized');
    return null;
  }

  try {
    const { DynamicTool } = require('@langchain/core/tools');
    const { createReactAgent } = require('@langchain/langgraph/prebuilt');

    // ── Tool 1: Engine Evaluator ──
    const engineEvaluatorTool = new DynamicTool({
      name: 'engine_evaluator',
      description:
        'Evaluates a chess position given a FEN string. Returns a centipawn score from White\'s perspective. ' +
        'Positive scores favor White, negative scores favor Black. Input should be a valid FEN string.',
      func: async (fen) => {
        try {
          const chess = new Chess(fen.trim());
          const score = evaluateBoard(chess);

          // Provide human-readable evaluation
          let assessment;
          if (score > 300) assessment = 'White has a decisive advantage';
          else if (score > 100) assessment = 'White has a clear advantage';
          else if (score > 30) assessment = 'White has a slight advantage';
          else if (score > -30) assessment = 'The position is roughly equal';
          else if (score > -100) assessment = 'Black has a slight advantage';
          else if (score > -300) assessment = 'Black has a clear advantage';
          else assessment = 'Black has a decisive advantage';

          return JSON.stringify({
            fen: fen.trim(),
            score,
            assessment,
            turn: chess.turn() === 'w' ? 'White' : 'Black',
            isCheck: chess.isCheck(),
            isGameOver: chess.isGameOver(),
          });
        } catch (err) {
          return JSON.stringify({ error: `Invalid FEN or evaluation failed: ${err.message}` });
        }
      },
    });

    // ── Tool 2: Strategy Retriever ──
    const strategyRetrieverTool = new DynamicTool({
      name: 'strategy_retriever',
      description:
        'Searches the chess knowledge base for relevant strategy, tactics, openings, or endgame concepts. ' +
        'Input should be a natural language query about chess (e.g., "knight fork tactics" or "Sicilian Defense ideas"). ' +
        'Returns the top 3 most relevant knowledge entries.',
      func: async (query) => {
        try {
          const results = await searchStrategy(query.trim(), 3);
          if (results.length === 0) {
            return 'No relevant chess knowledge found for this query.';
          }
          return results
            .map((r) => `[${r.category}] ${r.title}: ${r.content}`)
            .join('\n\n');
        } catch (err) {
          return `Strategy search failed: ${err.message}`;
        }
      },
    });

    // ── Build the ReAct Agent ──
    const tools = [engineEvaluatorTool, strategyRetrieverTool];

    const agent = createReactAgent({
      llm,
      tools,
      stateModifier:
        'You are an expert chess analyst. Use the engine_evaluator tool to assess positions ' +
        'and the strategy_retriever tool to find relevant tactical concepts. ' +
        'Provide clear, educational analysis. Always evaluate the position first, then look up relevant strategies. ' +
        'Combine your findings into a concise, helpful explanation.',
    });

    console.log('✅ Chess analyst agent created with 2 tools');
    return agent;
  } catch (err) {
    console.error('❌ Failed to create chess analyst agent:', err.message);
    return null;
  }
}

module.exports = { createChessAnalystAgent };
