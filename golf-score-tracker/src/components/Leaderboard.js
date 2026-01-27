// Leaderboard Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import MoneyBadge from './MoneyBadge';
import { formatRelativeToPar } from '../utils/statisticsCalculators';

const Leaderboard = ({
  players,
  scores,
  course,
  moneyResults,
  currentHole,
  showMoney = true,
  compact = false,
  style,
}) => {
  // Calculate leaderboard data
  const leaderboardData = players
    .map((player) => {
      const playerScores = scores[player.id] || [];
      const holesPlayed = playerScores.filter((s) => s > 0).length;
      const totalScore = playerScores.reduce((a, b) => a + (b || 0), 0);

      // Calculate relative to par
      let relativeToPar = 0;
      if (course?.holes) {
        const parThrough = course.holes
          .slice(0, holesPlayed)
          .reduce((sum, hole) => sum + (hole?.par || 4), 0);
        relativeToPar = totalScore - parThrough;
      }

      return {
        player,
        totalScore,
        holesPlayed,
        relativeToPar,
        money: moneyResults?.[player.id] || 0,
      };
    })
    .sort((a, b) => {
      // Sort by relative to par, then by holes played
      if (a.relativeToPar !== b.relativeToPar) {
        return a.relativeToPar - b.relativeToPar;
      }
      return b.holesPlayed - a.holesPlayed;
    });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getPositionStyle = (index) => {
    if (index === 0) return styles.positionFirst;
    return styles.positionOther;
  };

  if (compact) {
    return (
      <View style={[styles.containerCompact, style]}>
        {leaderboardData.map((entry, index) => (
          <View key={entry.player.id} style={styles.rowCompact}>
            <Text style={[styles.position, getPositionStyle(index)]}>
              {index + 1}
            </Text>
            <View
              style={[
                styles.avatarSmall,
                { backgroundColor: entry.player.profileColor || colors.primary },
              ]}
            >
              <Text style={styles.avatarTextSmall}>
                {getInitials(entry.player.name)}
              </Text>
            </View>
            <Text style={styles.scoreCompact}>
              {formatRelativeToPar(entry.relativeToPar)}
            </Text>
            {showMoney && (
              <MoneyBadge amount={entry.money} size="small" />
            )}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Leaderboard</Text>
        {currentHole && (
          <Text style={styles.thru}>Thru {currentHole}</Text>
        )}
      </View>

      {leaderboardData.map((entry, index) => (
        <View key={entry.player.id} style={styles.row}>
          <View style={[styles.positionContainer, getPositionStyle(index)]}>
            <Text style={styles.positionText}>{index + 1}</Text>
          </View>

          <View
            style={[
              styles.avatar,
              { backgroundColor: entry.player.profileColor || colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {getInitials(entry.player.name)}
            </Text>
          </View>

          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{entry.player.name}</Text>
            <Text style={styles.thruHoles}>
              Thru {entry.holesPlayed}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text
              style={[
                styles.score,
                entry.relativeToPar < 0 && styles.scoreUnder,
                entry.relativeToPar > 0 && styles.scoreOver,
              ]}
            >
              {formatRelativeToPar(entry.relativeToPar)}
            </Text>
            <Text style={styles.totalStrokes}>{entry.totalScore}</Text>
          </View>

          {showMoney && (
            <MoneyBadge amount={entry.money} size="small" />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  containerCompact: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  thru: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  rowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  positionContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  positionFirst: {
    backgroundColor: colors.warning,
  },
  positionOther: {
    backgroundColor: colors.card,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  position: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  avatarTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  thruHoles: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scoreUnder: {
    color: colors.primary,
  },
  scoreOver: {
    color: colors.danger,
  },
  scoreCompact: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  totalStrokes: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default Leaderboard;
