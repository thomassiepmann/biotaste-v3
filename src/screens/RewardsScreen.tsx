import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import { DUMMY_REWARDS } from '../data/dummyData';
import { Reward } from '../types';

export default function RewardsScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const mockPoints = 0; // Mock-Punkte für Demo-Zwecke

  useEffect(() => {
    AsyncStorage.getItem('userName').then(name => setUserName(name));
  }, []);

  const getNextReward = (): Reward | null => {
    const affordableRewards = DUMMY_REWARDS.filter(r => r.points_cost > mockPoints);
    if (affordableRewards.length === 0) return null;
    return affordableRewards.reduce((min, r) => r.points_cost < min.points_cost ? r : min);
  };

  const nextReward = getNextReward();
  const progressPercentage = nextReward 
    ? Math.min((mockPoints / nextReward.points_cost) * 100, 100)
    : 100;

  const handleRedeem = (reward: Reward) => {
    if (mockPoints >= reward.points_cost) {
      alert(`🎉 Glückwunsch! Du hast "${reward.name}" eingelöst!`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hallo, {userName}! 🎁</Text>
        <View style={styles.pointsDisplay}>
          <Text style={styles.pointsEmoji}>🌱</Text>
          <Text style={styles.pointsAmount}>{mockPoints}</Text>
          <Text style={styles.pointsLabel}>Punkte</Text>
        </View>

        {/* Progress Bar */}
        {nextReward && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Nächstes Ziel: {nextReward.name} ({nextReward.points_cost} Punkte)
            </Text>
          </View>
        )}
      </View>

      {/* Rewards List */}
      <ScrollView style={styles.content}>
        <View style={styles.rewardsGrid}>
          {DUMMY_REWARDS.map((reward) => {
            const canAfford = mockPoints >= reward.points_cost;
            const pointsNeeded = reward.points_cost - mockPoints;

            return (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                  </View>
                </View>

                <View style={styles.rewardFooter}>
                  <Text style={styles.rewardCost}>{reward.points_cost} Punkte</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      !canAfford && styles.redeemButtonDisabled,
                    ]}
                    onPress={() => handleRedeem(reward)}
                    disabled={!canAfford}
                  >
                    <Text style={[
                      styles.redeemButtonText,
                      !canAfford && styles.redeemButtonTextDisabled,
                    ]}>
                      {canAfford ? 'Einlösen' : `Noch ${pointsNeeded}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Wie sammle ich Punkte?</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>15 Punkte für jede Bewertung</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>+5 Punkte für einen Kommentar</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>+10 Punkte für ein Foto</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Bonus für tägliche Streaks!</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grayLight,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.lg,
  },
  pointsDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  pointsEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.xs,
  },
  pointsAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  pointsLabel: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  progressSection: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: theme.colors.white,
    textAlign: 'center',
  },
  streakInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  rewardsGrid: {
    padding: theme.spacing.lg,
  },
  rewardCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  rewardIcon: {
    fontSize: 40,
    marginRight: theme.spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  rewardDescription: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  redeemButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  redeemButtonDisabled: {
    backgroundColor: theme.colors.grayLight,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  redeemButtonTextDisabled: {
    color: theme.colors.gray,
  },
  infoSection: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    marginTop: 0,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoBullet: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
});
