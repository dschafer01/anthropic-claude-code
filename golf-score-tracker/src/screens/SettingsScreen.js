// Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../constants/colors';
import { getSettings, updateSettings, clearAllData } from '../utils/storage';
import { TEE_BOXES } from '../constants/betTypes';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    hapticsEnabled: true,
    theme: 'light',
    defaultTeeBox: 'white',
    showNetScores: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your rounds, players, courses, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Data Cleared', 'All data has been deleted.');
            navigation.popToTop();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Audio & Haptics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio & Haptics</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Sound Effects</Text>
            <Text style={styles.settingSubtitle}>
              Play sounds for money events
            </Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(v) => handleSettingChange('soundEnabled', v)}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Haptic Feedback</Text>
            <Text style={styles.settingSubtitle}>
              Vibrate on score entry and money changes
            </Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(v) => handleSettingChange('hapticsEnabled', v)}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Scoring */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scoring</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show Net Scores</Text>
            <Text style={styles.settingSubtitle}>
              Display net scores with handicap applied
            </Text>
          </View>
          <Switch
            value={settings.showNetScores}
            onValueChange={(v) => handleSettingChange('showNetScores', v)}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Default Tee Box</Text>
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
                      settings.defaultTeeBox === tee.id
                        ? colors.primary
                        : 'transparent',
                    borderWidth: settings.defaultTeeBox === tee.id ? 3 : 0,
                  },
                ]}
                onPress={() => handleSettingChange('defaultTeeBox', tee.id)}
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
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearData}
        >
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
        <Text style={styles.dangerHint}>
          This will permanently delete all your data
        </Text>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>

        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Built with</Text>
          <Text style={styles.aboutValue}>React Native & Expo</Text>
        </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  teeBoxes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  teeBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  teeBoxText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: colors.danger + '15',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
  dangerHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  aboutLabel: {
    fontSize: 15,
    color: colors.text,
  },
  aboutValue: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});

export default SettingsScreen;
