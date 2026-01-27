// Course Card Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const CourseCard = ({
  course,
  selected = false,
  onPress,
  onFavoritePress,
  showStats = false,
  style,
}) => {
  const getTotalPar = () => {
    if (!course.holes) return 72;
    return course.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {course.name}
          </Text>
          {onFavoritePress && (
            <TouchableOpacity
              onPress={onFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.favorite}>
                {course.isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {course.location && (
          <Text style={styles.location} numberOfLines={1}>
            📍 {course.location}
          </Text>
        )}

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Holes</Text>
            <Text style={styles.detailValue}>{course.holes?.length || 18}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Par</Text>
            <Text style={styles.detailValue}>{getTotalPar()}</Text>
          </View>
          {course.slopeRating?.white && (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Slope</Text>
              <Text style={styles.detailValue}>{course.slopeRating.white}</Text>
            </View>
          )}
          {course.courseRating?.white && (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue}>{course.courseRating.white}</Text>
            </View>
          )}
        </View>

        {showStats && course.timesPlayed > 0 && (
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              Played {course.timesPlayed} time{course.timesPlayed !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

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
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
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
  main: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  favorite: {
    fontSize: 22,
    color: colors.warning,
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stats: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  statsText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CourseCard;
