// Add Course Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import { saveCourse, generateId } from '../utils/storage';
import Button from '../components/Button';

const AddCourseScreen = ({ navigation, route }) => {
  const editCourse = route.params?.course;
  const prefillData = route.params?.prefillData;
  const onCourseSaved = route.params?.onCourseSaved;
  const isEditing = !!editCourse;

  const [name, setName] = useState(editCourse?.name || prefillData?.name || '');
  const [location, setLocation] = useState(editCourse?.location || prefillData?.location || '');
  const [numHoles, setNumHoles] = useState(editCourse?.holes?.length || prefillData?.holes || 18);
  const [holes, setHoles] = useState(
    editCourse?.holes ||
      Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: 4,
        yardage: { black: 0, blue: 0, white: 0, red: 0 },
        handicap: i + 1,
      }))
  );
  const [courseRating, setCourseRating] = useState(editCourse?.courseRating || {});
  const [slopeRating, setSlopeRating] = useState(editCourse?.slopeRating || {});
  const [saving, setSaving] = useState(false);

  const updateHole = (index, field, value) => {
    const newHoles = [...holes];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newHoles[index] = {
        ...newHoles[index],
        [parent]: {
          ...newHoles[index][parent],
          [child]: value,
        },
      };
    } else {
      newHoles[index] = { ...newHoles[index], [field]: value };
    }
    setHoles(newHoles);
  };

  const handleNumHolesChange = (num) => {
    setNumHoles(num);
    if (num === 9 && holes.length > 9) {
      setHoles(holes.slice(0, 9));
    } else if (num === 18 && holes.length < 18) {
      const newHoles = [...holes];
      for (let i = holes.length; i < 18; i++) {
        newHoles.push({
          number: i + 1,
          par: 4,
          yardage: { black: 0, blue: 0, white: 0, red: 0 },
          handicap: i + 1,
        });
      }
      setHoles(newHoles);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a course name');
      return;
    }

    setSaving(true);
    try {
      const course = {
        id: editCourse?.id || generateId(),
        name: name.trim(),
        location: location.trim(),
        holes: holes.slice(0, numHoles),
        courseRating,
        slopeRating,
        isFavorite: editCourse?.isFavorite || false,
        timesPlayed: editCourse?.timesPlayed || 0,
        // Include metadata from search results if available
        ...(prefillData?.coordinates && { coordinates: prefillData.coordinates }),
        ...(prefillData?.source && { source: prefillData.source }),
        ...(prefillData?.osmId && { osmId: prefillData.osmId }),
      };

      await saveCourse(course);

      // Call callback if provided (for search flow)
      if (onCourseSaved) {
        onCourseSaved(course);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving course:', error);
      Alert.alert('Error', 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search result note */}
        {prefillData && (
          <View style={styles.searchNote}>
            <Text style={styles.searchNoteText}>
              Course found via search. Add par and yardage details below.
            </Text>
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Info</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Course Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Pebble Beach Golf Links"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Pebble Beach, CA"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Number of Holes</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  numHoles === 9 && styles.toggleButtonActive,
                ]}
                onPress={() => handleNumHolesChange(9)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    numHoles === 9 && styles.toggleTextActive,
                  ]}
                >
                  9 Holes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  numHoles === 18 && styles.toggleButtonActive,
                ]}
                onPress={() => handleNumHolesChange(18)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    numHoles === 18 && styles.toggleTextActive,
                  ]}
                >
                  18 Holes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Course/Slope Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings (White Tees)</Text>
          <View style={styles.ratingRow}>
            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Course Rating</Text>
              <TextInput
                style={styles.input}
                value={courseRating.white?.toString() || ''}
                onChangeText={(v) =>
                  setCourseRating({ ...courseRating, white: parseFloat(v) || 0 })
                }
                placeholder="72.0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Slope Rating</Text>
              <TextInput
                style={styles.input}
                value={slopeRating.white?.toString() || ''}
                onChangeText={(v) =>
                  setSlopeRating({ ...slopeRating, white: parseInt(v) || 0 })
                }
                placeholder="113"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Holes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hole Details</Text>

          {holes.slice(0, numHoles).map((hole, index) => (
            <View key={index} style={styles.holeCard}>
              <View style={styles.holeHeader}>
                <Text style={styles.holeNumber}>Hole {hole.number}</Text>
              </View>

              <View style={styles.holeFields}>
                <View style={styles.holeField}>
                  <Text style={styles.holeLabel}>Yards (White)</Text>
                  <TextInput
                    style={styles.holeInput}
                    value={hole.yardage?.white?.toString() || ''}
                    onChangeText={(v) =>
                      updateHole(index, 'yardage.white', parseInt(v) || 0)
                    }
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.holeField}>
                  <Text style={styles.holeLabel}>HCP</Text>
                  <TextInput
                    style={styles.holeInput}
                    value={hole.handicap?.toString() || ''}
                    onChangeText={(v) =>
                      updateHole(index, 'handicap', parseInt(v) || 1)
                    }
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isEditing ? 'Save Changes' : prefillData ? 'Save Course' : 'Add Course'}
          onPress={handleSave}
          loading={saving}
          disabled={!name.trim()}
        />
      </View>
    </KeyboardAvoidingView>
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
  searchNote: {
    backgroundColor: colors.primary + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchNoteText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  ratingRow: {
    flexDirection: 'row',
  },
  holeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  holeHeader: {
    marginBottom: 12,
  },
  holeNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  holeFields: {
    flexDirection: 'row',
    gap: 12,
  },
  holeField: {
    flex: 1,
  },
  holeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  holeInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
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

export default AddCourseScreen;
