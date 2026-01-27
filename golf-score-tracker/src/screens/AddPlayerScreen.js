// Add Player Screen

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
import { savePlayer, generateId } from '../utils/storage';
import Button from '../components/Button';

const AddPlayerScreen = ({ navigation, route }) => {
  const editPlayer = route.params?.player;
  const isEditing = !!editPlayer;
  const onPlayerAdded = route.params?.onPlayerAdded;

  const [name, setName] = useState(editPlayer?.name || '');
  const [ghinNumber, setGhinNumber] = useState(editPlayer?.ghinNumber || '');
  const [handicapIndex, setHandicapIndex] = useState(
    editPlayer?.handicapIndex?.toString() || ''
  );
  const [selectedColor, setSelectedColor] = useState(
    editPlayer?.profileColor || colors.playerColors[0]
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    setSaving(true);
    try {
      const player = {
        id: editPlayer?.id || generateId(),
        name: name.trim(),
        ghinNumber: ghinNumber.trim() || null,
        handicapIndex: handicapIndex ? parseFloat(handicapIndex) : null,
        profileColor: selectedColor,
        totalBankBalance: editPlayer?.totalBankBalance || 0,
        totalRoundsPlayed: editPlayer?.totalRoundsPlayed || 0,
        totalRoundsWon: editPlayer?.totalRoundsWon || 0,
        createdAt: editPlayer?.createdAt || new Date().toISOString(),
      };

      await savePlayer(player);

      if (onPlayerAdded) {
        onPlayerAdded(player);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving player:', error);
      Alert.alert('Error', 'Failed to save player');
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
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Info</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter player name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Profile Color</Text>
            <View style={styles.colorPicker}>
              {colors.playerColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Text style={styles.colorCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Handicap Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Handicap (Optional)</Text>

          <View style={styles.field}>
            <Text style={styles.label}>GHIN Number</Text>
            <TextInput
              style={styles.input}
              value={ghinNumber}
              onChangeText={setGhinNumber}
              placeholder="e.g., 1234567"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Handicap Index</Text>
            <TextInput
              style={styles.input}
              value={handicapIndex}
              onChangeText={setHandicapIndex}
              placeholder="e.g., 12.5"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
            <Text style={styles.hint}>
              Enter your current handicap index, or look it up using your GHIN
              number
            </Text>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.preview}>
            <View
              style={[styles.previewAvatar, { backgroundColor: selectedColor }]}
            >
              <Text style={styles.previewInitials}>
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2) || '??'}
              </Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{name || 'Player Name'}</Text>
              {handicapIndex && (
                <Text style={styles.previewHandicap}>
                  HCP: {parseFloat(handicapIndex).toFixed(1)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isEditing ? 'Save Changes' : 'Add Player'}
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
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.dark,
  },
  colorCheck: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  previewAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  previewInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  previewHandicap: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
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

export default AddPlayerScreen;
