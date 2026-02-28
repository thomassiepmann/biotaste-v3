import { supabase } from '../lib/supabase';
import { WeeklyLoses, AwardLosesResult } from '../types';

/**
 * Berechnet den Montag der aktuellen Woche (ISO 8601)
 */
export const getCurrentWeekStart = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
};

/**
 * Heutiges Datum als ISO String
 */
export const getToday = (): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
};

/**
 * Lädt oder erstellt die Lose-Daten für die aktuelle Woche
 */
export const getOrCreateWeeklyLoses = async (
  userId: string
): Promise<WeeklyLoses | null> => {
  const weekStart = getCurrentWeekStart();

  // Versuche existierende Daten zu laden
  const { data: existing, error: fetchError } = await supabase
    .from('loses')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single();

  if (existing) {
    return existing;
  }

  // Erstelle neue Woche
  const { data: newLoses, error: insertError } = await supabase
    .from('loses')
    .insert({
      user_id: userId,
      week_start: weekStart,
      total_loses: 0,
      bonus_loses: 0,
      streak_loses: 0,
      daily_count: 0,
      last_rating_date: null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Fehler beim Erstellen der Wochendaten:', insertError);
    return null;
  }

  return newLoses;
};

/**
 * Vergibt Lose nach einer Bewertung
 * 
 * Regeln:
 * - 1 Los = Basis-Bewertung
 * - +1 Los = Mit Kommentar
 * - +1 Los = Mit Foto
 * - Max. 3 Bewertungen pro Tag
 */
export const awardLoses = async (
  userId: string,
  hasComment: boolean,
  hasPhoto: boolean
): Promise<AwardLosesResult> => {
  const weekStart = getCurrentWeekStart();
  const today = getToday();

  // Aktuelle Wochendaten laden
  let weeklyLoses = await getOrCreateWeeklyLoses(userId);
  
  if (!weeklyLoses) {
    return {
      success: false,
      losesAwarded: 0,
      message: 'Fehler beim Laden der Lose-Daten',
    };
  }

  // Prüfe Tages-Limit (max 3 Lose/Tag)
  if (weeklyLoses.last_rating_date === today && weeklyLoses.daily_count >= 3) {
    return {
      success: false,
      losesAwarded: 0,
      message: '🎟️ Tages-Limit erreicht! Morgen kannst du wieder 3 Lose sammeln.',
    };
  }

  // Berechne neue Lose
  let newLoses = 1; // Basis
  if (hasComment) newLoses += 1;
  if (hasPhoto) newLoses += 1;

  // Update daily_count
  const isNewDay = weeklyLoses.last_rating_date !== today;
  const newDailyCount = isNewDay ? 1 : weeklyLoses.daily_count + 1;

  // Update Datenbank
  const { data: updated, error } = await supabase
    .from('loses')
    .update({
      total_loses: weeklyLoses.total_loses + newLoses,
      daily_count: newDailyCount,
      last_rating_date: today,
    })
    .eq('id', weeklyLoses.id)
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Update der Lose:', error);
    return {
      success: false,
      losesAwarded: 0,
      message: 'Fehler beim Speichern der Lose',
    };
  }

  return {
    success: true,
    losesAwarded: newLoses,
    newTotal: updated.total_loses,
    message: `🎟️ +${newLoses} ${newLoses === 1 ? 'Los' : 'Lose'} gesammelt!`,
  };
};

/**
 * Fügt Streak-Bonus-Lose hinzu
 */
export const addStreakBonusLoses = async (
  userId: string,
  bonusLoses: number
): Promise<boolean> => {
  const weekStart = getCurrentWeekStart();

  const { data: weeklyLoses } = await supabase
    .from('loses')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single();

  if (!weeklyLoses) return false;

  const { error } = await supabase
    .from('loses')
    .update({
      streak_loses: weeklyLoses.streak_loses + bonusLoses,
      total_loses: weeklyLoses.total_loses + bonusLoses,
    })
    .eq('id', weeklyLoses.id);

  return !error;
};

/**
 * Lädt die Lose der aktuellen Woche
 */
export const getCurrentWeekLoses = async (
  userId: string
): Promise<WeeklyLoses | null> => {
  return await getOrCreateWeeklyLoses(userId);
};

/**
 * Lädt alle Lose-Daten eines Users (Historie)
 */
export const getUserLosesHistory = async (
  userId: string
): Promise<WeeklyLoses[]> => {
  const { data, error } = await supabase
    .from('loses')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false });

  if (error) {
    console.error('Fehler beim Laden der Lose-Historie:', error);
    return [];
  }

  return data || [];
};

/**
 * Berechnet Tage bis zur nächsten Ziehung (Montag)
 */
export const getDaysUntilNextDraw = (): number => {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  return daysUntilMonday;
};

/**
 * Formatiert Datum für Anzeige
 */
export const formatWeekStart = (weekStart: string): string => {
  const date = new Date(weekStart);
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('de-DE', options);
};
