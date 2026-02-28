import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Streak } from '../types';

interface StreakBadgeProps {
  streak: Streak;
  showProtection?: boolean;
}

export default function StreakBadge({ streak, showProtection = true }: StreakBadgeProps) {
  const { current_streak, streak_protection_used, protection_reset_month } = streak;
  
  // Bestimme Emoji basierend auf Streak-Länge
  const getStreakEmoji = () => {
    if (current_streak >= 30) return '🔥🔥🔥';
    if (current_streak >= 14) return '🔥🔥';
    if (current_streak >= 7) return '🔥';
    if (current_streak >= 3) return '🔥';
    return '⭐';
  };

  // Bestimme Farbe basierend auf Streak-Länge
  const getStreakColor = () => {
    if (current_streak >= 30) return '#ff4500'; // Orange-Red
    if (current_streak >= 14) return '#ff6347'; // Tomato
    if (current_streak >= 7) return '#ff8c00'; // Dark Orange
    if (current_streak >= 3) return '#ffa500'; // Orange
    return theme.colors.gray;
  };

  // Prüfe ob Schutz verfügbar ist
  const currentMonth = new Date().getMonth() + 1;
  const protectionAvailable = !streak_protection_used || protection_reset_month !== currentMonth;

  if (current_streak === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.badge, styles.badgeInactive]}>
          <Text style={styles.emojiInactive}>⭐</Text>
          <Text style={styles.textInactive}>Starte deinen Streak!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { borderColor: getStreakColor() }]}>
        <Text style={styles.emoji}>{getStreakEmoji()}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.streakNumber}>{current_streak}</Text>
          <Text style={styles.streakLabel}>
            {current_streak === 1 ? 'Tag' : 'Tage'} Streak
          </Text>
        </View>
        
        {showProtection && current_streak >= 3 && (
          <View style={styles.protectionBadge}>
            <Text style={styles.protectionText}>
              {protectionAvailable ? '🛡️ Schutz' : '🛡️ Genutzt'}
            </Text>
          </View>
        )}
      </View>

      {/* Streak-Bonus Info */}
      {current_streak >= 3 && (
        <View style={styles.bonusInfo}>
          <Text style={styles.bonusText}>
            {current_streak >= 30 && '+5 Bonus-Lose'}
            {current_streak >= 14 && current_streak < 30 && '+3 Bonus-Lose'}
            {current_streak >= 7 && current_streak < 14 && '+2 Bonus-Lose'}
            {current_streak >= 3 && current_streak < 7 && '+1 Bonus-Los'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeInactive: {
    borderColor: theme.colors.grayLight,
    backgroundColor: theme.colors.grayLight,
  },
  emoji: {
    fontSize: 28,
    marginRight: theme.spacing.sm,
  },
  emojiInactive: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 28,
  },
  streakLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: -2,
  },
  textInactive: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  protectionBadge: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  protectionText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '600',
  },
  bonusInfo: {
    marginTop: theme.spacing.xs,
    backgroundColor: 'rgba(115, 138, 76, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  bonusText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
