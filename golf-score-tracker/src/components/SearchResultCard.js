// Search Result Card Component - displays course search results from API

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const SearchResultCard = ({
  course,
  onPress,
  onQuickAdd,
  style,
}) => {
  const formatDistance = (miles) => {
    if (miles === null || miles === undefined) return null;
    if (miles < 0.1) return '< 0.1 mi';
    if (miles < 1) return `${(miles).toFixed(1)} mi`;
    return `${Math.round(miles)} mi`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {course.name}
          </Text>
          {course.distance !== null && course.distance !== undefined && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                {formatDistance(course.distance)}
              </Text>
            </View>
          )}
        </View>

        {course.location && (
          <Text style={styles.location} numberOfLines={1}>
            {course.location}
          </Text>
        )}

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Holes</Text>
            <Text style={styles.detailValue}>{course.holes || 18}</Text>
          </View>

          {course.source && (
            <View style={styles.detail}>
              <Text style={styles.sourceLabel}>
                {course.source === 'openstreetmap' ? 'OSM' : course.source === 'curated' ? 'Popular' : course.source}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.note}>
          Tap to add with full details
        </Text>
      </View>

      <TouchableOpacity
        style={styles.quickAddButton}
        onPress={(e) => {
          e.stopPropagation();
          onQuickAdd && onQuickAdd();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.quickAddText}>+</Text>
      </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
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
  distanceBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
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
    marginBottom: 6,
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
  sourceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  note: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  quickAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  quickAddText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export default SearchResultCard;
