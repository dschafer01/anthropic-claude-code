// Handicap Setup Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';
import {
  calculateCourseHandicap,
  distributeHandicapStrokes,
} from '../utils/handicapCalculators';
import Button from '../components/Button';

const HandicapSetupScreen = ({ navigation, route }) => {
  const { players, course, teeBox, bets } = route.params;

  const [useNetScores, setUseNetScores] = useState(true);
  const [playerHandicaps, setPlayerHandicaps] = useState({});

  // Calculate course handicaps on mount
  useEffect(() => {
    const handicaps = {};
    const par = course?.holes?.reduce((sum, h) => sum + (h.par || 4), 0) || 72;
    const slopeRating = course?.slopeRating?.[teeBox] || course?.slopeRating?.white || 113;
    const courseRating = course?.courseRating?.[teeBox] || course?.courseRating?.white || 72;

    players.forEach((player) => {
      if (player.handicapIndex != null) {
        const courseHcp = calculateCourseHandicap(
          player.handicapIndex,
          slopeRating,
          courseRating,
          par
        );

        const strokesPerHole = course?.holes
          ? distributeHandicapStrokes(courseHcp, course.holes)
          : [];

        handicaps[player.id] = {
          handicapIndex: player.handicapIndex,
          courseHandicap: courseHcp,
          strokesPerHole,
        };
      } else {
        handicaps[player.id] = {
          handicapIndex: null,
          courseHandicap: 0,
          strokesPerHole: [],
        };
      }
    });

    setPlayerHandicaps(handicaps);
  }, [players, course, teeBox]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleStartRound = () => {
    navigation.navigate('LiveScorecard', {
      players,
      course,
      teeBox,
      bets,
      useNetScores,
      playerHandicaps,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Net Scoring Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Use Net Scores</Text>
              <Text style={styles.toggleSubtitle}>
                Apply handicap strokes for betting
              </Text>
            </View>
            <Switch
              value={useNetScores}
              onValueChange={setUseNetScores}
              trackColor={{ false: colors.cardBorder, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Player Handicaps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Handicaps</Text>
          {players.map((player) => {
            const hcp = playerHandicaps[player.id];
            return (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: player.profileColor || colors.primary },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(player.name)}
                    </Text>
                  </View>
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.handicapIndex}>
                      {hcp?.handicapIndex != null
                        ? `Index: ${hcp.handicapIndex.toFixed(1)}`
                        : 'No handicap'}
                    </Text>
                  </View>
                </View>
                <View style={styles.courseHandicap}>
                  <Text style={styles.courseHandicapValue}>
                    {hcp?.courseHandicap || 0}
                  </Text>
                  <Text style={styles.courseHandicapLabel}>Course HCP</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Strokes Per Hole Preview */}
        {useNetScores && course?.holes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strokes by Hole</Text>
            <View style={styles.strokesTable}>
              <View style={styles.strokesHeader}>
                <Text style={[styles.strokesCell, styles.playerCell]}>Player</Text>
                {Array.from({ length: Math.min(9, course.holes.length) }, (_, i) => (
                  <Text key={i} style={styles.strokesCell}>
                    {i + 1}
                  </Text>
                ))}
              </View>
              {players.map((player) => {
                const hcp = playerHandicaps[player.id];
                return (
                  <View key={player.id} style={styles.strokesRow}>
                    <Text
                      style={[styles.strokesCell, styles.playerCell]}
                      numberOfLines={1}
                    >
                      {player.name.split(' ')[0]}
                    </Text>
                    {Array.from({ length: Math.min(9, course.holes.length) }, (_, i) => (
                      <View key={i} style={styles.strokesCell}>
                        {(hcp?.strokesPerHole?.[i] || 0) > 0 && (
                          <View style={styles.strokeDot}>
                            <Text style={styles.strokeDotText}>
                              {hcp.strokesPerHole[i]}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
            {course.holes.length > 9 && (
              <View style={[styles.strokesTable, { marginTop: 10 }]}>
                <View style={styles.strokesHeader}>
                  <Text style={[styles.strokesCell, styles.playerCell]}>Player</Text>
                  {Array.from({ length: Math.min(9, course.holes.length - 9) }, (_, i) => (
                    <Text key={i} style={styles.strokesCell}>
                      {i + 10}
                    </Text>
                  ))}
                </View>
                {players.map((player) => {
                  const hcp = playerHandicaps[player.id];
                  return (
                    <View key={player.id} style={styles.strokesRow}>
                      <Text
                        style={[styles.strokesCell, styles.playerCell]}
                        numberOfLines={1}
                      >
                        {player.name.split(' ')[0]}
                      </Text>
                      {Array.from(
                        { length: Math.min(9, course.holes.length - 9) },
                        (_, i) => (
                          <View key={i} style={styles.strokesCell}>
                            {(hcp?.strokesPerHole?.[i + 9] || 0) > 0 && (
                              <View style={styles.strokeDot}>
                                <Text style={styles.strokeDotText}>
                                  {hcp.strokesPerHole[i + 9]}
                                </Text>
                              </View>
                            )}
                          </View>
                        )
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Start Round" onPress={handleStartRound} size="large" />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  handicapIndex: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  courseHandicap: {
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  courseHandicapValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  courseHandicapLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  strokesTable: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  strokesHeader: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingVertical: 10,
  },
  strokesRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  strokesCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  playerCell: {
    flex: 2,
    paddingLeft: 10,
    textAlign: 'left',
    fontSize: 13,
    color: colors.text,
  },
  strokeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strokeDotText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
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

export default HandicapSetupScreen;
