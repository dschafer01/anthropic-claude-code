// Score Input Component with +/- buttons

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const ScoreInput = ({
  value,
  onChange,
  par = 4,
  minValue = 1,
  maxValue = 15,
  showRelativeToPar = true,
  disabled = false,
  style,
}) => {
  const handleDecrement = () => {
    if (value > minValue && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < maxValue && !disabled) {
      onChange(value + 1);
    }
  };

  const getRelativeToPar = () => {
    if (!value || value === 0) return null;
    const diff = value - par;
    if (diff === 0) return { text: 'E', color: colors.textSecondary };
    if (diff > 0) return { text: `+${diff}`, color: colors.danger };
    return { text: `${diff}`, color: colors.primary };
  };

  const getScoreLabel = () => {
    if (!value || value === 0) return null;
    const diff = value - par;
    if (diff === -3) return { text: 'Albatross', color: colors.primary };
    if (diff === -2) return { text: 'Eagle', color: colors.primary };
    if (diff === -1) return { text: 'Birdie', color: colors.primaryLight };
    if (diff === 0) return { text: 'Par', color: colors.textSecondary };
    if (diff === 1) return { text: 'Bogey', color: colors.warning };
    if (diff === 2) return { text: 'Double', color: colors.danger };
    if (diff >= 3) return { text: `+${diff}`, color: colors.danger };
    return null;
  };

  const relativeToPar = getRelativeToPar();
  const scoreLabel = getScoreLabel();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handleDecrement}
        disabled={disabled || value <= minValue}
        activeOpacity={0.6}
      >
        <Text
          style={[
            styles.buttonText,
            (disabled || value <= minValue) && styles.buttonTextDisabled,
          ]}
        >
          −
        </Text>
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.value,
            !value && styles.valueEmpty,
            scoreLabel && { color: scoreLabel.color },
          ]}
        >
          {value || '-'}
        </Text>
        {showRelativeToPar && relativeToPar && (
          <Text style={[styles.relative, { color: relativeToPar.color }]}>
            ({relativeToPar.text})
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handleIncrement}
        disabled={disabled || value >= maxValue}
        activeOpacity={0.6}
      >
        <Text
          style={[
            styles.buttonText,
            (disabled || value >= maxValue) && styles.buttonTextDisabled,
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonDisabled: {
    backgroundColor: colors.card,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 30,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  valueContainer: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  valueEmpty: {
    color: colors.textMuted,
  },
  relative: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default ScoreInput;
