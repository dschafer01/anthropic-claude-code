// Handicap calculation utilities for the Golf Score Tracker app

/**
 * Calculate Course Handicap from Handicap Index
 * Formula: Course Handicap = Handicap Index × (Slope Rating / 113) + (Course Rating - Par)
 */
export const calculateCourseHandicap = (
  handicapIndex,
  slopeRating,
  courseRating,
  par
) => {
  if (!handicapIndex || !slopeRating) return 0;

  const courseHandicap =
    handicapIndex * (slopeRating / 113) + (courseRating - par);
  return Math.round(courseHandicap);
};

/**
 * Calculate Playing Handicap (for net scoring)
 * Formula: Playing Handicap = Course Handicap × Handicap Allowance
 * Typical allowances: Stroke Play = 95%, Match Play = 100%
 */
export const calculatePlayingHandicap = (
  courseHandicap,
  allowancePercent = 100
) => {
  return Math.round(courseHandicap * (allowancePercent / 100));
};

/**
 * Distribute handicap strokes across holes
 * Returns an array of stroke counts per hole based on hole handicap ratings
 */
export const distributeHandicapStrokes = (playingHandicap, holes) => {
  const strokesPerHole = new Array(holes.length).fill(0);

  if (!playingHandicap || playingHandicap <= 0) {
    return strokesPerHole;
  }

  // Sort holes by handicap rating (lower = harder = gets stroke first)
  const sortedHoleIndices = holes
    .map((hole, index) => ({ index, handicap: hole.handicap || index + 1 }))
    .sort((a, b) => a.handicap - b.handicap)
    .map((h) => h.index);

  let remainingStrokes = playingHandicap;

  // First pass: distribute one stroke per hole in handicap order
  while (remainingStrokes > 0 && sortedHoleIndices.length > 0) {
    for (const holeIndex of sortedHoleIndices) {
      if (remainingStrokes <= 0) break;
      strokesPerHole[holeIndex]++;
      remainingStrokes--;
    }
  }

  return strokesPerHole;
};

/**
 * Calculate net score for a hole
 */
export const calculateNetScore = (grossScore, strokesOnHole) => {
  return Math.max(0, grossScore - strokesOnHole);
};

/**
 * Calculate net scores for all holes
 */
export const calculateAllNetScores = (grossScores, strokesPerHole) => {
  return grossScores.map((score, index) =>
    calculateNetScore(score || 0, strokesPerHole[index] || 0)
  );
};

/**
 * Calculate Stableford points for a hole
 * Net Double Bogey or worse = 0
 * Net Bogey = 1
 * Net Par = 2
 * Net Birdie = 3
 * Net Eagle = 4
 * Net Albatross = 5
 */
export const calculateStablefordPoints = (netScore, par) => {
  if (!netScore || netScore <= 0) return 0;

  const differential = netScore - par;

  if (differential >= 2) return 0; // Double bogey or worse
  if (differential === 1) return 1; // Bogey
  if (differential === 0) return 2; // Par
  if (differential === -1) return 3; // Birdie
  if (differential === -2) return 4; // Eagle
  if (differential <= -3) return 5; // Albatross or better

  return 0;
};

/**
 * Calculate total Stableford points for a round
 */
export const calculateTotalStablefordPoints = (netScores, holes) => {
  return netScores.reduce((total, netScore, index) => {
    const par = holes[index]?.par || 4;
    return total + calculateStablefordPoints(netScore, par);
  }, 0);
};

/**
 * Calculate differential for posting to handicap
 * Formula: (Adjusted Gross Score - Course Rating) × (113 / Slope Rating)
 */
export const calculateScoreDifferential = (
  adjustedGrossScore,
  courseRating,
  slopeRating
) => {
  if (!slopeRating || slopeRating === 0) return null;

  const differential =
    ((adjustedGrossScore - courseRating) * 113) / slopeRating;
  return Math.round(differential * 10) / 10; // Round to 1 decimal
};

/**
 * Apply equitable stroke control (ESC) for handicap posting
 * Limits the maximum score per hole based on course handicap
 */
export const applyEquitableStrokeControl = (grossScore, par, courseHandicap) => {
  let maxScore;

  if (courseHandicap <= 9) {
    maxScore = par + 2; // Double bogey
  } else if (courseHandicap <= 19) {
    maxScore = 7;
  } else if (courseHandicap <= 29) {
    maxScore = 8;
  } else if (courseHandicap <= 39) {
    maxScore = 9;
  } else {
    maxScore = 10;
  }

  return Math.min(grossScore, maxScore);
};

/**
 * Calculate adjusted gross score for handicap posting
 */
export const calculateAdjustedGrossScore = (grossScores, holes, courseHandicap) => {
  return grossScores.reduce((total, score, index) => {
    const par = holes[index]?.par || 4;
    const adjustedScore = applyEquitableStrokeControl(score || 0, par, courseHandicap);
    return total + adjustedScore;
  }, 0);
};

/**
 * Calculate handicap strokes given to/received from another player
 * For match play, the difference in course handicaps
 */
export const calculateMatchPlayStrokes = (
  playerCourseHandicap,
  opponentCourseHandicap
) => {
  const difference = playerCourseHandicap - opponentCourseHandicap;

  if (difference > 0) {
    return { gives: difference, receives: 0 };
  } else if (difference < 0) {
    return { gives: 0, receives: Math.abs(difference) };
  }

  return { gives: 0, receives: 0 };
};

/**
 * Get player's strokes on a specific hole vs opponent
 */
export const getStrokesOnHole = (
  holeHandicap,
  strokesReceived,
  strokesGiven = 0
) => {
  // Player receives strokes on the hardest holes (lowest handicap numbers)
  if (strokesReceived >= holeHandicap) {
    // Gets extra stroke if receiving more than 18 strokes
    const extraStrokes = Math.floor(strokesReceived / 18);
    return 1 + extraStrokes;
  }

  if (strokesGiven >= holeHandicap) {
    return -1; // Gives a stroke
  }

  return 0;
};

/**
 * Format handicap for display
 */
export const formatHandicap = (handicapIndex) => {
  if (handicapIndex === null || handicapIndex === undefined) return 'N/A';
  if (handicapIndex === 0) return '0.0';

  const sign = handicapIndex > 0 ? '' : '+';
  return `${sign}${Math.abs(handicapIndex).toFixed(1)}`;
};

/**
 * Validate GHIN number format
 */
export const validateGHINNumber = (ghinNumber) => {
  // GHIN numbers are typically 7 digits
  const cleaned = ghinNumber.replace(/\D/g, '');
  return cleaned.length >= 6 && cleaned.length <= 10;
};

export default {
  calculateCourseHandicap,
  calculatePlayingHandicap,
  distributeHandicapStrokes,
  calculateNetScore,
  calculateAllNetScores,
  calculateStablefordPoints,
  calculateTotalStablefordPoints,
  calculateScoreDifferential,
  applyEquitableStrokeControl,
  calculateAdjustedGrossScore,
  calculateMatchPlayStrokes,
  getStrokesOnHole,
  formatHandicap,
  validateGHINNumber,
};
