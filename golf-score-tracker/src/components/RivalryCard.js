// Rivalry Card Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import MoneyBadge from './MoneyBadge';

const RivalryCard = ({ rivalry, currentUserId, onPress, style }) => {
  const opponent = rivalry.opponent;
  const isPlayer1 = rivalry.player1Id === currentUserId;

  const wins = isPlayer1 ? rivalry.player1Wins : rivalry.player2Wins;
  const losses = isPlayer1 ? rivalry.player2Wins : rivalry.player1Wins;
  const money = isPlayer1
    ? rivalry.player1MoneyTotal
    : rivalry.player2MoneyTotal;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getResultColor = (result) => {
    if (result === 'W') return colors.moneyPositive;
    if (result === 'L') return colors.moneyNegative;
    return colors.textMuted;
  };

  const getRecordColor = () => {
    if (wins > losses) return colors.moneyPositive;
    if (losses > wins) return colors.moneyNegative;
    return colors.textSecondary;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: opponent.profileColor || colors.primary },
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(opponent.name)}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.name}>{opponent.name}</Text>
        <View style={styles.record}>
          <Text style={[styles.recordText, { color: getRecordColor() }]}>
            {wins}-{losses}-{rivalry.ties}
          </Text>
          <Text style={styles.rounds}>
            ({rivalry.totalRounds} round{rivalry.totalRounds !== 1 ? 's' : ''})
          </Text>
        </View>

        {/* Last 5 results */}
        <View style={styles.lastFive}>
          {rivalry.lastFiveResults.map((result, index) => (
            <View
              key={index}
              style={[
                styles.resultDot,
                { backgroundColor: getResultColor(result) },
              ]}
            >
              <Text style={styles.resultText}>{result}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.right}>
        <MoneyBadge amount={money} size="small" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  left: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  center: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordText: {
    fontSize: 15,
    fontWeight: '700',
  },
  rounds: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 6,
  },
  lastFive: {
    flexDirection: 'row',
    gap: 4,
  },
  resultDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  right: {
    marginLeft: 10,
  },
});

export default RivalryCard;
