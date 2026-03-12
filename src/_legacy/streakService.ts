import { supabase } from '../lib/supabase';
import { Streak, StreakUpdateResult } from '../types';
import { getToday } from './lotteryService';
import { addStreakBonusLoses } from './lotteryService';

/**
 * Lädt oder erstellt Streak-Daten für einen User
 */
export const getOrCreateStreak = async (userId: string): Promise<Streak | null> => {
  // Versuche existierende Daten zu laden
  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return existing;
  }

  // Erstelle neuen Streak
  const { data: newStreak, error } = await supabase
    .from('streaks')
    .insert({
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_rating_date: null,
      streak_protection_used: false,
      protection_reset_month: null,
    })
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Erstellen des Streaks:', error);
    return null;
  }

  return newStreak;
};

/**
 * Berechnet Streak-Bonus-Lose basierend auf aktuellem Streak
 * 
 * Regeln:
 * - 3 Tage Streak: +1 Los
 * - 7 Tage Streak: +2 Lose
 * - 14 Tage Streak: +3 Lose
 * - 30 Tage Streak: +5 Lose
 */
const calculateStreakBonus = (streakDays: number): number => {
  if (streakDays >= 30) return 5;
  if (streakDays >= 14) return 3;
  if (streakDays >= 7) return 2;
  if (streakDays >= 3) return 1;
  return 0;
};

/**
 * Aktualisiert den Streak nach einer Bewertung
 */
export const updateStreak = async (
  userId: string
): Promise<StreakUpdateResult> => {
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let streak = await getOrCreateStreak(userId);
  
  if (!streak) {
    return {
      success: false,
      currentStreak: 0,
      bonusLoses: 0,
      message: 'Fehler beim Laden des Streaks',
    };
  }

  // Prüfe ob heute schon bewertet wurde
  if (streak.last_rating_date === today) {
    return {
      success: true,
      currentStreak: streak.current_streak,
      bonusLoses: 0,
      message: 'Streak bereits heute aktualisiert',
    };
  }

  let newStreak = streak.current_streak;
  let streakBroken = false;

  // Streak-Logik
  if (streak.last_rating_date === yesterdayStr) {
    // Streak fortsetzen
    newStreak += 1;
  } else if (streak.last_rating_date === null) {
    // Erster Tag
    newStreak = 1;
  } else {
    // Streak unterbrochen - prüfe Schutz
    const currentMonth = new Date().getMonth() + 1;
    const canUseProtection = 
      !streak.streak_protection_used || 
      streak.protection_reset_month !== currentMonth;

    if (canUseProtection && streak.current_streak >= 3) {
      // Schutz verwenden
      newStreak = streak.current_streak; // Streak bleibt erhalten
      streakBroken = false;
      
      await supabase
        .from('streaks')
        .update({
          streak_protection_used: true,
          protection_reset_month: currentMonth,
        })
        .eq('id', streak.id);
    } else {
      // Streak verloren
      newStreak = 1;
      streakBroken = true;
    }
  }

  // Berechne Bonus-Lose
  const bonusLoses = calculateStreakBonus(newStreak);

  // Update Streak
  const newLongest = Math.max(newStreak, streak.longest_streak);
  
  const { error } = await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_rating_date: today,
    })
    .eq('id', streak.id);

  if (error) {
    console.error('Fehler beim Update des Streaks:', error);
    return {
      success: false,
      currentStreak: streak.current_streak,
      bonusLoses: 0,
      message: 'Fehler beim Speichern des Streaks',
    };
  }

  // Füge Bonus-Lose hinzu
  if (bonusLoses > 0) {
    await addStreakBonusLoses(userId, bonusLoses);
  }

  // Erstelle Nachricht
  let message = `🔥 ${newStreak} Tage Streak!`;
  if (bonusLoses > 0) {
    message += ` +${bonusLoses} Bonus-${bonusLoses === 1 ? 'Los' : 'Lose'}!`;
  }
  if (streakBroken) {
    message = `Streak unterbrochen. Neuer Start: Tag 1`;
  }

  return {
    success: true,
    currentStreak: newStreak,
    bonusLoses,
    message,
  };
};

/**
 * Lädt den aktuellen Streak eines Users
 */
export const getCurrentStreak = async (userId: string): Promise<Streak | null> => {
  return await getOrCreateStreak(userId);
};

/**
 * Prüft ob Streak-Schutz verfügbar ist
 */
export const isStreakProtectionAvailable = async (
  userId: string
): Promise<boolean> => {
  const streak = await getOrCreateStreak(userId);
  if (!streak) return false;

  const currentMonth = new Date().getMonth() + 1;
  
  return (
    !streak.streak_protection_used || 
    streak.protection_reset_month !== currentMonth
  );
};

/**
 * Setzt Streak-Schutz am Monatsanfang zurück (Cron-Job)
 */
export const resetMonthlyStreakProtection = async (): Promise<void> => {
  const currentMonth = new Date().getMonth() + 1;

  await supabase
    .from('streaks')
    .update({
      streak_protection_used: false,
      protection_reset_month: currentMonth,
    })
    .neq('protection_reset_month', currentMonth);
};

/**
 * Formatiert Streak für Anzeige
 */
export const formatStreakMessage = (streak: Streak): string => {
  if (streak.current_streak === 0) {
    return 'Starte deinen Streak!';
  }
  
  const days = streak.current_streak;
  const emoji = days >= 30 ? '🔥🔥🔥' : days >= 7 ? '🔥🔥' : '🔥';
  
  return `${emoji} ${days} ${days === 1 ? 'Tag' : 'Tage'} Streak`;
};
