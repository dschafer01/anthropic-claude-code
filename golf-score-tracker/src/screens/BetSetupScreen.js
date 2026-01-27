// Bet Setup Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';
import { BET_TYPES, betTypeConfig } from '../constants/betTypes';
import BetTypeSelector from '../components/BetTypeSelector';
import Button from '../components/Button';

const BetSetupScreen = ({ navigation, route }) => {
  const { players, course, teeBox } = route.params;

  const [playForMoney, setPlayForMoney] = useState(true);
  const [selectedBetType, setSelectedBetType] = useState(BET_TYPES.NASSAU);
  const [nassauAmounts, setNassauAmounts] = useState({
    front: '5',
    back: '5',
    overall: '5',
  });
  const [skinsAmount, setSkinsAmount] = useState('1');
  const [skinsCarryover, setSkinsCarryover] = useState(true);
  const [matchPlayAmount, setMatchPlayAmount] = useState('1');
  const [strokePlayAmount, setStrokePlayAmount] = useState('1');
  const [sideBets, setSideBets] = useState({});

  const toggleSideBet = (type) => {
    setSideBets((prev) => ({
      ...prev,
      [type]: prev[type]
        ? null
        : { amount: sideBetConfig[type].defaultAmount, enabled: true },
    }));
  };

  const updateSideBetAmount = (type, amount) => {
    setSideBets((prev) => ({
      ...prev,
      [type]: { ...prev[type], amount: parseFloat(amount) || 0 },
    }));
  };

  const calculateTotalAtRisk = () => {
    if (!playForMoney) return 0;

    let total = 0;

    switch (selectedBetType) {
      case BET_TYPES.NASSAU:
        total =
          (parseFloat(nassauAmounts.front) || 0) +
          (parseFloat(nassauAmounts.back) || 0) +
          (parseFloat(nassauAmounts.overall) || 0);
        break;
      case BET_TYPES.SKINS:
        total = (parseFloat(skinsAmount) || 0) * (course?.holes?.length || 18);
        break;
      case BET_TYPES.MATCH_PLAY:
        total = (parseFloat(matchPlayAmount) || 0) * (course?.holes?.length || 18);
        break;
      case BET_TYPES.STROKE_PLAY:
        total = (parseFloat(strokePlayAmount) || 0) * 20; // Estimate max differential
        break;
    }

    return total;
  };

  const handleNext = () => {
    const bets = [];

    if (playForMoney) {
      switch (selectedBetType) {
        case BET_TYPES.NASSAU:
          bets.push({
            type: BET_TYPES.NASSAU,
            amounts: {
              front: parseFloat(nassauAmounts.front) || 0,
              back: parseFloat(nassauAmounts.back) || 0,
              overall: parseFloat(nassauAmounts.overall) || 0,
            },
          });
          break;
        case BET_TYPES.SKINS:
          bets.push({
            type: BET_TYPES.SKINS,
            amount: parseFloat(skinsAmount) || 0,
            carryover: skinsCarryover,
          });
          break;
        case BET_TYPES.MATCH_PLAY:
          bets.push({
            type: BET_TYPES.MATCH_PLAY,
            amount: parseFloat(matchPlayAmount) || 0,
          });
          break;
        case BET_TYPES.STROKE_PLAY:
          bets.push({
            type: BET_TYPES.STROKE_PLAY,
            amount: parseFloat(strokePlayAmount) || 0,
          });
          break;
      }

    }

    // Check if any player has a handicap
    const hasHandicaps = players.some((p) => p.handicapIndex != null);

    if (hasHandicaps) {
      navigation.navigate('HandicapSetup', {
        players,
        course,
        teeBox,
        bets,
      });
    } else {
      navigation.navigate('LiveScorecard', {
        players,
        course,
        teeBox,
        bets,
        useNetScores: false,
      });
    }
  };

  const renderBetConfig = () => {
    switch (selectedBetType) {
      case BET_TYPES.NASSAU:
        return (
          <View style={styles.betConfig}>
            <Text style={styles.configTitle}>Nassau Amounts</Text>
            <View style={styles.amountRow}>
              <View style={styles.amountField}>
                <Text style={styles.amountLabel}>Front 9</Text>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={nassauAmounts.front}
                    onChangeText={(v) =>
                      setNassauAmounts({ ...nassauAmounts, front: v })
                    }
                    keyboardType="decimal-pad"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <View style={styles.amountField}>
                <Text style={styles.amountLabel}>Back 9</Text>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={nassauAmounts.back}
                    onChangeText={(v) =>
                      setNassauAmounts({ ...nassauAmounts, back: v })
                    }
                    keyboardType="decimal-pad"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <View style={styles.amountField}>
                <Text style={styles.amountLabel}>Overall</Text>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={nassauAmounts.overall}
                    onChangeText={(v) =>
                      setNassauAmounts({ ...nassauAmounts, overall: v })
                    }
                    keyboardType="decimal-pad"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>
          </View>
        );

      case BET_TYPES.SKINS:
        return (
          <View style={styles.betConfig}>
            <View style={styles.singleAmount}>
              <Text style={styles.configTitle}>Amount per Skin</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={skinsAmount}
                  onChangeText={setSkinsAmount}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.switchText}>Carryover on ties</Text>
                <Text style={styles.switchHint}>
                  Pot carries to next hole on tied holes
                </Text>
              </View>
              <Switch
                value={skinsCarryover}
                onValueChange={setSkinsCarryover}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        );

      case BET_TYPES.MATCH_PLAY:
        return (
          <View style={styles.betConfig}>
            <View style={styles.singleAmount}>
              <Text style={styles.configTitle}>Amount per Hole</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={matchPlayAmount}
                  onChangeText={setMatchPlayAmount}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        );

      case BET_TYPES.STROKE_PLAY:
        return (
          <View style={styles.betConfig}>
            <View style={styles.singleAmount}>
              <Text style={styles.configTitle}>Amount per Stroke</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={strokePlayAmount}
                  onChangeText={setStrokePlayAmount}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Play for Money Toggle */}
        <View style={styles.section}>
          <View style={styles.moneyToggle}>
            <View style={styles.moneyToggleInfo}>
              <Text style={styles.moneyToggleTitle}>Play for Money</Text>
              <Text style={styles.moneyToggleSubtitle}>
                Track wagers between players
              </Text>
            </View>
            <Switch
              value={playForMoney}
              onValueChange={setPlayForMoney}
              trackColor={{ false: colors.cardBorder, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {playForMoney && (
          <>
            {/* Bet Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bet Type</Text>
              <BetTypeSelector
                selectedType={selectedBetType}
                onSelect={setSelectedBetType}
              />
            </View>

            {/* Bet Configuration */}
            <View style={styles.section}>{renderBetConfig()}</View>

            {/* Total at Risk */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total at Risk</Text>
              <Text style={styles.totalAmount}>
                ~${calculateTotalAtRisk().toFixed(0)}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={playForMoney ? 'Continue' : 'Start Round'}
          onPress={handleNext}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  moneyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  moneyToggleInfo: {
    flex: 1,
  },
  moneyToggleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  moneyToggleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  betConfig: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  configTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountField: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  singleAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  switchLabel: {
    flex: 1,
  },
  switchText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  switchHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  sideBetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    marginBottom: 10,
  },
  sideBetOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  sideBetIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sideBetInfo: {
    flex: 1,
  },
  sideBetName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sideBetDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sideBetAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sideBetInput: {
    width: 50,
    padding: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dark,
    padding: 20,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white + '90',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.moneyNegative,
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

export default BetSetupScreen;
