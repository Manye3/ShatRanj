/**
 * vectorDb.js — In-Memory Vector Store for Chess Knowledge RAG
 *
 * Uses LangChain's MemoryVectorStore with Gemini embeddings to provide
 * semantic search over the chess knowledge base. Falls back to simple
 * keyword matching when embeddings are unavailable (no API key).
 *
 * Architecture note: Swapping to Pinecone later is a one-import change —
 * replace MemoryVectorStore with PineconeStore and add credentials.
 */

const chessKnowledge = require('./chessKnowledge');

let vectorStore = null;
let isInitialized = false;
let usingFallback = false;

/**
 * Initialize the vector store by embedding all chess knowledge documents.
 * Call this once during server startup.
 *
 * @returns {Promise<boolean>} true if initialization succeeded
 */
async function initVectorStore() {
  try {
    const { embeddings, langchainAvailable } = require('./geminiClient');

    if (!langchainAvailable || !embeddings) {
      console.warn('⚠️  Embeddings unavailable — vector store will use keyword fallback');
      usingFallback = true;
      isInitialized = true;
      return true;
    }

    const { MemoryVectorStore } = require('langchain/vectorstores/memory');
    const { Document } = require('@langchain/core/documents');

    // Convert knowledge entries into LangChain Documents
    const documents = chessKnowledge.map(
      (entry) =>
        new Document({
          pageContent: `${entry.title}: ${entry.content}`,
          metadata: {
            id: entry.id,
            category: entry.category,
            title: entry.title,
          },
        })
    );

    // Build the in-memory vector store from documents
    vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

    isInitialized = true;
    usingFallback = false;
    console.log(`✅ Vector store initialized with ${documents.length} chess knowledge documents`);
    return true;
  } catch (err) {
    console.error('❌ Vector store initialization failed:', err.message);
    console.warn('⚠️  Falling back to keyword search');
    usingFallback = true;
    isInitialized = true;
    return true; // Still "initialized" — keyword fallback is available
  }
}

/**
 * Simple keyword-based fallback search when embeddings are unavailable.
 * Scores each document by how many query words appear in its content.
 *
 * @param {string} query - Search query
 * @param {number} k     - Number of results to return
 * @returns {Array}       Top-k matching knowledge entries
 */
function keywordSearch(query, k = 3) {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2); // Skip tiny words

  const scored = chessKnowledge.map((entry) => {
    const text = `${entry.title} ${entry.content} ${entry.category}`.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (text.includes(word)) score++;
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.entry);
}

/**
 * Search the vector store for relevant chess strategy documents.
 *
 * @param {string} query - Natural language search query
 * @param {number} k     - Number of results to return (default 3)
 * @returns {Promise<Array>} Array of matching knowledge entries with metadata
 */
async function searchStrategy(query, k = 3) {
  if (!isInitialized) {
    console.warn('Vector store not initialized yet — using keyword fallback');
    return keywordSearch(query, k);
  }

  // Use keyword fallback if vector store isn't available
  if (usingFallback || !vectorStore) {
    return keywordSearch(query, k);
  }

  try {
    const results = await vectorStore.similaritySearch(query, k);
    return results.map((doc) => ({
      id: doc.metadata.id,
      category: doc.metadata.category,
      title: doc.metadata.title,
      content: doc.pageContent,
    }));
  } catch (err) {
    console.error('Vector search failed, using keyword fallback:', err.message);
    return keywordSearch(query, k);
  }
}

module.exports = { initVectorStore, searchStrategy };
