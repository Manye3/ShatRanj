/**
 * geminiClient.js — LangChain + Google Gemini Integration
 *
 * Provides the LLM, embeddings, and two high-level generation functions:
 *   - generatePersonalityChat: produces in-character bot commentary
 *   - generateMoveAnalysis: produces RAG-powered coaching explanations
 *
 * Falls back to realistic mock responses when GEMINI_API_KEY is missing.
 */

const { getPersonalityById } = require('./personalityData');

let llm = null;
let embeddings = null;
let langchainAvailable = false;

// ── Lazy-initialize LangChain modules only when the API key exists ──
try {
  if (process.env.GEMINI_API_KEY) {
    const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
    const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

    llm = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      apiKey: process.env.GEMINI_API_KEY,
    });

    embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'text-embedding-004',
      apiKey: process.env.GEMINI_API_KEY,
    });

    langchainAvailable = true;
    console.log('✅ Gemini LLM & Embeddings initialized');
  } else {
    console.warn('⚠️  GEMINI_API_KEY not set — using mock responses');
  }
} catch (err) {
  console.error('❌ Failed to initialize Gemini:', err.message);
}

// ── Mock response generators (used when API key is absent) ──────────

const MOCK_CHAT = {
  vishy: "A beautiful game unfolds move by move. Let's enjoy the journey together, my friend.",
  pragg: "Oh, this is getting interesting! I think there's a nice tactic here.",
  gukesh: 'Interesting position.',
  vidit: "Chat, did you see that move?! That's content right there!",
  magnus: "Interesting… but I've seen better.",
  hikaru: 'Chat, is that a blunder? Takes takes takes, easy game.',
  beth: 'You play well... for an amateur. But this game is far from over.',
  danny: "Oooh, you didn't see that coming, did you? Five bucks says you can't handle what's next!",
  coach: 'Good developing move! Notice how this helps control the center and connects your pieces.',
  bob: "Wait, the horsey moves in an L, right? I meant to do that... I think.",
};

/**
 * Generate a mock chat message that matches the persona style.
 */
function getMockChat(personalityId, gameContext) {
  const base = MOCK_CHAT[personalityId] || 'Good move! Let me think about my response.';
  if (gameContext && gameContext.event === 'game_over') {
    const endings = {
      vishy: 'What a beautiful game. It was a pleasure playing with you.',
      pragg: 'Great game! That was really fun!',
      gukesh: 'Good game.',
      vidit: 'GG chat! Don\'t forget to like and subscribe!',
      magnus: 'Well played. Not many people make it this far against me.',
      hikaru: 'GG! Easy clap. Chat, was that clean or what?',
      beth: 'A fair contest. Until next time.',
      danny: 'Good game, good game! Double or nothing next round?',
      coach: 'Well played! Let\'s review the key moments from this game.',
      bob: 'Wait, it\'s over? Did I win? ...Oh. Well, that was fun anyway!',
    };
    return endings[personalityId] || 'Good game!';
  }
  return base;
}

/**
 * Generate personality chat using Gemini or fall back to mock.
 *
 * @param {string} personalityId - Bot personality slug
 * @param {object} gameContext    - { playerMove, aiMove, event, fen, moveNumber }
 * @returns {Promise<string>}     Chat message string
 */
async function generatePersonalityChat(personalityId, gameContext = {}) {
  const personality = getPersonalityById(personalityId);
  if (!personality) {
    return 'Good move! Let me think about my response.';
  }

  // Fall back to mock if no LLM
  if (!langchainAvailable || !llm) {
    return getMockChat(personalityId, gameContext);
  }

  try {
    const { ChatPromptTemplate } = require('@langchain/core/prompts');
    const { StringOutputParser } = require('@langchain/core/output_parsers');

    // Build context description for the prompt
    const contextParts = [];
    if (gameContext.moveNumber) contextParts.push(`Move ${gameContext.moveNumber}`);
    if (gameContext.playerMove) contextParts.push(`The player just played: ${gameContext.playerMove}`);
    if (gameContext.aiMove) contextParts.push(`You (the bot) just played: ${gameContext.aiMove}`);
    if (gameContext.event) contextParts.push(`Game event: ${gameContext.event}`);
    if (gameContext.fen) contextParts.push(`Current position (FEN): ${gameContext.fen}`);
    const contextStr = contextParts.length > 0
      ? contextParts.join('. ') + '.'
      : 'The game has just started.';

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', personality.systemPrompt],
      ['human', 'React to this chess game situation in character: {context}'],
    ]);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const response = await chain.invoke({ context: contextStr });

    return response.trim();
  } catch (err) {
    console.error('Gemini chat error, falling back to mock:', err.message);
    return getMockChat(personalityId, gameContext);
  }
}

/**
 * Generate move analysis using Gemini + RAG context, or fall back to mock.
 *
 * @param {string} pgn             - Game PGN string
 * @param {number} moveIndex       - Index of the move to analyze
 * @param {Array}  retrievedContext - Array of relevant knowledge documents from vector store
 * @returns {Promise<string>}       Coaching explanation string
 */
async function generateMoveAnalysis(pgn, moveIndex, retrievedContext = []) {
  // Fall back to mock if no LLM
  if (!langchainAvailable || !llm) {
    const contextSummary = retrievedContext.length > 0
      ? retrievedContext.map((d) => `• ${d.title}: ${d.content}`).join('\n')
      : 'No specific strategy context available.';
    return (
      `**Move ${moveIndex} Analysis (Mock)**\n\n` +
      `This move affects the position in several ways. ` +
      `Here are some relevant concepts:\n\n${contextSummary}\n\n` +
      `Consider how this move impacts piece activity and pawn structure. ` +
      `Look for tactical opportunities in the resulting position.`
    );
  }

  try {
    const { ChatPromptTemplate } = require('@langchain/core/prompts');
    const { StringOutputParser } = require('@langchain/core/output_parsers');

    // Flatten retrieved context into a readable string
    const contextStr = retrievedContext.length > 0
      ? retrievedContext.map((d) => `[${d.category}] ${d.title}: ${d.content}`).join('\n\n')
      : 'No specific strategy context retrieved.';

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are an expert chess coach. Analyze the given move in the context of the game. ' +
        'Use the provided chess knowledge to give a clear, educational explanation. ' +
        'Focus on: why the move is good or bad, what strategic themes it involves, and what the player should look for next. ' +
        'Keep the analysis concise — 3-5 sentences max.',
      ],
      [
        'human',
        'Analyze move {moveIndex} from this game:\n\nPGN: {pgn}\n\n' +
        'Relevant chess knowledge:\n{context}\n\n' +
        'Provide a clear coaching explanation.',
      ],
    ]);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const response = await chain.invoke({
      moveIndex: String(moveIndex),
      pgn,
      context: contextStr,
    });

    return response.trim();
  } catch (err) {
    console.error('Gemini analysis error, falling back to mock:', err.message);
    return `Move ${moveIndex}: This is an interesting move. Consider how it affects piece activity and central control.`;
  }
}

module.exports = {
  llm,
  embeddings,
  langchainAvailable,
  generatePersonalityChat,
  generateMoveAnalysis,
};
