// Head to Head Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';
import { getCurrentUser, getRounds, getCourseById } from '../utils/storage';
import { calculateRivalry } from '../utils/statisticsCalculators';
import MoneyBadge from '../components/MoneyBadge';
import Button from '../components/Button';

const HeadToHeadScreen = ({ navigation, route }) => {
  const { opponent } = route.params;

  const [rivalry, setRivalry] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      const rounds = await getRounds();
      const rivalryData = calculateRivalry(rounds, user.id, opponent.id);
      setRivalry(rivalryData);

      // Load match history with course names
      if (rivalryData?.allResults) {
        const historyWithCourses = await Promise.all(
          rivalryData.allResults.reverse().map(async (result) => {
            const round = rounds.find((r) => r.id === result.roundId);
            let courseName = round?.course?.name;
            if (!courseName && round?.courseId) {
              const course = await getCourseById(round.courseId);
              courseName = course?.name;
            }
            return {
              ...result,
              courseName: courseName || 'Unknown Course',
              money: round?.moneyResults?.[user.id] || 0,
            };
          })
        );
        setMatchHistory(historyWithCourses);
      }
    } catch (error) {
      console.error('Error loading head to head data:', error);
    } finally {
      setLoading(false);
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

  const handleChallenge = () => {
    navigation.navigate('NewRound', {
      screen: 'RoundSetup',
      params: {
        preselectedPlayers: [opponent],
      },
    });
  };

  if (loading || !rivalry) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isPlayer1 = rivalry.player1Id === currentUser?.id;
  const myWins = isPlayer1 ? rivalry.player1Wins : rivalry.player2Wins;
  const theirWins = isPlayer1 ? rivalry.player2Wins : rivalry.player1Wins;
  const myMoney = isPlayer1 ? rivalry.player1MoneyTotal : rivalry.player2MoneyTotal;

  const getResultColor = (result) => {
    if (result === 'W') return colors.moneyPositive;
    if (result === 'L') return colors.moneyNegative;
    return colors.textMuted;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.vsSection}>
          <View style={styles.playerColumn}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: currentUser?.profileColor || colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(currentUser?.name || 'You')}
              </Text>
            </View>
            <Text style={styles.playerName}>{currentUser?.name || 'You'}</Text>
          </View>

          <View style={styles.recordCenter}>
            <Text style={styles.recordScore}>
              {myWins} - {theirWins}
            </Text>
            {rivalry.ties > 0 && (
              <Text style={styles.tiesText}>{rivalry.ties} ties</Text>
            )}
          </View>

          <View style={styles.playerColumn}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: opponent.profileColor || colors.danger },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(opponent.name)}</Text>
            </View>
            <Text style={styles.playerName}>{opponent.name}</Text>
          </View>
        </View>
      </View>

      {/* Money Total */}
      <View style={styles.moneyCard}>
        <Text style={styles.moneyLabel}>LIFETIME VS {opponent.name.toUpperCase()}</Text>
        <MoneyBadge amount={myMoney} size="xlarge" />
      </View>

      {/* Last 5 Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last 5 Matches</Text>
        <View style={styles.lastFive}>
          {rivalry.lastFiveResults.map((result, index) => (
            <View
              key={index}
              style={[
                styles.resultCircle,
                { backgroundColor: getResultColor(result) },
              ]}
            >
              <Text style={styles.resultText}>{result}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{rivalry.totalRounds}</Text>
            <Text style={styles.statLabel}>Total Rounds</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {((myWins / rivalry.totalRounds) * 100).toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ${Math.abs(myMoney / rivalry.totalRounds).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Avg per Round</Text>
          </View>
        </View>
      </View>

      {/* Match History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match History</Text>
        {matchHistory.map((match, index) => (
          <TouchableOpacity
            key={index}
            style={styles.matchCard}
            onPress={() =>
              navigation.navigate('RoundDetails', { roundId: match.roundId })
            }
          >
            <View
              style={[
                styles.matchResult,
                { backgroundColor: getResultColor(match.result) },
              ]}
            >
              <Text style={styles.matchResultText}>{match.result}</Text>
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.matchCourse}>{match.courseName}</Text>
              <Text style={styles.matchDate}>
                {new Date(match.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.matchScore}>
              <Text style={styles.matchScoreText}>
                {match.p1Score} - {match.p2Score}
              </Text>
            </View>
            <MoneyBadge amount={match.money} size="small" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenge Button */}
      <View style={styles.challengeSection}>
        <Button
          title={`Challenge ${opponent.name}`}
          onPress={handleChallenge}
          size="large"
        />
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  vsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  recordCenter: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordScore: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  tiesText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  moneyCard: {
    backgroundColor: colors.dark,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  moneyLabel: {
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
  lastFive: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  resultCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  matchResult: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  matchResultText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  matchInfo: {
    flex: 1,
  },
  matchCourse: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  matchDate: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  matchScore: {
    marginRight: 12,
  },
  matchScoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  challengeSection: {
    marginTop: 8,
  },
});

export default HeadToHeadScreen;
