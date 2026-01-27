// Player Card Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import MoneyBadge from './MoneyBadge';

const PlayerCard = ({
  player,
  selected = false,
  onPress,
  onLongPress,
  showMoney = false,
  showHandicap = false,
  style,
}) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: player.profileColor || colors.primary },
        ]}
      >
        <Text style={styles.avatarText}>{getInitials(player.name)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{player.name}</Text>
        {showHandicap && player.handicapIndex !== null && (
          <Text style={styles.handicap}>
            HCP: {player.handicapIndex?.toFixed(1) || 'N/A'}
          </Text>
        )}
        {player.ghinNumber && (
          <Text style={styles.ghin}>GHIN: {player.ghinNumber}</Text>
        )}
      </View>

      {showMoney && player.totalBankBalance !== undefined && (
        <MoneyBadge amount={player.totalBankBalance} size="small" />
      )}

      {selected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
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
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  handicap: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ghin: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PlayerCard;
