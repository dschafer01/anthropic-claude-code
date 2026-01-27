// Home/Dashboard Screen

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import {
  getCurrentUser,
  getPlayers,
  getRounds,
  getRecentRounds,
} from '../utils/storage';
import MoneyBadge from '../components/MoneyBadge';
import Button from '../components/Button';

const HomeScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [latestRound, setLatestRound] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [players, setPlayers] = useState([]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      const allPlayers = await getPlayers();
      setPlayers(allPlayers);

      const recent = await getRecentRounds(1);
      setLatestRound(recent.length > 0 ? recent[0] : null);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLatestRoundScore = () => {
    if (!latestRound || !currentUser) return null;
    const playerScores = latestRound.scores[currentUser.id] || [];
    const total = playerScores.reduce((a, b) => a + (b || 0), 0);
    let relativeToPar = 0;
    if (latestRound.course?.holes) {
      const par = latestRound.course.holes.reduce((sum, h) => sum + (h.par || 4), 0);
      relativeToPar = total - par;
    }
    return { total, relativeToPar };
  };

  const score = getLatestRoundScore();
  const userMoney = currentUser && latestRound
    ? latestRound.moneyResults?.[currentUser.id] || 0
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {currentUser ? `Welcome back, ${currentUser.name}` : 'Golf Score Tracker'}
          </Text>
        </View>

        {/* Latest Round Card */}
        {latestRound && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Round</Text>
            <TouchableOpacity
              style={styles.roundCard}
              onPress={() =>
                navigation.navigate('History', {
                  screen: 'RoundDetails',
                  params: { roundId: latestRound.id },
                })
              }
            >
              <View style={styles.roundMain}>
                <Text style={styles.roundDate}>{formatDate(latestRound.date)}</Text>
                <Text style={styles.roundCourse} numberOfLines={1}>
                  {latestRound.course?.name || 'Unknown Course'}
                </Text>
              </View>
              {score && (
                <View style={styles.scoreSection}>
                  <Text style={styles.scoreTotal}>{score.total}</Text>
                  <Text
                    style={[
                      styles.scoreRelative,
                      score.relativeToPar < 0 && styles.scoreUnder,
                      score.relativeToPar > 0 && styles.scoreOver,
                    ]}
                  >
                    {score.relativeToPar === 0
                      ? 'E'
                      : score.relativeToPar > 0
                      ? `+${score.relativeToPar}`
                      : `${score.relativeToPar}`}
                  </Text>
                </View>
              )}
              {latestRound.moneyResults && currentUser && (
                <MoneyBadge amount={userMoney} size="small" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Start New Round */}
        <View style={styles.section}>
          <Button
            title="Start New Round"
            size="large"
            onPress={() => navigation.navigate('NewRound', { screen: 'RoundSetup' })}
            style={styles.newRoundButton}
          />
        </View>

        {/* Empty State */}
        {!latestRound && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No rounds yet</Text>
            <Text style={styles.emptyText}>
              Start your first round to track scores and rivalries!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
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
  roundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roundMain: {
    flex: 1,
    marginRight: 10,
  },
  roundDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  roundCourse: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  scoreSection: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  scoreTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scoreRelative: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scoreUnder: {
    color: colors.primary,
  },
  scoreOver: {
    color: colors.danger,
  },
  newRoundButton: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default HomeScreen;
