// Money Badge Component - Shows +/- amount with color coding

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const MoneyBadge = ({
  amount,
  size = 'medium',
  showSign = true,
  style,
}) => {
  const isPositive = amount >= 0;
  const displayAmount = Math.abs(amount);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
        };
      case 'xlarge':
        return {
          container: styles.containerXLarge,
          text: styles.textXLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          text: styles.textMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const formatAmount = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toFixed(2);
  };

  const getPrefix = () => {
    if (!showSign) return '$';
    return isPositive ? '+$' : '-$';
  };

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: isPositive
            ? colors.moneyPositive + '20'
            : colors.moneyNegative + '20',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          {
            color: isPositive ? colors.moneyPositive : colors.moneyNegative,
          },
        ]}
      >
        {getPrefix()}
        {formatAmount(displayAmount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  containerMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  containerLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  containerXLarge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  text: {
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 20,
  },
  textXLarge: {
    fontSize: 32,
  },
});

export default MoneyBadge;
