// Bet calculation utilities for the Golf Score Tracker app

import { BET_TYPES, SIDE_BET_TYPES } from '../constants/betTypes';

/**
 * Calculate Nassau bet results
 * Nassau is three separate bets: front 9, back 9, and overall
 */
export const calculateNassau = (scores, bet, players) => {
  const results = {};
  players.forEach((p) => {
    results[p.id] = { front: 0, back: 0, overall: 0, total: 0 };
  });

  if (players.length !== 2) {
    // Nassau typically works best with 2 players
    // For more players, compare each pair
    return calculateMultiPlayerNassau(scores, bet, players);
  }

  const [player1, player2] = players;
  const p1Scores = scores[player1.id] || [];
  const p2Scores = scores[player2.id] || [];

  // Calculate front 9 totals
  const p1Front = p1Scores.slice(0, 9).reduce((a, b) => a + (b || 0), 0);
  const p2Front = p2Scores.slice(0, 9).reduce((a, b) => a + (b || 0), 0);

  // Calculate back 9 totals
  const p1Back = p1Scores.slice(9, 18).reduce((a, b) => a + (b || 0), 0);
  const p2Back = p2Scores.slice(9, 18).reduce((a, b) => a + (b || 0), 0);

  // Calculate overall totals
  const p1Total = p1Front + p1Back;
  const p2Total = p2Front + p2Back;

  const frontAmount = bet.amounts?.front || bet.amount || 5;
  const backAmount = bet.amounts?.back || bet.amount || 5;
  const overallAmount = bet.amounts?.overall || bet.amount || 5;

  // Front 9
  if (p1Front < p2Front) {
    results[player1.id].front = frontAmount;
    results[player2.id].front = -frontAmount;
  } else if (p2Front < p1Front) {
    results[player1.id].front = -frontAmount;
    results[player2.id].front = frontAmount;
  }

  // Back 9
  if (p1Back < p2Back) {
    results[player1.id].back = backAmount;
    results[player2.id].back = -backAmount;
  } else if (p2Back < p1Back) {
    results[player1.id].back = -backAmount;
    results[player2.id].back = backAmount;
  }

  // Overall
  if (p1Total < p2Total) {
    results[player1.id].overall = overallAmount;
    results[player2.id].overall = -overallAmount;
  } else if (p2Total < p1Total) {
    results[player1.id].overall = -overallAmount;
    results[player2.id].overall = overallAmount;
  }

  // Calculate totals
  players.forEach((p) => {
    results[p.id].total =
      results[p.id].front + results[p.id].back + results[p.id].overall;
  });

  return results;
};

const calculateMultiPlayerNassau = (scores, bet, players) => {
  const results = {};
  players.forEach((p) => {
    results[p.id] = { front: 0, back: 0, overall: 0, total: 0 };
  });

  // Find best front 9, back 9, and overall
  let bestFront = { playerId: null, score: Infinity };
  let bestBack = { playerId: null, score: Infinity };
  let bestOverall = { playerId: null, score: Infinity };

  players.forEach((player) => {
    const playerScores = scores[player.id] || [];
    const front = playerScores.slice(0, 9).reduce((a, b) => a + (b || 0), 0);
    const back = playerScores.slice(9, 18).reduce((a, b) => a + (b || 0), 0);
    const total = front + back;

    if (front < bestFront.score) {
      bestFront = { playerId: player.id, score: front };
    }
    if (back < bestBack.score) {
      bestBack = { playerId: player.id, score: back };
    }
    if (total < bestOverall.score) {
      bestOverall = { playerId: player.id, score: total };
    }
  });

  const frontAmount = bet.amounts?.front || bet.amount || 5;
  const backAmount = bet.amounts?.back || bet.amount || 5;
  const overallAmount = bet.amounts?.overall || bet.amount || 5;
  const losersCount = players.length - 1;

  // Distribute winnings (winner takes from each loser)
  if (bestFront.playerId) {
    results[bestFront.playerId].front = frontAmount * losersCount;
    players.forEach((p) => {
      if (p.id !== bestFront.playerId) {
        results[p.id].front = -frontAmount;
      }
    });
  }

  if (bestBack.playerId) {
    results[bestBack.playerId].back = backAmount * losersCount;
    players.forEach((p) => {
      if (p.id !== bestBack.playerId) {
        results[p.id].back = -backAmount;
      }
    });
  }

  if (bestOverall.playerId) {
    results[bestOverall.playerId].overall = overallAmount * losersCount;
    players.forEach((p) => {
      if (p.id !== bestOverall.playerId) {
        results[p.id].overall = -overallAmount;
      }
    });
  }

  // Calculate totals
  players.forEach((p) => {
    results[p.id].total =
      results[p.id].front + results[p.id].back + results[p.id].overall;
  });

  return results;
};

/**
 * Calculate Skins game results
 * Lowest score wins the hole. Ties carry over to next hole.
 */
export const calculateSkins = (scores, bet, players, numHoles = 18) => {
  const results = {};
  players.forEach((p) => {
    results[p.id] = { skins: [], totalSkins: 0, total: 0 };
  });

  const amountPerSkin = bet.amount || 1;
  const carryover = bet.carryover !== false; // default true

  let pot = amountPerSkin;

  for (let hole = 0; hole < numHoles; hole++) {
    const holeScores = players.map((p) => ({
      playerId: p.id,
      score: scores[p.id]?.[hole] || 0,
    }));

    // Filter out players who haven't entered a score yet
    const validScores = holeScores.filter((s) => s.score > 0);

    if (validScores.length === 0) {
      continue;
    }

    // Find the lowest score
    const minScore = Math.min(...validScores.map((s) => s.score));
    const winners = validScores.filter((s) => s.score === minScore);

    if (winners.length === 1) {
      // Single winner takes the pot
      const winnerId = winners[0].playerId;
      results[winnerId].skins.push({
        hole: hole + 1,
        amount: pot,
      });
      results[winnerId].totalSkins++;
      results[winnerId].total += pot;

      // Deduct from other players
      const losers = players.filter((p) => p.id !== winnerId);
      const perLoser = pot / losers.length;
      losers.forEach((loser) => {
        results[loser.id].total -= perLoser;
      });

      // Reset pot
      pot = amountPerSkin;
    } else if (carryover) {
      // Tie - carry over
      pot += amountPerSkin;
    }
  }

  return results;
};

/**
 * Calculate Match Play results
 * Win money for each hole won
 */
export const calculateMatchPlay = (scores, bet, players) => {
  const results = {};
  players.forEach((p) => {
    results[p.id] = { holesWon: 0, holesLost: 0, ties: 0, total: 0 };
  });

  if (players.length !== 2) {
    return results; // Match play works best with 2 players
  }

  const [player1, player2] = players;
  const amountPerHole = bet.amount || 1;
  const numHoles = Math.max(
    scores[player1.id]?.length || 0,
    scores[player2.id]?.length || 0
  );

  for (let hole = 0; hole < numHoles; hole++) {
    const p1Score = scores[player1.id]?.[hole] || 0;
    const p2Score = scores[player2.id]?.[hole] || 0;

    if (p1Score === 0 || p2Score === 0) continue;

    if (p1Score < p2Score) {
      results[player1.id].holesWon++;
      results[player1.id].total += amountPerHole;
      results[player2.id].holesLost++;
      results[player2.id].total -= amountPerHole;
    } else if (p2Score < p1Score) {
      results[player2.id].holesWon++;
      results[player2.id].total += amountPerHole;
      results[player1.id].holesLost++;
      results[player1.id].total -= amountPerHole;
    } else {
      results[player1.id].ties++;
      results[player2.id].ties++;
    }
  }

  return results;
};

/**
 * Calculate Stroke Play results
 * Win money based on total stroke difference
 */
export const calculateStrokePlay = (scores, bet, players) => {
  const results = {};
  players.forEach((p) => {
    results[p.id] = { totalStrokes: 0, differential: 0, total: 0 };
  });

  if (players.length < 2) {
    return results;
  }

  const amountPerStroke = bet.amount || 1;

  // Calculate total strokes for each player
  players.forEach((player) => {
    results[player.id].totalStrokes = (scores[player.id] || []).reduce(
      (a, b) => a + (b || 0),
      0
    );
  });

  if (players.length === 2) {
    const [player1, player2] = players;
    const differential =
      results[player2.id].totalStrokes - results[player1.id].totalStrokes;

    if (differential > 0) {
      // Player 1 wins
      results[player1.id].differential = differential;
      results[player1.id].total = differential * amountPerStroke;
      results[player2.id].differential = -differential;
      results[player2.id].total = -differential * amountPerStroke;
    } else if (differential < 0) {
      // Player 2 wins
      results[player2.id].differential = -differential;
      results[player2.id].total = -differential * amountPerStroke;
      results[player1.id].differential = differential;
      results[player1.id].total = differential * amountPerStroke;
    }
  } else {
    // Multi-player: each player pays/receives based on difference with each other player
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        const diff =
          results[p2.id].totalStrokes - results[p1.id].totalStrokes;

        if (diff > 0) {
          results[p1.id].total += diff * amountPerStroke;
          results[p2.id].total -= diff * amountPerStroke;
        } else if (diff < 0) {
          results[p1.id].total += diff * amountPerStroke;
          results[p2.id].total -= diff * amountPerStroke;
        }
      }
    }
  }

  return results;
};

/**
 * Calculate side bet results
 */
export const calculateSideBets = (round, players) => {
  const results = {};
  players.forEach((p) => {
    results[p.id] = { sideBets: [], total: 0 };
  });

  const { sideBets = [], scores, sideData = {} } = round;

  sideBets.forEach((sideBet) => {
    switch (sideBet.type) {
      case SIDE_BET_TYPES.CLOSEST_TO_PIN:
        // Winner recorded in sideData
        sideBet.holes?.forEach((hole) => {
          const winnerId = sideData.ctp?.[hole];
          if (winnerId) {
            results[winnerId].sideBets.push({
              type: 'CTP',
              hole,
              amount: sideBet.amount,
            });
            results[winnerId].total += sideBet.amount;
            // Deduct from others
            const losers = players.filter((p) => p.id !== winnerId);
            const perLoser = sideBet.amount / losers.length;
            losers.forEach((l) => {
              results[l.id].total -= perLoser;
            });
          }
        });
        break;

      case SIDE_BET_TYPES.LONGEST_DRIVE:
        sideBet.holes?.forEach((hole) => {
          const winnerId = sideData.ld?.[hole];
          if (winnerId) {
            results[winnerId].sideBets.push({
              type: 'LD',
              hole,
              amount: sideBet.amount,
            });
            results[winnerId].total += sideBet.amount;
            const losers = players.filter((p) => p.id !== winnerId);
            const perLoser = sideBet.amount / losers.length;
            losers.forEach((l) => {
              results[l.id].total -= perLoser;
            });
          }
        });
        break;

      case SIDE_BET_TYPES.BIRDIE_BONUS:
        // Check each hole for birdies
        players.forEach((player) => {
          const playerScores = scores[player.id] || [];
          const course = round.course;

          playerScores.forEach((score, holeIndex) => {
            const par = course?.holes?.[holeIndex]?.par || 4;
            if (score === par - 1) {
              // Birdie
              results[player.id].sideBets.push({
                type: 'BB',
                hole: holeIndex + 1,
                amount: sideBet.amount,
              });
              results[player.id].total += sideBet.amount * (players.length - 1);
              // Others pay
              players.forEach((other) => {
                if (other.id !== player.id) {
                  results[other.id].total -= sideBet.amount;
                }
              });
            }
          });
        });
        break;

      case SIDE_BET_TYPES.SANDY:
      case SIDE_BET_TYPES.GREENIE:
        // These require manual tracking
        Object.entries(sideData[sideBet.type.toLowerCase()] || {}).forEach(
          ([hole, winnerId]) => {
            if (winnerId) {
              results[winnerId].sideBets.push({
                type: sideBet.type,
                hole: parseInt(hole),
                amount: sideBet.amount,
              });
              results[winnerId].total += sideBet.amount * (players.length - 1);
              players.forEach((other) => {
                if (other.id !== winnerId) {
                  results[other.id].total -= sideBet.amount;
                }
              });
            }
          }
        );
        break;
    }
  });

  return results;
};

/**
 * Master function to calculate all money results for a round
 */
export const calculateRoundMoney = (round, players) => {
  const finalResults = {};
  players.forEach((p) => {
    finalResults[p.id] = {
      bets: {},
      sideBets: [],
      total: 0,
    };
  });

  const { scores, bets = [] } = round;

  // Calculate each bet type
  bets.forEach((bet) => {
    let betResults;

    switch (bet.type) {
      case BET_TYPES.NASSAU:
        betResults = calculateNassau(scores, bet, players);
        break;
      case BET_TYPES.SKINS:
        betResults = calculateSkins(scores, bet, players, round.numHoles || 18);
        break;
      case BET_TYPES.MATCH_PLAY:
        betResults = calculateMatchPlay(scores, bet, players);
        break;
      case BET_TYPES.STROKE_PLAY:
        betResults = calculateStrokePlay(scores, bet, players);
        break;
      default:
        return;
    }

    // Add bet results to final results
    players.forEach((p) => {
      finalResults[p.id].bets[bet.type] = betResults[p.id];
      finalResults[p.id].total += betResults[p.id].total || 0;
    });
  });

  // Calculate side bets
  const sideBetResults = calculateSideBets(round, players);
  players.forEach((p) => {
    finalResults[p.id].sideBets = sideBetResults[p.id].sideBets;
    finalResults[p.id].total += sideBetResults[p.id].total;
  });

  return finalResults;
};

/**
 * Calculate running totals during a round (live updates)
 */
export const calculateLiveBank = (round, players, throughHole) => {
  const liveResults = {};
  players.forEach((p) => {
    liveResults[p.id] = 0;
  });

  const { scores, bets = [] } = round;

  // Create partial scores up to the current hole
  const partialScores = {};
  players.forEach((p) => {
    partialScores[p.id] = (scores[p.id] || []).slice(0, throughHole);
  });

  bets.forEach((bet) => {
    switch (bet.type) {
      case BET_TYPES.SKINS: {
        const results = calculateSkins(partialScores, bet, players, throughHole);
        players.forEach((p) => {
          liveResults[p.id] += results[p.id].total;
        });
        break;
      }
      case BET_TYPES.MATCH_PLAY: {
        const results = calculateMatchPlay(partialScores, bet, players);
        players.forEach((p) => {
          liveResults[p.id] += results[p.id].total;
        });
        break;
      }
      // Nassau only settles at end of front 9, back 9, and overall
      // So we don't show partial Nassau results
    }
  });

  return liveResults;
};

export default {
  calculateNassau,
  calculateSkins,
  calculateMatchPlay,
  calculateStrokePlay,
  calculateSideBets,
  calculateRoundMoney,
  calculateLiveBank,
};
