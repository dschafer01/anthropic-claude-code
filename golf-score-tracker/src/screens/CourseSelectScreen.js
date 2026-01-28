// Course Select Screen - with local and online search modes

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { getCourses, saveCourse, generateId } from '../utils/storage';
import { searchCourses } from '../services/courseSearchService';
import CourseCard from '../components/CourseCard';
import SearchResultCard from '../components/SearchResultCard';
import Button from '../components/Button';

const CourseSelectScreen = ({ navigation, route }) => {
  const { onSelect, selectedId } = route.params || {};

  // Local courses state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('local'); // 'local' | 'online'

  // Online search state
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchSource, setSearchSource] = useState(null);

  // Debounce timer ref
  const searchTimeoutRef = useRef(null);

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

  // Filter local courses based on search query
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

  // Handle online search with debounce
  const handleOnlineSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchSource(null);

    try {
      const { success, results, source, error } = await searchCourses(query);

      if (success) {
        setSearchResults(results);
        setSearchSource(source);
        setSearchError(null);
      } else {
        setSearchResults([]);
        setSearchError(
          error === 'no_results'
            ? `No courses found for "${query}"`
            : 'Search failed. Please try again.'
        );
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setSearchError('Search failed. Check your connection.');
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // Trigger search on button press or when switching to online mode
  const triggerOnlineSearch = () => {
    Keyboard.dismiss();
    handleOnlineSearch();
  };

  // Handle selecting a local course
  const handleSelectLocal = (course) => {
    if (onSelect) {
      onSelect(course);
    }
    navigation.goBack();
  };

  // Handle selecting a search result - navigate to AddCourse with prefilled data
  const handleSelectSearchResult = (result) => {
    // Check if course already exists locally
    const existing = courses.find(
      (c) =>
        c.name.toLowerCase() === result.name.toLowerCase() &&
        c.location?.toLowerCase() === result.location?.toLowerCase()
    );

    if (existing) {
      Alert.alert(
        'Course Already Saved',
        'This course is already in your library. Would you like to select it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Select',
            onPress: () => handleSelectLocal(existing),
          },
        ]
      );
      return;
    }

    // Navigate to AddCourse with prefilled data
    navigation.navigate('AddCourse', {
      prefillData: {
        name: result.name,
        location: result.location,
        coordinates: result.coordinates,
        holes: result.holes || 18,
        source: result.source,
        osmId: result.osmId,
      },
      onCourseSaved: (savedCourse) => {
        if (onSelect) {
          onSelect(savedCourse);
        }
        // Go back to the screen that called CourseSelect
        navigation.goBack();
      },
    });
  };

  // Handle quick add - save course with default values
  const handleQuickAdd = async (result) => {
    const numHoles = result.holes || 18;
    const newCourse = {
      id: generateId(),
      name: result.name,
      location: result.location || '',
      coordinates: result.coordinates,
      holes: Array.from({ length: numHoles }, (_, i) => ({
        number: i + 1,
        par: 4, // Default par
        yardage: { black: 0, blue: 0, white: 0, red: 0 },
        handicap: i + 1,
      })),
      courseRating: {},
      slopeRating: {},
      isFavorite: false,
      timesPlayed: 0,
      source: result.source,
      osmId: result.osmId,
      needsDetailEntry: true,
    };

    try {
      await saveCourse(newCourse);
      setCourses((prev) => [...prev, newCourse]);

      if (onSelect) {
        onSelect(newCourse);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving course:', error);
      Alert.alert('Error', 'Failed to save course');
    }
  };

  // Switch modes
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    if (mode === 'online' && searchQuery.trim().length >= 2) {
      // Auto-search when switching to online mode with a query
      handleOnlineSearch();
    }
  };

  // Render mode toggle
  const renderModeToggle = () => (
    <View style={styles.modeToggle}>
      <TouchableOpacity
        style={[styles.modeButton, searchMode === 'local' && styles.modeButtonActive]}
        onPress={() => handleModeChange('local')}
      >
        <Text style={[styles.modeText, searchMode === 'local' && styles.modeTextActive]}>
          My Courses
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeButton, searchMode === 'online' && styles.modeButtonActive]}
        onPress={() => handleModeChange('online')}
      >
        <Text style={[styles.modeText, searchMode === 'online' && styles.modeTextActive]}>
          Search Online
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render search header
  const renderHeader = () => (
    <View style={styles.header}>
      {renderModeToggle()}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={
            searchMode === 'local'
              ? 'Search your courses...'
              : 'Search by name or city...'
          }
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType={searchMode === 'online' ? 'search' : 'done'}
          onSubmitEditing={searchMode === 'online' ? triggerOnlineSearch : undefined}
        />
        {searchMode === 'online' && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={triggerOnlineSearch}
            disabled={searching || searchQuery.trim().length < 2}
          >
            {searching ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Result count / source info */}
      {searchMode === 'local' && filteredCourses.length > 0 && (
        <Text style={styles.count}>
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
        </Text>
      )}
      {searchMode === 'online' && searchResults.length > 0 && (
        <Text style={styles.count}>
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          {searchSource && (
            <Text style={styles.sourceText}>
              {' '}
              via {searchSource === 'openstreetmap' ? 'OpenStreetMap' : searchSource}
            </Text>
          )}
        </Text>
      )}
    </View>
  );

  // Render local course item
  const renderLocalCourse = ({ item }) => (
    <CourseCard
      course={item}
      selected={item.id === selectedId}
      showStats
      onPress={() => handleSelectLocal(item)}
    />
  );

  // Render search result item
  const renderSearchResult = ({ item }) => (
    <SearchResultCard
      course={item}
      onPress={() => handleSelectSearchResult(item)}
      onQuickAdd={() => handleQuickAdd(item)}
    />
  );

  // Render empty state for local mode
  const renderLocalEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No courses found' : 'No courses yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try a different search or search online'
          : 'Add your first course or search online'}
      </Text>
      {!searchQuery && (
        <Button
          title="Search Online"
          variant="outline"
          size="small"
          onPress={() => setSearchMode('online')}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  // Render empty state for online mode
  const renderOnlineEmpty = () => {
    if (searching) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Searching for courses...</Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Results</Text>
          <Text style={styles.emptyText}>{searchError}</Text>
          <Button
            title="Add Course Manually"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate('AddCourse')}
            style={styles.emptyButton}
          />
        </View>
      );
    }

    if (searchQuery.trim().length < 2) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Search for Courses</Text>
          <Text style={styles.emptyText}>
            Enter a course name or city to search
          </Text>
          <Text style={styles.emptyHint}>
            Examples: "Pebble Beach", "Scottsdale AZ", "Torrey Pines"
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Ready to Search</Text>
        <Text style={styles.emptyText}>
          Tap the Search button to find courses
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={searchMode === 'local' ? filteredCourses : searchResults}
        renderItem={searchMode === 'local' ? renderLocalCourse : renderSearchResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading
            ? searchMode === 'local'
              ? renderLocalEmpty
              : renderOnlineEmpty
            : null
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.footer}>
        <Button
          title="Add Course Manually"
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
  },
  sourceText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 16,
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
