// Data export utilities for the Golf Score Tracker app

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { exportAllData } from './storage';

/**
 * Export all app data to JSON file
 */
export const exportDataToJson = async () => {
  try {
    const data = await exportAllData();
    const jsonString = JSON.stringify(data, null, 2);

    const filename = `golf-tracker-backup-${
      new Date().toISOString().split('T')[0]
    }.json`;
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return filePath;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

/**
 * Share exported data file
 */
export const shareDataExport = async () => {
  try {
    const filePath = await exportDataToJson();

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Golf Tracker Data',
      });
      return true;
    } else {
      console.log('Sharing is not available on this device');
      return false;
    }
  } catch (error) {
    console.error('Error sharing data:', error);
    throw error;
  }
};

/**
 * Generate round summary text
 */
export const generateRoundSummaryText = (round, players, course) => {
  let summary = `Golf Round Summary\n`;
  summary += `${'='.repeat(40)}\n\n`;
  summary += `Date: ${new Date(round.date).toLocaleDateString()}\n`;
  summary += `Course: ${course?.name || 'Unknown'}\n`;
  summary += `Tee: ${round.teeBox || 'White'}\n\n`;

  summary += `Scores:\n`;
  summary += `-`.repeat(30) + '\n';

  players.forEach((player) => {
    const scores = round.scores[player.id] || [];
    const total = scores.reduce((a, b) => a + (b || 0), 0);
    const money = round.moneyResults?.[player.id] || 0;
    const moneyStr = money >= 0 ? `+$${money}` : `-$${Math.abs(money)}`;
    summary += `${player.name}: ${total} (${moneyStr})\n`;
  });

  summary += `\n`;

  if (round.bets && round.bets.length > 0) {
    summary += `Bets:\n`;
    summary += `-`.repeat(30) + '\n';
    round.bets.forEach((bet) => {
      summary += `${bet.type}: $${bet.amount || bet.amounts?.front || 0}\n`;
    });
  }

  summary += `\n`;
  summary += `Shared from Golf Score Tracker`;

  return summary;
};

/**
 * Generate scorecard as shareable format
 */
export const generateScorecardText = (round, players, course) => {
  if (!course?.holes) return generateRoundSummaryText(round, players, course);

  let scorecard = `${course.name} - ${new Date(round.date).toLocaleDateString()}\n`;
  scorecard += `${'='.repeat(50)}\n\n`;

  // Header row
  scorecard += 'Hole    ';
  for (let i = 1; i <= 9; i++) {
    scorecard += `${i}  `;
  }
  scorecard += 'OUT  ';
  if (course.holes.length > 9) {
    for (let i = 10; i <= 18; i++) {
      scorecard += `${i} `;
    }
    scorecard += 'IN  TOT\n';
  } else {
    scorecard += '\n';
  }

  // Par row
  scorecard += 'Par     ';
  let frontPar = 0;
  let backPar = 0;
  for (let i = 0; i < 9; i++) {
    const par = course.holes[i]?.par || 4;
    frontPar += par;
    scorecard += `${par}  `;
  }
  scorecard += `${frontPar}  `;
  if (course.holes.length > 9) {
    for (let i = 9; i < 18; i++) {
      const par = course.holes[i]?.par || 4;
      backPar += par;
      scorecard += `${par}  `;
    }
    scorecard += `${backPar}  ${frontPar + backPar}\n`;
  } else {
    scorecard += '\n';
  }

  scorecard += '-'.repeat(50) + '\n';

  // Player rows
  players.forEach((player) => {
    const scores = round.scores[player.id] || [];
    const name = player.name.substring(0, 7).padEnd(8);
    scorecard += name;

    let frontTotal = 0;
    let backTotal = 0;

    for (let i = 0; i < 9; i++) {
      const score = scores[i] || 0;
      frontTotal += score;
      scorecard += `${score > 0 ? score : '-'}  `;
    }
    scorecard += `${frontTotal > 0 ? frontTotal : '-'}  `;

    if (course.holes.length > 9) {
      for (let i = 9; i < 18; i++) {
        const score = scores[i] || 0;
        backTotal += score;
        scorecard += `${score > 0 ? score : '-'}  `;
      }
      scorecard += `${backTotal > 0 ? backTotal : '-'}  ${
        frontTotal + backTotal > 0 ? frontTotal + backTotal : '-'
      }`;
    }
    scorecard += '\n';
  });

  scorecard += '\n';

  // Money results
  if (round.moneyResults && Object.keys(round.moneyResults).length > 0) {
    scorecard += 'Money Results:\n';
    players.forEach((player) => {
      const money = round.moneyResults[player.id] || 0;
      const moneyStr = money >= 0 ? `+$${money.toFixed(2)}` : `-$${Math.abs(money).toFixed(2)}`;
      scorecard += `  ${player.name}: ${moneyStr}\n`;
    });
  }

  return scorecard;
};

/**
 * Share round summary via system share
 */
export const shareRoundSummary = async (round, players, course) => {
  try {
    const summary = generateScorecardText(round, players, course);

    const filename = `round-${round.id}.txt`;
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, summary, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Round',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sharing round:', error);
    throw error;
  }
};

export default {
  exportDataToJson,
  shareDataExport,
  generateRoundSummaryText,
  generateScorecardText,
  shareRoundSummary,
};
