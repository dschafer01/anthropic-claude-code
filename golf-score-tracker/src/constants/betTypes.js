// Bet types and configuration for the Golf Score Tracker app

export const BET_TYPES = {
  NASSAU: 'Nassau',
  SKINS: 'Skins',
  MATCH_PLAY: 'MatchPlay',
  STROKE_PLAY: 'StrokePlay',
  CUSTOM: 'Custom',
};

export const SIDE_BET_TYPES = {
  CLOSEST_TO_PIN: 'ClosestToPin',
  LONGEST_DRIVE: 'LongestDrive',
  BIRDIE_BONUS: 'BirdieBonus',
  SANDY: 'Sandy',
  GREENIE: 'Greenie',
};

export const betTypeConfig = {
  [BET_TYPES.NASSAU]: {
    name: 'Nassau',
    description: 'Three separate bets: front 9, back 9, and overall',
    icon: '🏆',
    hasPress: true,
    defaultAmounts: {
      front: 5,
      back: 5,
      overall: 5,
    },
  },
  [BET_TYPES.SKINS]: {
    name: 'Skins',
    description: 'Lowest score wins the hole. Ties carry over.',
    icon: '💰',
    hasCarryover: true,
    defaultAmount: 1,
  },
  [BET_TYPES.MATCH_PLAY]: {
    name: 'Match Play',
    description: 'Win money for each hole won',
    icon: '🥊',
    defaultAmountPerHole: 1,
  },
  [BET_TYPES.STROKE_PLAY]: {
    name: 'Stroke Play',
    description: 'Win money based on total stroke difference',
    icon: '📊',
    defaultAmountPerStroke: 1,
  },
  [BET_TYPES.CUSTOM]: {
    name: 'Custom Bet',
    description: 'Create your own bet rules',
    icon: '✏️',
  },
};

export const sideBetConfig = {
  [SIDE_BET_TYPES.CLOSEST_TO_PIN]: {
    name: 'Closest to Pin',
    shortName: 'CTP',
    description: 'Closest to the pin on par 3s',
    icon: '🎯',
    defaultAmount: 2,
    applicableHoles: 'par3',
  },
  [SIDE_BET_TYPES.LONGEST_DRIVE]: {
    name: 'Longest Drive',
    shortName: 'LD',
    description: 'Longest drive on selected holes',
    icon: '💪',
    defaultAmount: 2,
    applicableHoles: 'par4and5',
  },
  [SIDE_BET_TYPES.BIRDIE_BONUS]: {
    name: 'Birdie Bonus',
    shortName: 'BB',
    description: 'Bonus for making a birdie',
    icon: '🐦',
    defaultAmount: 1,
    applicableHoles: 'all',
  },
  [SIDE_BET_TYPES.SANDY]: {
    name: 'Sandy',
    shortName: 'S',
    description: 'Up and down from a bunker',
    icon: '⛱️',
    defaultAmount: 2,
    applicableHoles: 'all',
  },
  [SIDE_BET_TYPES.GREENIE]: {
    name: 'Greenie',
    shortName: 'G',
    description: 'First ball on the green on par 3s',
    icon: '🟢',
    defaultAmount: 2,
    applicableHoles: 'par3',
  },
};

export const TEE_BOXES = [
  { id: 'black', name: 'Black', color: '#111827' },
  { id: 'blue', name: 'Blue', color: '#3B82F6' },
  { id: 'white', name: 'White', color: '#F9FAFB' },
  { id: 'red', name: 'Red', color: '#EF4444' },
  { id: 'gold', name: 'Gold', color: '#F59E0B' },
];

export default {
  BET_TYPES,
  SIDE_BET_TYPES,
  betTypeConfig,
  sideBetConfig,
  TEE_BOXES,
};
