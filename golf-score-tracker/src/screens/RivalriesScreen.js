// Rivalries Screen

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { getCurrentUser, getPlayers, getRounds } from '../utils/storage';
import { getAllRivalries } from '../utils/statisticsCalculators';
import RivalryCard from '../components/RivalryCard';

const RivalriesScreen = ({ navigation }) => {
  const [rivalries, setRivalries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortBy, setSortBy] = useState('rounds'); // rounds, money, winRate
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [user, players, rounds] = await Promise.all([
        getCurrentUser(),
        getPlayers(),
        getRounds(),
      ]);

      setCurrentUser(user);

      if (user) {
        const allRivalries = getAllRivalries(rounds, user.id, players);
        setRivalries(allRivalries);
      }
    } catch (error) {
      console.error('Error loading rivalries:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getSortedRivalries = () => {
    const sorted = [...rivalries];

    switch (sortBy) {
      case 'money':
        return sorted.sort((a, b) => {
          const aMoney = a.player1Id === currentUser?.id
            ? a.player1MoneyTotal
            : a.player2MoneyTotal;
          const bMoney = b.player1Id === currentUser?.id
            ? b.player1MoneyTotal
            : b.player2MoneyTotal;
          return bMoney - aMoney;
        });
      case 'winRate':
        return sorted.sort((a, b) => {
          const aWins = a.player1Id === currentUser?.id ? a.player1Wins : a.player2Wins;
          const bWins = b.player1Id === currentUser?.id ? b.player1Wins : b.player2Wins;
          const aRate = aWins / a.totalRounds;
          const bRate = bWins / b.totalRounds;
          return bRate - aRate;
        });
      default: // rounds
        return sorted.sort((a, b) => b.totalRounds - a.totalRounds);
    }
  };

  const renderRivalry = ({ item }) => (
    <RivalryCard
      rivalry={item}
      currentUserId={currentUser?.id}
      onPress={() =>
        navigation.navigate('HeadToHead', {
          rivalry: item,
          opponent: item.opponent,
        })
      }
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.subtitle}>
        {rivalries.length} rival{rivalries.length !== 1 ? 's' : ''}
      </Text>
      <View style={styles.sortButtons}>
        {[
          { key: 'rounds', label: 'Most Played' },
          { key: 'money', label: 'Money' },
          { key: 'winRate', label: 'Win %' },
        ].map((sort) => (
          <TouchableOpacity
            key={sort.key}
            style={[
              styles.sortButton,
              sortBy === sort.key && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy(sort.key)}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === sort.key && styles.sortButtonTextActive,
              ]}
            >
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔥</Text>
      <Text style={styles.emptyTitle}>No rivalries yet</Text>
      <Text style={styles.emptyText}>
        Play rounds with other players to build rivalries
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={getSortedRivalries()}
        renderItem={renderRivalry}
        keyExtractor={(item) => item.player2Id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={rivalries.length > 0 ? renderHeader : null}
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />
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
  },
  header: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
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
    paddingHorizontal: 40,
  },
});

export default RivalriesScreen;
