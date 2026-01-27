// Course Select Screen

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { getCourses } from '../utils/storage';
import CourseCard from '../components/CourseCard';
import Button from '../components/Button';

const CourseSelectScreen = ({ navigation, route }) => {
  const { onSelect, selectedId } = route.params || {};

  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      const allCourses = await getCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [])
  );

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return b.timesPlayed - a.timesPlayed;
      });
    }

    const query = searchQuery.toLowerCase();
    return courses
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.location?.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [courses, searchQuery]);

  const handleSelect = (course) => {
    if (onSelect) {
      onSelect(course);
    }
    navigation.goBack();
  };

  const renderCourse = ({ item }) => (
    <CourseCard
      course={item}
      selected={item.id === selectedId}
      showStats
      onPress={() => handleSelect(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search courses..."
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {filteredCourses.length > 0 && (
        <Text style={styles.count}>
          {filteredCourses.length} course
          {filteredCourses.length !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>No Courses</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No courses found' : 'No courses yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try a different search term'
          : 'Add your first course to get started'}
      </Text>
      {!searchQuery && (
        <Button
          title="Add Course"
          variant="outline"
          size="small"
          onPress={() => navigation.navigate('AddCourse')}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Add New Course"
          icon="+"
          variant="outline"
          onPress={() => navigation.navigate('AddCourse')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});

export default CourseSelectScreen;
