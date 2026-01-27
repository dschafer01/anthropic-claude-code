// Round Summary Screen

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { shareRoundSummary } from '../utils/dataExport';
import { formatRelativeToPar } from '../utils/statisticsCalculators';
import MoneyBadge from '../components/MoneyBadge';
import Button from '../components/Button';

const RoundSummaryScreen = ({ navigation, route }) => {
  const { round, players, moneyResults } = route.params;
  const { scores, course, bets } = round;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getPlayerStats = (player) => {
    const playerScores = scores[player.id] || [];
    const total = playerScores.reduce((a, b) => a + (b || 0), 0);
    const front = playerScores.slice(0, 9).reduce((a, b) => a + (b || 0), 0);
    const back = playerScores.slice(9, 18).reduce((a, b) => a + (b || 0), 0);

    let relativeToPar = 0;
    if (course?.holes) {
      const par = course.holes.reduce((sum, h) => sum + (h.par || 4), 0);
      relativeToPar = total - par;
    }

    return { total, front, back, relativeToPar };
  };

  // Sort players by total score
  const sortedPlayers = [...players].sort((a, b) => {
    const aStats = getPlayerStats(a);
    const bStats = getPlayerStats(b);
    return aStats.total - bStats.total;
  });

  const handleShare = async () => {
    try {
      await shareRoundSummary(round, players, course);
    } catch (error) {
      Alert.alert('Error', 'Failed to share round');
    }
  };

  const handleRematch = () => {
    navigation.replace('BetSetup', {
      players,
      course,
      teeBox: round.teeBox,
    });
  };

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.popToTop();
    navigation.navigate('Home');
  };

  const hasBets = bets && bets.length > 0;
  const bigWinner = hasBets
    ? sortedPlayers.reduce((winner, player) => {
        const money = moneyResults[player.id] || 0;
        const winnerMoney = moneyResults[winner?.id] || 0;
        return money > winnerMoney ? player : winner;
      }, sortedPlayers[0])
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.courseTitle}>{course?.name || 'Unknown Course'}</Text>
          <Text style={styles.dateText}>
            {new Date(round.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Winner Banner (if betting) */}
        {hasBets && bigWinner && (moneyResults[bigWinner.id] || 0) > 0 && (
          <View style={styles.winnerBanner}>
            <Text style={styles.winnerText}>
              {bigWinner.name} wins ${(moneyResults[bigWinner.id] || 0).toFixed(2)}
            </Text>
          </View>
        )}

        {/* Scorecard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Scores</Text>
          <View style={styles.scorecard}>
            {sortedPlayers.map((player, index) => {
              const stats = getPlayerStats(player);
              const money = moneyResults[player.id] || 0;

              return (
                <View key={player.id} style={styles.scorecardRow}>
                  <View style={styles.scorecardPosition}>
                    <Text style={[
                      styles.positionNumber,
                      index === 0 && styles.positionFirst,
                    ]}>
                      {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.scorecardAvatar,
                      { backgroundColor: player.profileColor || colors.primary },
                    ]}
                  >
                    <Text style={styles.avatarText}>{getInitials(player.name)}</Text>
                  </View>

                  <View style={styles.scorecardInfo}>
                    <Text style={styles.scorecardName}>{player.name}</Text>
                    <Text style={styles.scorecardDetails}>
                      {stats.front} / {stats.back}
                    </Text>
                  </View>

                  <View style={styles.scorecardScore}>
                    <Text style={styles.scoreTotal}>{stats.total}</Text>
                    <Text
                      style={[
                        styles.scoreRelative,
                        stats.relativeToPar < 0 && styles.scoreUnder,
                        stats.relativeToPar > 0 && styles.scoreOver,
                      ]}
                    >
                      {formatRelativeToPar(stats.relativeToPar)}
                    </Text>
                  </View>

                  {hasBets && (
                    <MoneyBadge amount={money} size="small" />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Money Breakdown (if betting) */}
        {hasBets && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Money Results</Text>
            <View style={styles.moneyBreakdown}>
              {bets.map((bet, index) => (
                <View key={index} style={styles.betRow}>
                  <Text style={styles.betType}>{bet.type}</Text>
                  <Text style={styles.betAmount}>
                    ${bet.amount || bet.amounts?.front || 0}
                    {bet.amounts && ' per'}
                  </Text>
                </View>
              ))}
              <View style={styles.moneyDivider} />
              {sortedPlayers.map((player) => (
                <View key={player.id} style={styles.moneyRow}>
                  <Text style={styles.moneyPlayerName}>{player.name}</Text>
                  <MoneyBadge amount={moneyResults[player.id] || 0} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Scorecard by Hole (abbreviated) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hole-by-Hole</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.holeTable}>
              {/* Header */}
              <View style={styles.holeTableRow}>
                <View style={[styles.holeTableCell, styles.playerNameCell]}>
                  <Text style={styles.holeTableHeader}>Hole</Text>
                </View>
                {Array.from({ length: course?.holes?.length || 18 }, (_, i) => (
                  <View key={i} style={styles.holeTableCell}>
                    <Text style={styles.holeTableHeader}>{i + 1}</Text>
                  </View>
                ))}
                <View style={[styles.holeTableCell, styles.totalCell]}>
                  <Text style={styles.holeTableHeader}>TOT</Text>
                </View>
              </View>

              {/* Par row */}
              <View style={[styles.holeTableRow, styles.parRow]}>
                <View style={[styles.holeTableCell, styles.playerNameCell]}>
                  <Text style={styles.parLabel}>Par</Text>
                </View>
                {(course?.holes || []).map((hole, i) => (
                  <View key={i} style={styles.holeTableCell}>
                    <Text style={styles.parValue}>{hole.par}</Text>
                  </View>
                ))}
                <View style={[styles.holeTableCell, styles.totalCell]}>
                  <Text style={styles.parValue}>
                    {course?.holes?.reduce((sum, h) => sum + (h.par || 4), 0) || 72}
                  </Text>
                </View>
              </View>

              {/* Player rows */}
              {players.map((player) => {
                const stats = getPlayerStats(player);
                return (
                  <View key={player.id} style={styles.holeTableRow}>
                    <View style={[styles.holeTableCell, styles.playerNameCell]}>
                      <Text style={styles.holePlayerName} numberOfLines={1}>
                        {player.name.split(' ')[0]}
                      </Text>
                    </View>
                    {(scores[player.id] || []).map((score, i) => {
                      const par = course?.holes?.[i]?.par || 4;
                      const diff = score - par;
                      return (
                        <View key={i} style={styles.holeTableCell}>
                          <Text
                            style={[
                              styles.holeScore,
                              diff < 0 && styles.holeScoreUnder,
                              diff > 0 && styles.holeScoreOver,
                            ]}
                          >
                            {score || '-'}
                          </Text>
                        </View>
                      );
                    })}
                    <View style={[styles.holeTableCell, styles.totalCell]}>
                      <Text style={styles.holeTotalScore}>{stats.total}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRematch}>
            <Text style={styles.actionText}>Rematch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Done" onPress={handleDone} size="large" />
      </View>
    </View>
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
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  winnerBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.moneyPositive + '20',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.moneyPositive,
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
  scorecard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scorecardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  scorecardPosition: {
    width: 34,
    alignItems: 'center',
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  positionFirst: {
    color: colors.primary,
    fontWeight: '700',
  },
  scorecardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  scorecardInfo: {
    flex: 1,
  },
  scorecardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scorecardDetails: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  scorecardScore: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  scoreTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scoreRelative: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scoreUnder: {
    color: colors.primary,
  },
  scoreOver: {
    color: colors.danger,
  },
  moneyBreakdown: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  betRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  betType: {
    fontSize: 15,
    color: colors.text,
  },
  betAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  moneyDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  moneyPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  holeTable: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  holeTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  parRow: {
    backgroundColor: colors.card,
  },
  holeTableCell: {
    width: 36,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerNameCell: {
    width: 70,
    paddingLeft: 10,
    alignItems: 'flex-start',
  },
  totalCell: {
    width: 44,
    backgroundColor: colors.card + '50',
  },
  holeTableHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  parLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  parValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  holePlayerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  holeScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  holeScoreUnder: {
    color: colors.primary,
  },
  holeScoreOver: {
    color: colors.danger,
  },
  holeTotalScore: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});

export default RoundSummaryScreen;
