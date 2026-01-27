// Round Details Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../constants/colors';
import { getRoundById, getPlayerById, getCourseById, deleteRound } from '../utils/storage';
import { formatRelativeToPar } from '../utils/statisticsCalculators';
import { shareRoundSummary } from '../utils/dataExport';
import MoneyBadge from '../components/MoneyBadge';
import Button from '../components/Button';

const RoundDetailsScreen = ({ navigation, route }) => {
  const { roundId } = route.params;

  const [round, setRound] = useState(null);
  const [players, setPlayers] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoundData();
  }, [roundId]);

  const loadRoundData = async () => {
    try {
      const roundData = await getRoundById(roundId);
      if (roundData) {
        setRound(roundData);

        // Load players
        const playerPromises = roundData.players.map((id) => getPlayerById(id));
        const loadedPlayers = await Promise.all(playerPromises);
        setPlayers(loadedPlayers.filter(Boolean));

        // Load course
        if (roundData.courseId) {
          const courseData = await getCourseById(roundData.courseId);
          setCourse(courseData || roundData.course);
        } else {
          setCourse(roundData.course);
        }
      }
    } catch (error) {
      console.error('Error loading round:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStats = (player) => {
    if (!round || !player) return { total: 0, relativeToPar: 0 };

    const playerScores = round.scores[player.id] || [];
    const total = playerScores.reduce((a, b) => a + (b || 0), 0);

    let relativeToPar = 0;
    if (course?.holes) {
      const par = course.holes.reduce((sum, h) => sum + (h.par || 4), 0);
      relativeToPar = total - par;
    }

    return { total, relativeToPar };
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleShare = async () => {
    try {
      await shareRoundSummary(round, players, course);
    } catch (error) {
      Alert.alert('Error', 'Failed to share round');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Round',
      'Are you sure you want to delete this round? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRound(roundId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!round) {
    return (
      <View style={styles.loading}>
        <Text>Round not found</Text>
      </View>
    );
  }

  const sortedPlayers = [...players].sort((a, b) => {
    const aStats = getPlayerStats(a);
    const bStats = getPlayerStats(b);
    return aStats.total - bStats.total;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

      {/* Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Results</Text>
        <View style={styles.resultsCard}>
          {sortedPlayers.map((player, index) => {
            const stats = getPlayerStats(player);
            const money = round.moneyResults?.[player.id] || 0;

            return (
              <View key={player.id} style={styles.resultRow}>
                <View style={styles.position}>
                  <Text style={styles.positionText}>{index + 1}</Text>
                </View>

                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: player.profileColor || colors.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>{getInitials(player.name)}</Text>
                </View>

                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>

                <View style={styles.scoreInfo}>
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

                {round.moneyResults && (
                  <MoneyBadge amount={money} size="small" />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Scorecard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scorecard</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.scorecard}>
            {/* Header row */}
            <View style={styles.scorecardRow}>
              <View style={[styles.scorecardCell, styles.nameCell]}>
                <Text style={styles.headerText}>Hole</Text>
              </View>
              {Array.from({ length: course?.holes?.length || 18 }, (_, i) => (
                <View key={i} style={styles.scorecardCell}>
                  <Text style={styles.headerText}>{i + 1}</Text>
                </View>
              ))}
              <View style={[styles.scorecardCell, styles.totalCell]}>
                <Text style={styles.headerText}>TOT</Text>
              </View>
            </View>

            {/* Par row */}
            <View style={[styles.scorecardRow, styles.parRow]}>
              <View style={[styles.scorecardCell, styles.nameCell]}>
                <Text style={styles.parText}>Par</Text>
              </View>
              {(course?.holes || []).map((hole, i) => (
                <View key={i} style={styles.scorecardCell}>
                  <Text style={styles.parText}>{hole.par}</Text>
                </View>
              ))}
              <View style={[styles.scorecardCell, styles.totalCell]}>
                <Text style={styles.parText}>
                  {course?.holes?.reduce((sum, h) => sum + (h.par || 4), 0) || 72}
                </Text>
              </View>
            </View>

            {/* Player rows */}
            {players.map((player) => {
              const stats = getPlayerStats(player);
              return (
                <View key={player.id} style={styles.scorecardRow}>
                  <View style={[styles.scorecardCell, styles.nameCell]}>
                    <Text style={styles.playerNameSmall} numberOfLines={1}>
                      {player.name.split(' ')[0]}
                    </Text>
                  </View>
                  {(round.scores[player.id] || []).map((score, i) => {
                    const par = course?.holes?.[i]?.par || 4;
                    const diff = score - par;
                    return (
                      <View key={i} style={styles.scorecardCell}>
                        <Text
                          style={[
                            styles.scoreText,
                            diff < 0 && styles.scoreUnder,
                            diff > 0 && styles.scoreOver,
                          ]}
                        >
                          {score || '-'}
                        </Text>
                      </View>
                    );
                  })}
                  <View style={[styles.scorecardCell, styles.totalCell]}>
                    <Text style={styles.totalText}>{stats.total}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Share Round"
          variant="outline"
          onPress={handleShare}
          style={styles.actionButton}
        />
        <Button
          title="Delete Round"
          variant="danger"
          onPress={handleDelete}
          style={styles.actionButton}
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
    alignItems: 'center',
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
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
  resultsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  position: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  positionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  scoreInfo: {
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
  scorecard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scorecardRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  parRow: {
    backgroundColor: colors.card,
  },
  scorecardCell: {
    width: 34,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameCell: {
    width: 60,
    paddingLeft: 10,
    alignItems: 'flex-start',
  },
  totalCell: {
    width: 44,
    backgroundColor: colors.card + '50',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  parText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  playerNameSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});

export default RoundDetailsScreen;
