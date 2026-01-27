// Statistics calculation utilities for the Golf Score Tracker app

/**
 * Calculate rivalry statistics between two players
 */
export const calculateRivalry = (rounds, player1Id, player2Id) => {
  const sharedRounds = rounds.filter(
    (round) =>
      round.isComplete &&
      round.players.includes(player1Id) &&
      round.players.includes(player2Id)
  );

  if (sharedRounds.length === 0) {
    return null;
  }

  let player1Wins = 0;
  let player2Wins = 0;
  let ties = 0;
  let player1MoneyTotal = 0;
  let player2MoneyTotal = 0;
  const results = [];

  sharedRounds
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((round) => {
      const p1Total = (round.scores[player1Id] || []).reduce(
        (a, b) => a + (b || 0),
        0
      );
      const p2Total = (round.scores[player2Id] || []).reduce(
        (a, b) => a + (b || 0),
        0
      );

      let result;
      if (p1Total < p2Total) {
        player1Wins++;
        result = 'W';
      } else if (p2Total < p1Total) {
        player2Wins++;
        result = 'L';
      } else {
        ties++;
        result = 'T';
      }

      results.push({
        roundId: round.id,
        date: round.date,
        result,
        p1Score: p1Total,
        p2Score: p2Total,
      });

      // Add money results
      const p1Money = round.moneyResults?.[player1Id] || 0;
      const p2Money = round.moneyResults?.[player2Id] || 0;
      player1MoneyTotal += p1Money;
      player2MoneyTotal += p2Money;
    });

  return {
    player1Id,
    player2Id,
    totalRounds: sharedRounds.length,
    player1Wins,
    player2Wins,
    ties,
    player1MoneyTotal,
    player2MoneyTotal,
    lastFiveResults: results.slice(-5).map((r) => r.result),
    lastPlayedDate: sharedRounds[sharedRounds.length - 1]?.date,
    allResults: results,
  };
};

/**
 * Get all rivalries for a player
 */
export const getAllRivalries = (rounds, playerId, allPlayers) => {
  const rivalries = [];

  allPlayers.forEach((player) => {
    if (player.id === playerId) return;

    const rivalry = calculateRivalry(rounds, playerId, player.id);
    if (rivalry && rivalry.totalRounds > 0) {
      rivalries.push({
        ...rivalry,
        opponent: player,
      });
    }
  });

  // Sort by total rounds played (most played first)
  return rivalries.sort((a, b) => b.totalRounds - a.totalRounds);
};

/**
 * Calculate player statistics
 */
export const calculatePlayerStats = (rounds, playerId) => {
  const playerRounds = rounds.filter(
    (r) => r.isComplete && r.players.includes(playerId)
  );

  if (playerRounds.length === 0) {
    return {
      totalRounds: 0,
      averageScore: null,
      bestScore: null,
      worstScore: null,
      totalMoney: 0,
      winRate: 0,
      averagePar3: null,
      averagePar4: null,
      averagePar5: null,
      currentStreak: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0,
    };
  }

  let totalScore = 0;
  let totalHoles = 0;
  let bestScore = Infinity;
  let worstScore = 0;
  let totalMoney = 0;
  let roundsWon = 0;
  let par3Scores = [];
  let par4Scores = [];
  let par5Scores = [];

  playerRounds.forEach((round) => {
    const scores = round.scores[playerId] || [];
    const roundTotal = scores.reduce((a, b) => a + (b || 0), 0);

    if (roundTotal > 0) {
      totalScore += roundTotal;
      totalHoles += scores.filter((s) => s > 0).length;

      if (roundTotal < bestScore) bestScore = roundTotal;
      if (roundTotal > worstScore) worstScore = roundTotal;
    }

    totalMoney += round.moneyResults?.[playerId] || 0;

    // Check if won the round
    const allScores = round.players.map((pId) => ({
      playerId: pId,
      total: (round.scores[pId] || []).reduce((a, b) => a + (b || 0), 0),
    }));
    const minScore = Math.min(...allScores.map((s) => s.total));
    if (
      allScores.find((s) => s.playerId === playerId)?.total === minScore
    ) {
      roundsWon++;
    }

    // Collect par scores if course data available
    if (round.course?.holes) {
      scores.forEach((score, index) => {
        if (!score || !round.course.holes[index]) return;
        const par = round.course.holes[index].par;
        if (par === 3) par3Scores.push(score);
        else if (par === 4) par4Scores.push(score);
        else if (par === 5) par5Scores.push(score);
      });
    }
  });

  // Calculate streaks
  const { currentStreak, longestWinStreak, longestLoseStreak } =
    calculateStreaks(playerRounds, playerId);

  return {
    totalRounds: playerRounds.length,
    averageScore:
      totalHoles > 0
        ? Math.round((totalScore / totalHoles) * 18 * 10) / 10
        : null,
    bestScore: bestScore === Infinity ? null : bestScore,
    worstScore: worstScore === 0 ? null : worstScore,
    totalMoney: Math.round(totalMoney * 100) / 100,
    winRate:
      playerRounds.length > 0
        ? Math.round((roundsWon / playerRounds.length) * 100)
        : 0,
    averagePar3:
      par3Scores.length > 0
        ? Math.round(
            (par3Scores.reduce((a, b) => a + b, 0) / par3Scores.length) * 10
          ) / 10
        : null,
    averagePar4:
      par4Scores.length > 0
        ? Math.round(
            (par4Scores.reduce((a, b) => a + b, 0) / par4Scores.length) * 10
          ) / 10
        : null,
    averagePar5:
      par5Scores.length > 0
        ? Math.round(
            (par5Scores.reduce((a, b) => a + b, 0) / par5Scores.length) * 10
          ) / 10
        : null,
    currentStreak,
    longestWinStreak,
    longestLoseStreak,
    roundsWon,
  };
};

/**
 * Calculate win/loss streaks
 */
const calculateStreaks = (rounds, playerId) => {
  let currentStreak = 0;
  let currentStreakType = null;
  let longestWinStreak = 0;
  let longestLoseStreak = 0;
  let winStreak = 0;
  let loseStreak = 0;

  rounds
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((round) => {
      const allScores = round.players.map((pId) => ({
        playerId: pId,
        total: (round.scores[pId] || []).reduce((a, b) => a + (b || 0), 0),
      }));
      const playerScore = allScores.find(
        (s) => s.playerId === playerId
      )?.total;
      const minScore = Math.min(...allScores.map((s) => s.total));

      const won = playerScore === minScore;

      if (won) {
        winStreak++;
        loseStreak = 0;
        if (currentStreakType === 'W') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentStreakType = 'W';
        }
        if (winStreak > longestWinStreak) longestWinStreak = winStreak;
      } else {
        loseStreak++;
        winStreak = 0;
        if (currentStreakType === 'L') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentStreakType = 'L';
        }
        if (loseStreak > longestLoseStreak) longestLoseStreak = loseStreak;
      }
    });

  return {
    currentStreak: currentStreakType === 'W' ? currentStreak : -currentStreak,
    longestWinStreak,
    longestLoseStreak,
  };
};

/**
 * Calculate monthly profit/loss
 */
export const calculateMonthlyPL = (rounds, playerId, months = 6) => {
  const now = new Date();
  const monthlyData = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthRounds = rounds.filter((r) => {
      const roundDate = new Date(r.date);
      return (
        r.isComplete &&
        r.players.includes(playerId) &&
        roundDate >= monthStart &&
        roundDate <= monthEnd
      );
    });

    const total = monthRounds.reduce(
      (sum, r) => sum + (r.moneyResults?.[playerId] || 0),
      0
    );

    monthlyData.push({
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      amount: Math.round(total * 100) / 100,
      roundsPlayed: monthRounds.length,
    });
  }

  return monthlyData;
};

/**
 * Calculate course statistics for a player
 */
export const calculateCourseStats = (rounds, playerId, courseId) => {
  const courseRounds = rounds.filter(
    (r) =>
      r.isComplete &&
      r.players.includes(playerId) &&
      r.courseId === courseId
  );

  if (courseRounds.length === 0) {
    return null;
  }

  let totalScore = 0;
  let bestScore = Infinity;
  let totalMoney = 0;

  courseRounds.forEach((round) => {
    const roundTotal = (round.scores[playerId] || []).reduce(
      (a, b) => a + (b || 0),
      0
    );
    if (roundTotal > 0) {
      totalScore += roundTotal;
      if (roundTotal < bestScore) bestScore = roundTotal;
    }
    totalMoney += round.moneyResults?.[playerId] || 0;
  });

  return {
    timesPlayed: courseRounds.length,
    averageScore: Math.round((totalScore / courseRounds.length) * 10) / 10,
    bestScore: bestScore === Infinity ? null : bestScore,
    totalMoney: Math.round(totalMoney * 100) / 100,
    lastPlayed: courseRounds[courseRounds.length - 1]?.date,
  };
};

/**
 * Get leaderboard for a round
 */
export const getRoundLeaderboard = (round, players) => {
  const leaderboard = players.map((player) => {
    const scores = round.scores[player.id] || [];
    const totalScore = scores.reduce((a, b) => a + (b || 0), 0);
    const holesPlayed = scores.filter((s) => s > 0).length;
    const money = round.moneyResults?.[player.id] || 0;

    return {
      player,
      totalScore,
      holesPlayed,
      money,
      thru: holesPlayed,
    };
  });

  // Sort by total score (lowest first), then by holes played (more is better for same score)
  return leaderboard.sort((a, b) => {
    if (a.totalScore === b.totalScore) {
      return b.holesPlayed - a.holesPlayed;
    }
    return a.totalScore - b.totalScore;
  });
};

/**
 * Calculate relative to par
 */
export const calculateRelativeToPar = (scores, holes) => {
  if (!scores || !holes || scores.length === 0) return null;

  const totalPar = holes
    .slice(0, scores.length)
    .reduce((sum, hole) => sum + (hole?.par || 4), 0);
  const totalScore = scores.reduce((a, b) => a + (b || 0), 0);

  return totalScore - totalPar;
};

/**
 * Format relative to par
 */
export const formatRelativeToPar = (relativeToPar) => {
  if (relativeToPar === null || relativeToPar === undefined) return '-';
  if (relativeToPar === 0) return 'E';
  if (relativeToPar > 0) return `+${relativeToPar}`;
  return `${relativeToPar}`;
};

export default {
  calculateRivalry,
  getAllRivalries,
  calculatePlayerStats,
  calculateMonthlyPL,
  calculateCourseStats,
  getRoundLeaderboard,
  calculateRelativeToPar,
  formatRelativeToPar,
};
