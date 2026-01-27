// Bet Type Selector Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { BET_TYPES, betTypeConfig } from '../constants/betTypes';

const BetTypeSelector = ({ selectedType, onSelect, style }) => {
  const betTypes = Object.keys(BET_TYPES);

  return (
    <View style={[styles.container, style]}>
      {betTypes.map((typeKey) => {
        const type = BET_TYPES[typeKey];
        const config = betTypeConfig[type];
        const isSelected = selectedType === type;

        return (
          <TouchableOpacity
            key={type}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(type)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{config.icon}</Text>
            <View style={styles.optionContent}>
              <Text
                style={[styles.optionName, isSelected && styles.optionNameSelected]}
              >
                {config.name}
              </Text>
              <Text style={styles.optionDescription} numberOfLines={2}>
                {config.description}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionNameSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default BetTypeSelector;
