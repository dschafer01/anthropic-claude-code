// History Screen

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { getRounds, getPlayers, getCurrentUser } from '../utils/storage';
import { formatRelativeToPar, calculateMonthlyPL, calculateScoringStats } from '../utils/statisticsCalculators';
import MoneyBadge from '../components/MoneyBadge';

const HistoryScreen = ({ navigation }) => {
  const [rounds, setRounds] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, won, lost
  const [loading, setLoading] = useState(true);
  const [bankBalance, setBankBalance] = useState(0);
  const [monthlyPL, setMonthlyPL] = useState([]);
  const [scoringStats, setScoringStats] = useState({ birdies: 0, eagles: 0, holeInOnes: 0 });

  const loadData = async () => {
    try {
      const [allRounds, allPlayers, user] = await Promise.all([
        getRounds(),
        getPlayers(),
        getCurrentUser(),
      ]);

      // Sort by date, newest first
      const sortedRounds = allRounds
        .filter((r) => r.isComplete)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setRounds(sortedRounds);
      setPlayers(allPlayers);
      setCurrentUser(user);

      if (user) {
        const userPlayer = allPlayers.find((p) => p.id === user.id);
        setBankBalance(userPlayer?.totalBankBalance || 0);

        const monthly = calculateMonthlyPL(allRounds, user.id, 6);
        setMonthlyPL(monthly);

        const stats = calculateScoringStats(allRounds, user.id);
        setScoringStats(stats);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getPlayerById = (id) => players.find((p) => p.id === id);

  const getFilteredRounds = () => {
    if (!currentUser) return rounds;

    switch (filter) {
      case 'won':
        return rounds.filter(
          (r) => (r.moneyResults?.[currentUser.id] || 0) > 0
        );
      case 'lost':
        return rounds.filter(
          (r) => (r.moneyResults?.[currentUser.id] || 0) < 0
        );
      default:
        return rounds;
    }
  };

  const getRoundScore = (round, playerId) => {
    const scores = round.scores[playerId] || [];
    const total = scores.reduce((a, b) => a + (b || 0), 0);

    let relativeToPar = 0;
    if (round.course?.holes) {
      const par = round.course.holes.reduce((sum, h) => sum + (h.par || 4), 0);
      relativeToPar = total - par;
    }

    return { total, relativeToPar };
  };

  const maxPLValue = Math.max(...monthlyPL.map((m) => Math.abs(m.amount)), 1);

  const renderRound = ({ item: round }) => {
    const userMoney = currentUser
      ? round.moneyResults?.[currentUser.id] || 0
      : 0;
    const opponents = round.players
      .filter((id) => id !== currentUser?.id)
      .map((id) => getPlayerById(id)?.name || 'Unknown')
      .join(', ');
    const userScore = currentUser
      ? getRoundScore(round, currentUser.id)
      : { total: 0, relativeToPar: 0 };

    return (
      <TouchableOpacity
        style={styles.roundCard}
        onPress={() =>
          navigation.navigate('RoundDetails', { roundId: round.id })
        }
      >
        <View style={styles.roundDate}>
          <Text style={styles.dateDay}>
            {new Date(round.date).getDate()}
          </Text>
          <Text style={styles.dateMonth}>
            {new Date(round.date).toLocaleString('default', { month: 'short' })}
          </Text>
        </View>

        <View style={styles.roundInfo}>
          <Text style={styles.courseName} numberOfLines={1}>
            {round.course?.name || 'Unknown Course'}
          </Text>
          {opponents && (
            <Text style={styles.opponents} numberOfLines={1}>
              vs {opponents}
            </Text>
          )}
        </View>

        {currentUser && (
          <View style={styles.scoreSection}>
            <Text style={styles.scoreTotal}>{userScore.total}</Text>
            <Text
              style={[
                styles.scoreRelative,
                userScore.relativeToPar < 0 && styles.scoreUnder,
                userScore.relativeToPar > 0 && styles.scoreOver,
              ]}
            >
              {formatRelativeToPar(userScore.relativeToPar)}
            </Text>
          </View>
        )}

        {round.moneyResults && currentUser && (
          <MoneyBadge amount={userMoney} size="small" />
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Bank Balance Card */}
      {currentUser && (
        <View style={styles.bankCard}>
          <Text style={styles.bankLabel}>YOUR BANK</Text>
          <View style={styles.bankRow}>
            <Text
              style={[
                styles.bankAmount,
                { color: bankBalance >= 0 ? colors.moneyPositive : colors.moneyNegative },
              ]}
            >
              {bankBalance >= 0 ? '+' : '-'}${Math.abs(bankBalance).toFixed(2)}
            </Text>
          </View>
          <Text style={styles.bankSubtext}>Lifetime Balance</Text>
        </View>
      )}

      {/* Monthly P&L Chart */}
      {monthlyPL.length > 0 && currentUser && (
        <View style={styles.plSection}>
          <Text style={styles.plTitle}>Monthly P&L</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {monthlyPL.map((month, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    {month.amount !== 0 && (
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${(Math.abs(month.amount) / maxPLValue) * 100}%`,
                            backgroundColor:
                              month.amount >= 0
                                ? colors.moneyPositive
                                : colors.moneyNegative,
                            alignSelf: month.amount >= 0 ? 'flex-end' : 'flex-start',
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={styles.barLabel}>{month.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Scoring Stats */}
      {currentUser && (
        <View style={styles.scoringStatsSection}>
          <View style={styles.scoringStatsRow}>
            <View style={styles.scoringStatCard}>
              <Text style={styles.scoringStatValue}>{scoringStats.birdies}</Text>
              <Text style={styles.scoringStatLabel}>Birdies</Text>
            </View>
            <View style={styles.scoringStatCard}>
              <Text style={styles.scoringStatValue}>{scoringStats.eagles}</Text>
              <Text style={styles.scoringStatLabel}>Eagles</Text>
            </View>
            <View style={styles.scoringStatCard}>
              <Text style={styles.scoringStatValue}>{scoringStats.holeInOnes}</Text>
              <Text style={styles.scoringStatLabel}>Hole-in-1s</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter header */}
      <View style={styles.filterHeader}>
        <Text style={styles.subtitle}>
          {getFilteredRounds().length} round
          {getFilteredRounds().length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.filterButtons}>
          {[
            { key: 'all', label: 'All' },
            { key: 'won', label: 'Won $' },
            { key: 'lost', label: 'Lost $' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterButton,
                filter === f.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === f.key && styles.filterButtonTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No rounds yet</Text>
      <Text style={styles.emptyText}>
        Complete your first round to see it here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={getFilteredRounds()}
        renderItem={renderRound}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  bankCard: {
    backgroundColor: colors.dark,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  bankLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white + '80',
    letterSpacing: 2,
    marginBottom: 8,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankAmount: {
    fontSize: 48,
    fontWeight: '800',
  },
  bankSubtext: {
    fontSize: 14,
    color: colors.white + '60',
    marginTop: 8,
  },
  plSection: {
    marginBottom: 16,
  },
  plTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
  scoringStatsSection: {
    marginBottom: 16,
  },
  scoringStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scoringStatCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scoringStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  scoringStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterHeader: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  roundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roundDate: {
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  roundInfo: {
    flex: 1,
    marginRight: 10,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  opponents: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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

export default HistoryScreen;
