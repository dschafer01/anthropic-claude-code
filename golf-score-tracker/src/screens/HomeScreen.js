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
import { getAllRivalries, calculateMonthlyPL } from '../utils/statisticsCalculators';
import MoneyBadge from '../components/MoneyBadge';
import RivalryCard from '../components/RivalryCard';
import Button from '../components/Button';

const HomeScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [bankBalance, setBankBalance] = useState(0);
  const [recentRounds, setRecentRounds] = useState([]);
  const [topRivalries, setTopRivalries] = useState([]);
  const [monthlyPL, setMonthlyPL] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [players, setPlayers] = useState([]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      const allPlayers = await getPlayers();
      setPlayers(allPlayers);

      const allRounds = await getRounds();
      const recent = await getRecentRounds(5);
      setRecentRounds(recent);

      if (user) {
        // Calculate bank balance
        const userPlayer = allPlayers.find((p) => p.id === user.id);
        setBankBalance(userPlayer?.totalBankBalance || 0);

        // Get top rivalries
        const rivalries = getAllRivalries(allRounds, user.id, allPlayers);
        setTopRivalries(rivalries.slice(0, 3));

        // Calculate monthly P&L
        const monthly = calculateMonthlyPL(allRounds, user.id, 6);
        setMonthlyPL(monthly);
      }
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

  const getPlayerById = (id) => players.find((p) => p.id === id);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const maxPLValue = Math.max(...monthlyPL.map((m) => Math.abs(m.amount)), 1);

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
            {currentUser ? `Welcome, ${currentUser.name}` : 'Golf Score Tracker'}
          </Text>
        </View>

        {/* Bank Balance Card */}
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

        {/* Monthly P&L Chart */}
        {monthlyPL.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly P&L</Text>
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

        {/* Quick Action */}
        <View style={styles.section}>
          <Button
            title="Start New Round"
            icon="🏌️"
            size="large"
            onPress={() => navigation.navigate('NewRound', { screen: 'RoundSetup' })}
            style={styles.newRoundButton}
          />
        </View>

        {/* Top Rivalries */}
        {topRivalries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rivalries 🔥</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Rivalries')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {topRivalries.map((rivalry) => (
              <RivalryCard
                key={rivalry.player2Id}
                rivalry={rivalry}
                currentUserId={currentUser?.id}
                onPress={() =>
                  navigation.navigate('Rivalries', {
                    screen: 'HeadToHead',
                    params: { rivalry, opponent: rivalry.opponent },
                  })
                }
              />
            ))}
          </View>
        )}

        {/* Recent Rounds */}
        {recentRounds.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Rounds</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('History')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentRounds.map((round) => {
              const userMoney = currentUser
                ? round.moneyResults?.[currentUser.id] || 0
                : 0;
              const opponents = round.players
                .filter((id) => id !== currentUser?.id)
                .map((id) => getPlayerById(id)?.name || 'Unknown')
                .join(', ');

              return (
                <TouchableOpacity
                  key={round.id}
                  style={styles.roundCard}
                  onPress={() =>
                    navigation.navigate('RoundDetails', { roundId: round.id })
                  }
                >
                  <View style={styles.roundMain}>
                    <Text style={styles.roundDate}>{formatDate(round.date)}</Text>
                    <Text style={styles.roundCourse} numberOfLines={1}>
                      {round.course?.name || 'Unknown Course'}
                    </Text>
                    {opponents && (
                      <Text style={styles.roundOpponents} numberOfLines={1}>
                        vs {opponents}
                      </Text>
                    )}
                  </View>
                  {currentUser && (
                    <MoneyBadge amount={userMoney} size="small" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {recentRounds.length === 0 && topRivalries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⛳️</Text>
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
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  bankCard: {
    backgroundColor: colors.dark,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  newRoundButton: {
    width: '100%',
  },
  roundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  roundOpponents: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
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
