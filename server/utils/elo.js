/**
 * FIDE-style Elo rating calculator.
 * K-factor varies by rating bracket for realistic progression.
 */

function getKFactor(rating) {
  if (rating < 2100) return 32;
  if (rating < 2400) return 24;
  return 16;
}

function expectedScore(playerRating, opponentRating) {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate new ratings for both players after a game.
 * @param {number} whiteRating
 * @param {number} blackRating
 * @param {'white_win'|'black_win'|'draw'} result
 * @returns {{ whiteNew, blackNew, whiteDelta, blackDelta }}
 */
function calculateElo(whiteRating, blackRating, result) {
  const whiteExpected = expectedScore(whiteRating, blackRating);
  const blackExpected = expectedScore(blackRating, whiteRating);

  let whiteScore, blackScore;
  if (result === 'white_win') {
    whiteScore = 1;
    blackScore = 0;
  } else if (result === 'black_win') {
    whiteScore = 0;
    blackScore = 1;
  } else {
    whiteScore = 0.5;
    blackScore = 0.5;
  }

  const whiteK = getKFactor(whiteRating);
  const blackK = getKFactor(blackRating);

  const whiteDelta = Math.round(whiteK * (whiteScore - whiteExpected));
  const blackDelta = Math.round(blackK * (blackScore - blackExpected));

  return {
    whiteNew: Math.max(100, whiteRating + whiteDelta),
    blackNew: Math.max(100, blackRating + blackDelta),
    whiteDelta,
    blackDelta,
  };
}

module.exports = { calculateElo };
