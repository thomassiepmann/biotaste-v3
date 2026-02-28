import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Winner } from '../types';
import { formatWinnerName, getPrizeForType } from '../services/winnerService';

interface WinnerCardProps {
  winner: Winner;
  isCurrentUser?: boolean;
}

export default function WinnerCard({ winner, isCurrentUser = false }: WinnerCardProps) {
  const prize = getPrizeForType(winner.winner_type);
  
  // Bestimme Hintergrundfarbe basierend auf Gewinner-Typ
  const getBackgroundColor = () => {
    if (isCurrentUser) return theme.colors.accent;
    switch (winner.winner_type) {
      case 'random_1':
        return '#FFD700'; // Gold
      case 'random_2':
        return '#C0C0C0'; // Silber
      case 'random_3':
        return '#CD7F32'; // Bronze
      case 'quality':
        return theme.colors.primary;
      default:
        return theme.colors.grayLight;
    }
  };

  // Bestimme Label
  const getLabel = () => {
    switch (winner.winner_type) {
      case 'random_1':
        return '🥇 1. Platz';
      case 'random_2':
        return '🥈 2. Platz';
      case 'random_3':
        return '🥉 3. Platz';
      case 'quality':
        return '⭐ Qualitäts-Preis';
      default:
        return 'Gewinner';
    }
  };

  return (
    <View style={[styles.card, isCurrentUser && styles.cardHighlight]}>
      {/* Header mit Typ */}
      <View style={[styles.header, { backgroundColor: getBackgroundColor() }]}>
        <Text style={styles.label}>{getLabel()}</Text>
        {isCurrentUser && (
          <View style={styles.youBadge}>
            <Text style={styles.youText}>DU!</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.prizeIcon}>{prize?.icon || '🎁'}</Text>
        <View style={styles.info}>
          <Text style={styles.prizeName}>{winner.prize}</Text>
          <Text style={styles.winnerName}>
            {formatWinnerName(winner)}
          </Text>
          {winner.reward_claimed && (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>✓ Eingelöst</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer mit Datum */}
      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Woche vom {new Date(winner.week_start).toLocaleDateString('de-DE')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHighlight: {
    borderWidth: 3,
    borderColor: theme.colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  youBadge: {
    backgroundColor: theme.colors.white,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  youText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  content: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  prizeIcon: {
    fontSize: 48,
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  prizeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  winnerName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  claimedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  claimedText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.white,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.grayLight,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});
