// GHIN Setup Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../constants/colors';
import { getCurrentUser, savePlayer, setCurrentUser } from '../utils/storage';
import { validateGHINNumber, formatHandicap } from '../utils/handicapCalculators';
import Button from '../components/Button';

const GHINSetupScreen = ({ navigation }) => {
  const [currentUser, setCurrentUserState] = useState(null);
  const [ghinNumber, setGhinNumber] = useState('');
  const [handicapIndex, setHandicapIndex] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      setGhinNumber(user.ghinNumber || '');
      setHandicapIndex(user.handicapIndex?.toString() || '');
      setLastUpdated(user.handicapLastUpdated || null);
    }
  };

  const handleSave = async () => {
    if (ghinNumber && !validateGHINNumber(ghinNumber)) {
      Alert.alert('Invalid GHIN Number', 'Please enter a valid GHIN number (6-10 digits)');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = {
        ...currentUser,
        ghinNumber: ghinNumber.trim() || null,
        handicapIndex: handicapIndex ? parseFloat(handicapIndex) : null,
        handicapLastUpdated: new Date().toISOString(),
      };

      await savePlayer(updatedUser);
      await setCurrentUser(updatedUser);
      setLastUpdated(updatedUser.handicapLastUpdated);

      Alert.alert('Saved', 'Your GHIN information has been updated');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving GHIN:', error);
      Alert.alert('Error', 'Failed to save GHIN information');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    Alert.alert(
      'Clear GHIN Info',
      'Are you sure you want to remove your GHIN information?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const updatedUser = {
              ...currentUser,
              ghinNumber: null,
              handicapIndex: null,
              handicapLastUpdated: null,
            };

            await savePlayer(updatedUser);
            await setCurrentUser(updatedUser);

            setGhinNumber('');
            setHandicapIndex('');
            setLastUpdated(null);
          },
        },
      ]
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Profile</Text>
          <Text style={styles.emptyText}>
            Please set up your profile first to use GHIN tracking
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>i</Text>
        <Text style={styles.infoText}>
          Enter your GHIN number and handicap index to enable net scoring in your rounds.
          For now, you'll need to manually update your handicap when it changes.
        </Text>
      </View>

      {/* Current Handicap Display */}
      {currentUser.handicapIndex != null && (
        <View style={styles.currentHandicap}>
          <Text style={styles.handicapLabel}>CURRENT HANDICAP</Text>
          <Text style={styles.handicapValue}>
            {formatHandicap(currentUser.handicapIndex)}
          </Text>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* GHIN Number Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GHIN Number</Text>
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            value={ghinNumber}
            onChangeText={setGhinNumber}
            placeholder="Enter your 7-digit GHIN number"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
        <Text style={styles.hint}>
          Your GHIN number can be found on your GHIN app or USGA website
        </Text>
      </View>

      {/* Handicap Index Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Handicap Index</Text>
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            value={handicapIndex}
            onChangeText={setHandicapIndex}
            placeholder="e.g., 12.5"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
        <Text style={styles.hint}>
          Enter your current handicap index. Update this whenever your official handicap changes.
        </Text>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How Handicaps Work</Text>
        <View style={styles.explainerCard}>
          <View style={styles.explainerItem}>
            <Text style={styles.explainerNumber}>1</Text>
            <Text style={styles.explainerText}>
              Your Handicap Index is converted to a Course Handicap based on the course difficulty
            </Text>
          </View>
          <View style={styles.explainerItem}>
            <Text style={styles.explainerNumber}>2</Text>
            <Text style={styles.explainerText}>
              Strokes are distributed to holes based on their handicap rating
            </Text>
          </View>
          <View style={styles.explainerItem}>
            <Text style={styles.explainerNumber}>3</Text>
            <Text style={styles.explainerText}>
              Net scores are calculated by subtracting your strokes from gross scores
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Save"
          onPress={handleSave}
          loading={saving}
          disabled={!ghinNumber && !handicapIndex}
        />
        {(currentUser.ghinNumber || currentUser.handicapIndex != null) && (
          <Button
            title="Clear GHIN Info"
            variant="ghost"
            onPress={handleClear}
            style={styles.clearButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '15',
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.info + '20',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  currentHandicap: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  handicapLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white + '80',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  handicapValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.white,
  },
  lastUpdated: {
    fontSize: 13,
    color: colors.white + '70',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  field: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  explainerCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  explainerItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  explainerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  explainerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
  },
});

export default GHINSetupScreen;
