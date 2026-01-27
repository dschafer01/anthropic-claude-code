// Live Scorecard Screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { saveRound, generateId, getSettings, updatePlayerStats } from '../utils/storage';
import { calculateLiveBank, calculateRoundMoney } from '../utils/betCalculators';
import { SIDE_BET_TYPES, sideBetConfig } from '../constants/betTypes';
import HoleInfo from '../components/HoleInfo';
import ScoreInput from '../components/ScoreInput';
import MoneyBadge from '../components/MoneyBadge';
import MoneyPop from '../components/MoneyPop';
import Leaderboard from '../components/Leaderboard';
import Button from '../components/Button';

const LiveScorecardScreen = ({ navigation, route }) => {
  const { players, course, teeBox, bets, useNetScores, playerHandicaps } = route.params;

  const numHoles = course?.holes?.length || 18;

  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState(() => {
    const initial = {};
    players.forEach((p) => {
      initial[p.id] = Array(numHoles).fill(0);
    });
    return initial;
  });
  const [liveBank, setLiveBank] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [settings, setSettings] = useState({ soundEnabled: true, hapticsEnabled: true });
  const [moneyPop, setMoneyPop] = useState({ visible: false, amount: 0, positive: true });
  const [roundId] = useState(generateId());
  const [showSideBets, setShowSideBets] = useState(false);
  const [sideBetsPerHole, setSideBetsPerHole] = useState(() => {
    const initial = {};
    for (let i = 0; i < numHoles; i++) {
      initial[i] = {};
    }
    return initial;
  });

  const prevLiveBank = useRef({});

  // Load settings
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Calculate live bank whenever scores change
  useEffect(() => {
    if (bets.length > 0) {
      const round = {
        scores,
        bets,
        course,
        numHoles,
      };
      const newLiveBank = calculateLiveBank(round, players, currentHole);

      // Check for money changes
      players.forEach((player) => {
        const prevAmount = prevLiveBank.current[player.id] || 0;
        const newAmount = newLiveBank[player.id] || 0;
        const diff = newAmount - prevAmount;

        if (diff !== 0 && currentHole > 1) {
          // Trigger haptic feedback
          if (settings.hapticsEnabled) {
            if (diff > 0) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          }

          // Show money pop animation (only for first player for simplicity)
          if (player.id === players[0].id) {
            setMoneyPop({ visible: true, amount: Math.abs(diff), positive: diff > 0 });
          }
        }
      });

      prevLiveBank.current = newLiveBank;
      setLiveBank(newLiveBank);
    }
  }, [scores, currentHole, bets, players]);

  const getCurrentHoleData = () => {
    return course?.holes?.[currentHole - 1] || { par: 4, yardage: {}, handicap: currentHole };
  };

  const updateScore = (playerId, score) => {
    setScores((prev) => {
      const newScores = { ...prev };
      newScores[playerId] = [...prev[playerId]];
      newScores[playerId][currentHole - 1] = score;
      return newScores;
    });

    // Light haptic on score change
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const goToHole = (hole) => {
    if (hole >= 1 && hole <= numHoles) {
      setCurrentHole(hole);
    }
  };

  const getApplicableSideBets = (holeIndex) => {
    const hole = course?.holes?.[holeIndex];
    const par = hole?.par || 4;
    return Object.entries(sideBetConfig).filter(([, config]) => {
      if (config.applicableHoles === 'all') return true;
      if (config.applicableHoles === 'par3' && par === 3) return true;
      if (config.applicableHoles === 'par4and5' && (par === 4 || par === 5)) return true;
      return false;
    });
  };

  const toggleSideBet = (holeIndex, betType) => {
    setSideBetsPerHole((prev) => {
      const holeData = { ...prev[holeIndex] };
      if (holeData[betType]) {
        delete holeData[betType];
      } else {
        holeData[betType] = { enabled: true, winner: null };
      }
      return { ...prev, [holeIndex]: holeData };
    });
  };

  const setSideBetWinner = (holeIndex, betType, playerId) => {
    setSideBetsPerHole((prev) => {
      const holeData = { ...prev[holeIndex] };
      holeData[betType] = { ...holeData[betType], winner: playerId };
      return { ...prev, [holeIndex]: holeData };
    });
  };

  const handleFinishRound = () => {
    // Check if all scores are entered
    const allScoresEntered = players.every((player) =>
      scores[player.id].every((score) => score > 0)
    );

    if (!allScoresEntered) {
      Alert.alert(
        'Incomplete Scores',
        'Some scores are missing. Do you want to finish anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finish Anyway', onPress: completeRound },
        ]
      );
    } else {
      completeRound();
    }
  };

  const completeRound = async () => {
    try {
      // Calculate final money results
      const round = {
        id: roundId,
        scores,
        bets,
        course,
        numHoles,
      };
      const moneyResults = {};

      if (bets.length > 0) {
        const results = calculateRoundMoney(round, players);
        players.forEach((player) => {
          moneyResults[player.id] = results[player.id].total;
        });
      }

      // Save the round
      const savedRound = {
        id: roundId,
        date: new Date().toISOString(),
        courseId: course.id,
        course: course,
        players: players.map((p) => p.id),
        scores,
        teeBox,
        bets,
        moneyResults,
        isComplete: true,
        useNetScores,
        playerHandicaps,
      };

      await saveRound(savedRound);

      // Update player stats
      for (const player of players) {
        await updatePlayerStats(player.id, {
          totalBankBalance: (player.totalBankBalance || 0) + (moneyResults[player.id] || 0),
          totalRoundsPlayed: (player.totalRoundsPlayed || 0) + 1,
        });
      }

      navigation.replace('RoundSummary', {
        round: savedRound,
        players,
        moneyResults,
      });
    } catch (error) {
      console.error('Error saving round:', error);
      Alert.alert('Error', 'Failed to save round');
    }
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Round',
      'Are you sure you want to quit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => navigation.popToTop(),
        },
      ]
    );
  };

  const holeData = getCurrentHoleData();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Header with Hole Info */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToHole(currentHole - 1)}
          disabled={currentHole === 1}
        >
          <Text style={[styles.navButtonText, currentHole === 1 && styles.navButtonDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>

        <HoleInfo
          holeNumber={currentHole}
          par={holeData.par}
          yardage={holeData.yardage}
          handicap={holeData.handicap}
          teeBox={teeBox}
          style={styles.holeInfo}
        />

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToHole(currentHole + 1)}
          disabled={currentHole === numHoles}
        >
          <Text
            style={[styles.navButtonText, currentHole === numHoles && styles.navButtonDisabled]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* Live Bank (if betting) */}
      {bets.length > 0 && (
        <TouchableOpacity
          style={styles.liveBankSection}
          onPress={() => setShowLeaderboard(!showLeaderboard)}
        >
          <View style={styles.liveBankHeader}>
            <Text style={styles.liveBankTitle}>Live Bank</Text>
            <Text style={styles.expandButton}>{showLeaderboard ? '▲' : '▼'}</Text>
          </View>
          <View style={styles.liveBankRow}>
            {players.map((player) => (
              <View key={player.id} style={styles.liveBankPlayer}>
                <View
                  style={[
                    styles.miniAvatar,
                    { backgroundColor: player.profileColor || colors.primary },
                  ]}
                >
                  <Text style={styles.miniAvatarText}>{getInitials(player.name)}</Text>
                </View>
                <MoneyBadge amount={liveBank[player.id] || 0} size="small" />
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Leaderboard (expandable) */}
      {showLeaderboard && (
        <View style={styles.leaderboardContainer}>
          <Leaderboard
            players={players}
            scores={scores}
            course={course}
            moneyResults={liveBank}
            currentHole={currentHole}
            compact
          />
        </View>
      )}

      {/* Score Entry */}
      <ScrollView
        style={styles.scoreSection}
        contentContainerStyle={styles.scoreContent}
        showsVerticalScrollIndicator={false}
      >
        {players.map((player) => {
          const playerScore = scores[player.id][currentHole - 1];
          const playerTotal = scores[player.id].reduce((a, b) => a + (b || 0), 0);
          const strokesOnHole = playerHandicaps?.[player.id]?.strokesPerHole?.[currentHole - 1] || 0;

          return (
            <View key={player.id} style={styles.playerScoreCard}>
              <View style={styles.playerScoreHeader}>
                <View style={styles.playerScoreInfo}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: player.profileColor || colors.primary },
                    ]}
                  >
                    <Text style={styles.avatarText}>{getInitials(player.name)}</Text>
                  </View>
                  <View>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <View style={styles.playerStats}>
                      <Text style={styles.totalScore}>Total: {playerTotal || '-'}</Text>
                      {useNetScores && strokesOnHole > 0 && (
                        <View style={styles.strokesBadge}>
                          <Text style={styles.strokesBadgeText}>
                            {strokesOnHole} stroke{strokesOnHole > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              <ScoreInput
                value={playerScore}
                onChange={(score) => updateScore(player.id, score)}
                par={holeData.par}
                style={styles.scoreInput}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Hole Navigation Dots */}
      <View style={styles.holeDots}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.holeDotsContent}
        >
          {Array.from({ length: numHoles }, (_, i) => {
            const holeNum = i + 1;
            const allEntered = players.every((p) => scores[p.id][i] > 0);
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.holeDot,
                  currentHole === holeNum && styles.holeDotActive,
                  allEntered && styles.holeDotComplete,
                ]}
                onPress={() => goToHole(holeNum)}
              >
                <Text
                  style={[
                    styles.holeDotText,
                    currentHole === holeNum && styles.holeDotTextActive,
                  ]}
                >
                  {holeNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {currentHole === numHoles ? (
          <Button title="Finish Round" onPress={handleFinishRound} size="large" />
        ) : (
          <View style={styles.footerButtons}>
            <Button
              title="Quit"
              variant="ghost"
              onPress={handleQuit}
              style={styles.quitButton}
            />
            {players.length > 1 && (
              <Button
                title="Side Bets"
                variant="outline"
                onPress={() => setShowSideBets(true)}
                style={styles.sideBetsButton}
              />
            )}
            <Button
              title="Next Hole"
              onPress={() => goToHole(currentHole + 1)}
              style={styles.nextButton}
            />
          </View>
        )}
      </View>

      {/* Side Bets Modal */}
      <Modal
        visible={showSideBets}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSideBets(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Side Bets - Hole {currentHole}</Text>
              <TouchableOpacity onPress={() => setShowSideBets(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {getApplicableSideBets(currentHole - 1).map(([type, config]) => {
                const isActive = !!sideBetsPerHole[currentHole - 1]?.[type];
                return (
                  <View key={type} style={styles.sideBetItem}>
                    <TouchableOpacity
                      style={[
                        styles.sideBetToggle,
                        isActive && styles.sideBetToggleActive,
                      ]}
                      onPress={() => toggleSideBet(currentHole - 1, type)}
                    >
                      <View style={styles.sideBetInfo}>
                        <Text style={styles.sideBetName}>{config.name}</Text>
                        <Text style={styles.sideBetDesc}>{config.description}</Text>
                      </View>
                      <View style={[styles.sideBetCheck, isActive && styles.sideBetCheckActive]}>
                        {isActive && <Text style={styles.sideBetCheckText}>On</Text>}
                        {!isActive && <Text style={styles.sideBetCheckTextOff}>Off</Text>}
                      </View>
                    </TouchableOpacity>
                    {isActive && (
                      <View style={styles.sideBetWinners}>
                        <Text style={styles.sideBetWinnerLabel}>Winner:</Text>
                        {players.map((player) => (
                          <TouchableOpacity
                            key={player.id}
                            style={[
                              styles.sideBetWinnerOption,
                              sideBetsPerHole[currentHole - 1]?.[type]?.winner === player.id &&
                                styles.sideBetWinnerOptionActive,
                            ]}
                            onPress={() => setSideBetWinner(currentHole - 1, type, player.id)}
                          >
                            <Text
                              style={[
                                styles.sideBetWinnerText,
                                sideBetsPerHole[currentHole - 1]?.[type]?.winner === player.id &&
                                  styles.sideBetWinnerTextActive,
                              ]}
                            >
                              {player.name.split(' ')[0]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
              {getApplicableSideBets(currentHole - 1).length === 0 && (
                <Text style={styles.noSideBets}>
                  No side bets available for this hole
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Money Pop Animation */}
      <MoneyPop
        amount={moneyPop.amount}
        positive={moneyPop.positive}
        visible={moneyPop.visible}
        onAnimationComplete={() => setMoneyPop({ ...moneyPop, visible: false })}
        style={styles.moneyPop}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 40,
    fontWeight: '300',
    color: colors.text,
  },
  navButtonDisabled: {
    color: colors.textMuted,
  },
  holeInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  liveBankSection: {
    backgroundColor: colors.dark,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 14,
  },
  liveBankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveBankTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white + '80',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  expandButton: {
    color: colors.white + '60',
    fontSize: 14,
  },
  liveBankRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  liveBankPlayer: {
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  miniAvatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  leaderboardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scoreSection: {
    flex: 1,
  },
  scoreContent: {
    padding: 16,
    paddingBottom: 20,
  },
  playerScoreCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  playerScoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  playerName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  totalScore: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  strokesBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  strokesBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  scoreInput: {
    alignSelf: 'center',
  },
  holeDots: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  holeDotsContent: {
    paddingHorizontal: 12,
  },
  holeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  holeDotActive: {
    backgroundColor: colors.primary,
  },
  holeDotComplete: {
    backgroundColor: colors.success + '30',
  },
  holeDotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  holeDotTextActive: {
    color: colors.white,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quitButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  sideBetsButton: {
    flex: 1,
  },
  moneyPop: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modalBody: {
    padding: 16,
  },
  sideBetItem: {
    marginBottom: 12,
  },
  sideBetToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sideBetToggleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
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
    marginTop: 2,
  },
  sideBetCheck: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.cardBorder,
  },
  sideBetCheckActive: {
    backgroundColor: colors.primary,
  },
  sideBetCheckText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  sideBetCheckTextOff: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sideBetWinners: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  sideBetWinnerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 4,
  },
  sideBetWinnerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sideBetWinnerOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sideBetWinnerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  sideBetWinnerTextActive: {
    color: colors.white,
  },
  noSideBets: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
});

export default LiveScorecardScreen;
