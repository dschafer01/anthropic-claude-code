// Money Pop Animation Component

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const MoneyPop = ({
  amount,
  positive,
  visible,
  onAnimationComplete,
  style,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      translateY.setValue(0);
      opacity.setValue(1);
      scale.setValue(0.5);

      // Run animation
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.2,
            tension: 150,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: positive ? -50 : 50,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [visible, positive]);

  if (!visible) return null;

  const formatAmount = (value) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: positive ? colors.moneyPositive : colors.moneyNegative,
          },
        ]}
      >
        {positive ? '+' : '-'}${formatAmount(Math.abs(amount))}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  text: {
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default MoneyPop;
