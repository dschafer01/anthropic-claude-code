// Round Setup Screen - Step 1: Select players and course

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { getPlayers, getCourses, getCurrentUser } from '../utils/storage';
import { TEE_BOXES } from '../constants/betTypes';
import PlayerCard from '../components/PlayerCard';
import CourseCard from '../components/CourseCard';
import Button from '../components/Button';

const RoundSetupScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTee, setSelectedTee] = useState('white');
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = async () => {
    try {
      const [allPlayers, allCourses, user] = await Promise.all([
        getPlayers(),
        getCourses(),
        getCurrentUser(),
      ]);

      setPlayers(allPlayers);
      setCourses(allCourses.filter((c) => c.isFavorite).slice(0, 3));
      setCurrentUser(user);

      // Auto-select current user as a player
      if (user && !selectedPlayers.find((p) => p.id === user.id)) {
        const userPlayer = allPlayers.find((p) => p.id === user.id);
        if (userPlayer) {
          setSelectedPlayers([userPlayer]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const togglePlayerSelection = (player) => {
    const isSelected = selectedPlayers.find((p) => p.id === player.id);
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      if (selectedPlayers.length >= 4) {
        Alert.alert('Maximum Players', 'You can only select up to 4 players');
        return;
      }
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleNext = () => {
    if (selectedPlayers.length < 2) {
      Alert.alert('Select Players', 'Please select at least 2 players');
      return;
    }
    if (!selectedCourse) {
      Alert.alert('Select Course', 'Please select a course');
      return;
    }

    navigation.navigate('BetSetup', {
      players: selectedPlayers,
      course: selectedCourse,
      teeBox: selectedTee,
    });
  };

  const handleAddPlayer = () => {
    navigation.navigate('AddPlayer', {
      onPlayerAdded: (player) => {
        setPlayers((prev) => [...prev, player]);
        setSelectedPlayers((prev) => [...prev, player]);
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Players Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Players</Text>
            <TouchableOpacity onPress={handleAddPlayer}>
              <Text style={styles.addButton}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {selectedPlayers.length > 0 && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                {selectedPlayers.length} selected
              </Text>
            </View>
          )}

          {players.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No players yet</Text>
              <Button
                title="Add Your First Player"
                variant="outline"
                size="small"
                onPress={handleAddPlayer}
              />
            </View>
          ) : (
            players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                selected={!!selectedPlayers.find((p) => p.id === player.id)}
                onPress={() => togglePlayerSelection(player)}
                showHandicap
              />
            ))
          )}
        </View>

        {/* Course Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Course</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CourseSelect', {
                  onSelect: handleCourseSelect,
                  selectedId: selectedCourse?.id,
                })
              }
            >
              <Text style={styles.addButton}>Browse All</Text>
            </TouchableOpacity>
          </View>

          {courses.length === 0 && !selectedCourse ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No favorite courses</Text>
              <Button
                title="Add a Course"
                variant="outline"
                size="small"
                onPress={() => navigation.navigate('AddCourse')}
              />
            </View>
          ) : selectedCourse ? (
            <CourseCard
              course={selectedCourse}
              selected
              onPress={() =>
                navigation.navigate('CourseSelect', {
                  onSelect: handleCourseSelect,
                  selectedId: selectedCourse.id,
                })
              }
            />
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                selected={selectedCourse?.id === course.id}
                onPress={() => handleCourseSelect(course)}
              />
            ))
          )}
        </View>

        {/* Tee Box Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tee Box</Text>
          <View style={styles.teeBoxes}>
            {TEE_BOXES.map((tee) => (
              <TouchableOpacity
                key={tee.id}
                style={[
                  styles.teeBox,
                  {
                    backgroundColor:
                      tee.id === 'white' ? colors.card : tee.color,
                    borderColor:
                      selectedTee === tee.id ? colors.primary : 'transparent',
                    borderWidth: selectedTee === tee.id ? 3 : 0,
                  },
                ]}
                onPress={() => setSelectedTee(tee.id)}
              >
                <Text
                  style={[
                    styles.teeBoxText,
                    {
                      color:
                        tee.id === 'white' || tee.id === 'gold'
                          ? colors.text
                          : colors.white,
                    },
                  ]}
                >
                  {tee.name}
                </Text>
                {selectedTee === tee.id && (
                  <Text
                    style={[
                      styles.teeBoxCheck,
                      {
                        color:
                          tee.id === 'white' || tee.id === 'gold'
                            ? colors.primary
                            : colors.white,
                      },
                    ]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue to Bet Setup"
          onPress={handleNext}
          disabled={selectedPlayers.length < 2 || !selectedCourse}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  selectedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  emptySection: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  teeBoxes: {
    flexDirection: 'row',
    gap: 10,
  },
  teeBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  teeBoxText: {
    fontSize: 14,
    fontWeight: '600',
  },
  teeBoxCheck: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
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

export default RoundSetupScreen;
