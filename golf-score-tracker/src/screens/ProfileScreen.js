// Profile Screen

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import {
  getCurrentUser,
  setCurrentUser,
  getPlayers,
  getRounds,
  savePlayer,
} from '../utils/storage';
import { calculatePlayerStats } from '../utils/statisticsCalculators';
import { shareDataExport } from '../utils/dataExport';
import { formatHandicap } from '../utils/handicapCalculators';
import MoneyBadge from '../components/MoneyBadge';
import Button from '../components/Button';

const ProfileScreen = ({ navigation }) => {
  const [currentUser, setCurrentUserState] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUserState(user);

      if (user) {
        const rounds = await getRounds();
        const playerStats = calculatePlayerStats(rounds, user.id);
        setStats(playerStats);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleSetupProfile = async () => {
    navigation.navigate('AddPlayer', {
      onPlayerAdded: async (player) => {
        await setCurrentUser(player);
        loadData();
      },
    });
  };

  const handleExportData = async () => {
    try {
      await shareDataExport();
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderProfileHeader = () => {
    if (!currentUser) {
      return (
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Set Up Your Profile</Text>
          <Text style={styles.setupText}>
            Create your profile to track your stats and lifetime bank balance
          </Text>
          <Button
            title="Create Profile"
            onPress={handleSetupProfile}
            style={styles.setupButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.profileCard}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: currentUser.profileColor || colors.primary },
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(currentUser.name)}</Text>
        </View>
        <Text style={styles.userName}>{currentUser.name}</Text>
        {currentUser.handicapIndex != null && (
          <Text style={styles.handicap}>
            Handicap: {formatHandicap(currentUser.handicapIndex)}
          </Text>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('AddPlayer', {
              player: currentUser,
              onPlayerAdded: async (player) => {
                await savePlayer(player);
                await setCurrentUser(player);
                loadData();
              },
            })
          }
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBankBalance = () => {
    if (!currentUser) return null;

    return (
      <View style={styles.bankCard}>
        <Text style={styles.bankLabel}>LIFETIME BANK</Text>
        <MoneyBadge amount={stats?.totalMoney || 0} size="xlarge" />
      </View>
    );
  };

  const renderStats = () => {
    if (!currentUser || !stats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalRounds}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.bestScore || '-'}</Text>
            <Text style={styles.statLabel}>Best Round</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.averageScore?.toFixed(1) || '-'}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Par Averages */}
        {(stats.averagePar3 || stats.averagePar4 || stats.averagePar5) && (
          <View style={styles.parStats}>
            <Text style={styles.parStatsTitle}>Scoring by Par</Text>
            <View style={styles.parStatsRow}>
              {stats.averagePar3 && (
                <View style={styles.parStat}>
                  <Text style={styles.parStatLabel}>Par 3</Text>
                  <Text style={styles.parStatValue}>{stats.averagePar3}</Text>
                </View>
              )}
              {stats.averagePar4 && (
                <View style={styles.parStat}>
                  <Text style={styles.parStatLabel}>Par 4</Text>
                  <Text style={styles.parStatValue}>{stats.averagePar4}</Text>
                </View>
              )}
              {stats.averagePar5 && (
                <View style={styles.parStat}>
                  <Text style={styles.parStatLabel}>Par 5</Text>
                  <Text style={styles.parStatValue}>{stats.averagePar5}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMenuItems = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      {[
        {
          title: 'App Settings',
          subtitle: 'Sound, haptics, theme',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          title: 'Manage Courses',
          subtitle: `${stats?.totalRounds || 0} rounds played`,
          onPress: () => navigation.navigate('CourseManagement'),
        },
        {
          title: 'Manage Players',
          subtitle: 'Add or edit players',
          onPress: () => navigation.navigate('PlayerManagement'),
        },
        {
          title: 'GHIN Setup',
          subtitle: currentUser?.ghinNumber || 'Not connected',
          onPress: () => navigation.navigate('GHINSetup'),
        },
        {
          title: 'Export Data',
          subtitle: 'Backup your rounds and stats',
          onPress: handleExportData,
        },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={item.onPress}
        >
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.menuArrow}>></Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderProfileHeader()}
      {renderBankBalance()}
      {renderStats()}
      {renderMenuItems()}

      <View style={styles.footer}>
        <Text style={styles.version}>Golf Score Tracker v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  setupCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  setupButton: {
    marginTop: 8,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  handicap: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bankCard: {
    backgroundColor: colors.dark,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  bankLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white + '70',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  parStats: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  parStatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  parStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  parStat: {
    alignItems: 'center',
  },
  parStatLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  parStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  version: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

export default ProfileScreen;
