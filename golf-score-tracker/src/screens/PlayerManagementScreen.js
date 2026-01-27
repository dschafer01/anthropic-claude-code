// Player Management Screen

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { getPlayers, deletePlayer } from '../utils/storage';
import PlayerCard from '../components/PlayerCard';
import Button from '../components/Button';

const PlayerManagementScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPlayers = async () => {
    try {
      const allPlayers = await getPlayers();
      // Sort by name
      const sorted = allPlayers.sort((a, b) => a.name.localeCompare(b.name));
      setPlayers(sorted);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

  const handleDeletePlayer = (player) => {
    Alert.alert(
      'Delete Player',
      `Are you sure you want to delete "${player.name}"? This will not delete their round history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlayer(player.id);
            loadPlayers();
          },
        },
      ]
    );
  };

  const renderPlayer = ({ item }) => (
    <PlayerCard
      player={item}
      showMoney
      showHandicap
      onPress={() => navigation.navigate('AddPlayer', { player: item })}
      onLongPress={() => handleDeletePlayer(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.subtitle}>
        {players.length} player{players.length !== 1 ? 's' : ''} saved
      </Text>
      <Text style={styles.hint}>Long press to delete a player</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>No Players</Text>
      <Text style={styles.emptyTitle}>No players yet</Text>
      <Text style={styles.emptyText}>
        Add players to track scores and rivalries
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={players.length > 0 ? renderHeader : null}
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Add New Player"
          icon="+"
          onPress={() => navigation.navigate('AddPlayer')}
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
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
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

export default PlayerManagementScreen;
