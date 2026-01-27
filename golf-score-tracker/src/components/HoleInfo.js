// Hole Info Component - Shows hole number, par, yardage

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const HoleInfo = ({
  holeNumber,
  par,
  yardage,
  handicap,
  teeBox = 'white',
  style,
}) => {
  const getYardageForTee = () => {
    if (!yardage) return null;
    if (typeof yardage === 'number') return yardage;
    return yardage[teeBox] || yardage.white || Object.values(yardage)[0];
  };

  const displayYardage = getYardageForTee();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.holeNumber}>
        <Text style={styles.holeLabel}>HOLE</Text>
        <Text style={styles.holeValue}>{holeNumber}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Par</Text>
          <Text style={styles.detailValue}>{par}</Text>
        </View>

        {displayYardage && (
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Yards</Text>
            <Text style={styles.detailValue}>{displayYardage}</Text>
          </View>
        )}

        {handicap && (
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>HCP</Text>
            <Text style={styles.detailValue}>{handicap}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
  },
  holeNumber: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: colors.white + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  holeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white + '90',
    letterSpacing: 1,
  },
  holeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginTop: -2,
  },
  details: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white + '80',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
});

export default HoleInfo;
