import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import { WeeklyLoses, Streak, Winner } from '../types';
import { getCurrentWeekLoses, getDaysUntilNextDraw } from '../services/lotteryService';
import { getCurrentStreak } from '../services/streakService';
import { getCurrentWeekWinners, hasUserWonThisWeek } from '../services/winnerService';
import StreakBadge from '../components/StreakBadge';
import WinnerCard from '../components/WinnerCard';

export default function LotteryScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [weeklyLoses, setWeeklyLoses] = useState<WeeklyLoses | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const daysUntilDraw = getDaysUntilNextDraw();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedUserName = await AsyncStorage.getItem('userName');
      
      setUserId(storedUserId);
      setUserName(storedUserName);

      if (storedUserId) {
        // Lade Lose
        const loses = await getCurrentWeekLoses(storedUserId);
        setWeeklyLoses(loses);

        // Lade Streak
        const userStreak = await getCurrentStreak(storedUserId);
        setStreak(userStreak);

        // Lade Gewinner
        const weekWinners = await getCurrentWeekWinners();
        setWinners(weekWinners);

        // Prüfe ob User gewonnen hat
        const won = await hasUserWonThisWeek(storedUserId);
        setHasWon(won);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalLoses = weeklyLoses?.total_loses || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hallo, {userName}! 🎟️</Text>
        
        {/* Lose-Anzeige */}
        <View style={styles.losesDisplay}>
          <Text style={styles.losesEmoji}>🎟️</Text>
          <Text style={styles.losesAmount}>{totalLoses}</Text>
          <Text style={styles.losesLabel}>
            {totalLoses === 1 ? 'Los' : 'Lose'} diese Woche
          </Text>
        </View>

        {/* Streak Badge */}
        {streak && (
          <View style={styles.streakContainer}>
            <StreakBadge streak={streak} />
          </View>
        )}

        {/* Countdown */}
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>Nächste Ziehung in:</Text>
          <Text style={styles.countdownDays}>
            {daysUntilDraw} {daysUntilDraw === 1 ? 'Tag' : 'Tagen'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Gewinner-Section */}
        {hasWon && (
          <View style={styles.winnerAlert}>
            <Text style={styles.winnerAlertEmoji}>🎉</Text>
            <Text style={styles.winnerAlertText}>
              Glückwunsch! Du hast diese Woche gewonnen!
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Gewinner dieser Woche</Text>
          {winners.length > 0 ? (
            winners.map((winner) => (
              <WinnerCard
                key={winner.id}
                winner={winner}
                isCurrentUser={winner.user_id === userId}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Die Ziehung findet jeden Montag statt.
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Sammle Lose durch Bewertungen! 🎟️
              </Text>
            </View>
          )}
        </View>

        {/* Regeln-Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Wie sammle ich Lose?</Text>
          
          <View style={styles.ruleCard}>
            <Text style={styles.ruleEmoji}>🎟️</Text>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Pro Bewertung</Text>
              <Text style={styles.ruleText}>• 1 Los = Basis-Bewertung</Text>
              <Text style={styles.ruleText}>• +1 Los = Mit Kommentar</Text>
              <Text style={styles.ruleText}>• +1 Los = Mit Foto</Text>
              <Text style={styles.ruleLimit}>Max. 3 Lose pro Tag</Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleEmoji}>🔥</Text>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Streak-Bonus</Text>
              <Text style={styles.ruleText}>• 3 Tage → +1 Bonus-Los</Text>
              <Text style={styles.ruleText}>• 7 Tage → +2 Bonus-Lose</Text>
              <Text style={styles.ruleText}>• 14 Tage → +3 Bonus-Lose</Text>
              <Text style={styles.ruleText}>• 30 Tage → +5 Bonus-Lose</Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleEmoji}>🛡️</Text>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Streak-Schutz</Text>
              <Text style={styles.ruleText}>
                1x pro Monat wird dein Streak automatisch geschützt, 
                wenn du einen Tag vergisst.
              </Text>
            </View>
          </View>
        </View>

        {/* Gewinnchancen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Preise</Text>
          
          <View style={styles.prizeCard}>
            <Text style={styles.prizeIcon}>🥇</Text>
            <Text style={styles.prizeName}>10€ Gutschein</Text>
          </View>
          
          <View style={styles.prizeCard}>
            <Text style={styles.prizeIcon}>🥈</Text>
            <Text style={styles.prizeName}>5€ Gutschein</Text>
          </View>
          
          <View style={styles.prizeCard}>
            <Text style={styles.prizeIcon}>🥉</Text>
            <Text style={styles.prizeName}>Überraschungsbox</Text>
          </View>
          
          <View style={styles.prizeCard}>
            <Text style={styles.prizeIcon}>⭐</Text>
            <Text style={styles.prizeName}>Qualitäts-Preis</Text>
            <Text style={styles.prizeSubtext}>Beste Bewertung der Woche</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
  losesDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  losesEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.xs,
  },
  losesAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  losesLabel: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  countdownBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 14,
    color: theme.colors.white,
    marginBottom: 4,
  },
  countdownDays: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  winnerAlert: {
    backgroundColor: theme.colors.accent,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  winnerAlertEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  winnerAlertText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  ruleCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
  },
  ruleEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  ruleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  ruleLimit: {
    fontSize: 12,
    color: theme.colors.gray,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  prizeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  prizeName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  prizeSubtext: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
