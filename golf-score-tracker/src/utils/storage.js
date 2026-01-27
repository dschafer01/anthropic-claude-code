// AsyncStorage helpers for data persistence

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  PLAYERS: '@golf_tracker/players',
  COURSES: '@golf_tracker/courses',
  ROUNDS: '@golf_tracker/rounds',
  SETTINGS: '@golf_tracker/settings',
  CURRENT_USER: '@golf_tracker/current_user',
};

// Generic storage helpers
export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
};

export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
};

// Player CRUD operations
export const getPlayers = async () => {
  const players = await getItem(STORAGE_KEYS.PLAYERS);
  return players || [];
};

export const getPlayerById = async (id) => {
  const players = await getPlayers();
  return players.find((p) => p.id === id) || null;
};

export const savePlayer = async (player) => {
  const players = await getPlayers();
  const existingIndex = players.findIndex((p) => p.id === player.id);

  if (existingIndex >= 0) {
    players[existingIndex] = { ...players[existingIndex], ...player };
  } else {
    players.push({
      ...player,
      id: player.id || generateId(),
      createdAt: player.createdAt || new Date().toISOString(),
      totalBankBalance: player.totalBankBalance || 0,
      totalRoundsPlayed: player.totalRoundsPlayed || 0,
      totalRoundsWon: player.totalRoundsWon || 0,
    });
  }

  await setItem(STORAGE_KEYS.PLAYERS, players);
  return players;
};

export const deletePlayer = async (id) => {
  const players = await getPlayers();
  const filtered = players.filter((p) => p.id !== id);
  await setItem(STORAGE_KEYS.PLAYERS, filtered);
  return filtered;
};

export const updatePlayerStats = async (playerId, updates) => {
  const players = await getPlayers();
  const playerIndex = players.findIndex((p) => p.id === playerId);

  if (playerIndex >= 0) {
    players[playerIndex] = {
      ...players[playerIndex],
      ...updates,
    };
    await setItem(STORAGE_KEYS.PLAYERS, players);
  }

  return players;
};

// Course CRUD operations
export const getCourses = async () => {
  const courses = await getItem(STORAGE_KEYS.COURSES);
  return courses || [];
};

export const getCourseById = async (id) => {
  const courses = await getCourses();
  return courses.find((c) => c.id === id) || null;
};

export const saveCourse = async (course) => {
  const courses = await getCourses();
  const existingIndex = courses.findIndex((c) => c.id === course.id);

  if (existingIndex >= 0) {
    courses[existingIndex] = { ...courses[existingIndex], ...course };
  } else {
    courses.push({
      ...course,
      id: course.id || generateId(),
      createdAt: new Date().toISOString(),
      isFavorite: course.isFavorite || false,
      timesPlayed: course.timesPlayed || 0,
    });
  }

  await setItem(STORAGE_KEYS.COURSES, courses);
  return courses;
};

export const deleteCourse = async (id) => {
  const courses = await getCourses();
  const filtered = courses.filter((c) => c.id !== id);
  await setItem(STORAGE_KEYS.COURSES, filtered);
  return filtered;
};

export const toggleCourseFavorite = async (id) => {
  const courses = await getCourses();
  const courseIndex = courses.findIndex((c) => c.id === id);

  if (courseIndex >= 0) {
    courses[courseIndex].isFavorite = !courses[courseIndex].isFavorite;
    await setItem(STORAGE_KEYS.COURSES, courses);
  }

  return courses;
};

// Round CRUD operations
export const getRounds = async () => {
  const rounds = await getItem(STORAGE_KEYS.ROUNDS);
  return rounds || [];
};

export const getRoundById = async (id) => {
  const rounds = await getRounds();
  return rounds.find((r) => r.id === id) || null;
};

export const saveRound = async (round) => {
  const rounds = await getRounds();
  const existingIndex = rounds.findIndex((r) => r.id === round.id);

  if (existingIndex >= 0) {
    rounds[existingIndex] = { ...rounds[existingIndex], ...round };
  } else {
    rounds.push({
      ...round,
      id: round.id || generateId(),
      date: round.date || new Date().toISOString(),
      isComplete: round.isComplete || false,
    });
  }

  await setItem(STORAGE_KEYS.ROUNDS, rounds);
  return rounds;
};

export const deleteRound = async (id) => {
  const rounds = await getRounds();
  const filtered = rounds.filter((r) => r.id !== id);
  await setItem(STORAGE_KEYS.ROUNDS, filtered);
  return filtered;
};

export const getRecentRounds = async (limit = 5) => {
  const rounds = await getRounds();
  return rounds
    .filter((r) => r.isComplete)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

export const getRoundsByPlayerId = async (playerId) => {
  const rounds = await getRounds();
  return rounds.filter((r) => r.players.includes(playerId));
};

export const getRoundsByCourseId = async (courseId) => {
  const rounds = await getRounds();
  return rounds.filter((r) => r.courseId === courseId);
};

// Settings operations
export const getSettings = async () => {
  const settings = await getItem(STORAGE_KEYS.SETTINGS);
  return (
    settings || {
      soundEnabled: true,
      hapticsEnabled: true,
      theme: 'light',
      defaultTeeBox: 'white',
      showNetScores: true,
    }
  );
};

export const saveSettings = async (settings) => {
  await setItem(STORAGE_KEYS.SETTINGS, settings);
  return settings;
};

export const updateSettings = async (updates) => {
  const settings = await getSettings();
  const newSettings = { ...settings, ...updates };
  await setItem(STORAGE_KEYS.SETTINGS, newSettings);
  return newSettings;
};

// Current user operations
export const getCurrentUser = async () => {
  return await getItem(STORAGE_KEYS.CURRENT_USER);
};

export const setCurrentUser = async (user) => {
  await setItem(STORAGE_KEYS.CURRENT_USER, user);
  return user;
};

// Helper functions
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Export/Import data
export const exportAllData = async () => {
  const players = await getPlayers();
  const courses = await getCourses();
  const rounds = await getRounds();
  const settings = await getSettings();
  const currentUser = await getCurrentUser();

  return {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    data: {
      players,
      courses,
      rounds,
      settings,
      currentUser,
    },
  };
};

export const importData = async (importedData) => {
  try {
    const { data } = importedData;

    if (data.players) await setItem(STORAGE_KEYS.PLAYERS, data.players);
    if (data.courses) await setItem(STORAGE_KEYS.COURSES, data.courses);
    if (data.rounds) await setItem(STORAGE_KEYS.ROUNDS, data.rounds);
    if (data.settings) await setItem(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.currentUser)
      await setItem(STORAGE_KEYS.CURRENT_USER, data.currentUser);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data (for debugging/reset)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export default {
  STORAGE_KEYS,
  setItem,
  getItem,
  removeItem,
  getPlayers,
  getPlayerById,
  savePlayer,
  deletePlayer,
  updatePlayerStats,
  getCourses,
  getCourseById,
  saveCourse,
  deleteCourse,
  toggleCourseFavorite,
  getRounds,
  getRoundById,
  saveRound,
  deleteRound,
  getRecentRounds,
  getRoundsByPlayerId,
  getRoundsByCourseId,
  getSettings,
  saveSettings,
  updateSettings,
  getCurrentUser,
  setCurrentUser,
  generateId,
  exportAllData,
  importData,
  clearAllData,
};
