import { supabase } from '../lib/supabase';
import { Winner, Prize } from '../types';
import { getCurrentWeekStart } from './lotteryService';

/**
 * Preise für die verschiedenen Gewinner-Typen
 */
export const PRIZES: Prize[] = [
  {
    id: '1',
    name: '10€ Gutschein',
    description: 'Einkaufsgutschein für Paradieschen',
    icon: '🎁',
    winner_type: 'random_1',
  },
  {
    id: '2',
    name: '5€ Gutschein',
    description: 'Einkaufsgutschein für Paradieschen',
    icon: '🎁',
    winner_type: 'random_2',
  },
  {
    id: '3',
    name: 'Überraschungsbox',
    description: 'Kleine Überraschung aus dem Sortiment',
    icon: '📦',
    winner_type: 'random_3',
  },
  {
    id: '4',
    name: 'Qualitäts-Preis',
    description: 'Für die beste Bewertung der Woche',
    icon: '⭐',
    winner_type: 'quality',
  },
];

/**
 * Lädt Gewinner einer bestimmten Woche
 */
export const getWeekWinners = async (weekStart: string): Promise<Winner[]> => {
  const { data, error } = await supabase
    .from('winners')
    .select(`
      *,
      user:app_users(name),
      settings:user_settings(is_anonymous, display_name)
    `)
    .eq('week_start', weekStart)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fehler beim Laden der Gewinner:', error);
    return [];
  }

  return data || [];
};

/**
 * Lädt Gewinner der aktuellen Woche
 */
export const getCurrentWeekWinners = async (): Promise<Winner[]> => {
  const weekStart = getCurrentWeekStart();
  return await getWeekWinners(weekStart);
};

/**
 * Lädt alle Gewinner (Historie)
 */
export const getAllWinners = async (limit: number = 20): Promise<Winner[]> => {
  const { data, error } = await supabase
    .from('winners')
    .select(`
      *,
      user:app_users(name),
      settings:user_settings(is_anonymous, display_name)
    `)
    .order('week_start', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Fehler beim Laden der Gewinner-Historie:', error);
    return [];
  }

  return data || [];
};

/**
 * Prüft ob ein User in einer Woche gewonnen hat
 */
export const hasUserWonThisWeek = async (userId: string): Promise<boolean> => {
  const weekStart = getCurrentWeekStart();
  
  const { data, error } = await supabase
    .from('winners')
    .select('id')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single();

  return !!data;
};

/**
 * Erstellt einen Gewinner (Admin-Funktion)
 */
export const createWinner = async (
  userId: string,
  winnerType: 'random_1' | 'random_2' | 'random_3' | 'quality',
  weekStart?: string
): Promise<Winner | null> => {
  const week = weekStart || getCurrentWeekStart();
  const prize = PRIZES.find(p => p.winner_type === winnerType);

  if (!prize) {
    console.error('Ungültiger Gewinner-Typ:', winnerType);
    return null;
  }

  // Prüfe User-Settings für Anonym-Option
  const { data: settings } = await supabase
    .from('user_settings')
    .select('is_anonymous')
    .eq('user_id', userId)
    .single();

  const { data, error } = await supabase
    .from('winners')
    .insert({
      user_id: userId,
      week_start: week,
      winner_type: winnerType,
      prize: prize.name,
      is_anonymous: settings?.is_anonymous || false,
      reward_claimed: false,
      reward_qr_code: null,
    })
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Erstellen des Gewinners:', error);
    return null;
  }

  return data;
};

/**
 * Markiert einen Gewinn als eingelöst
 */
export const claimReward = async (
  winnerId: string,
  qrCode: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('winners')
    .update({
      reward_claimed: true,
      reward_qr_code: qrCode,
    })
    .eq('id', winnerId);

  return !error;
};

/**
 * Formatiert Gewinner-Name (mit Anonym-Option)
 */
export const formatWinnerName = (winner: any): string => {
  if (winner.is_anonymous) {
    return winner.settings?.display_name || 'Anonym';
  }
  return winner.user?.name || 'Unbekannt';
};

/**
 * Holt Preis-Info für Gewinner-Typ
 */
export const getPrizeForType = (
  winnerType: 'random_1' | 'random_2' | 'random_3' | 'quality'
): Prize | undefined => {
  return PRIZES.find(p => p.winner_type === winnerType);
};

/**
 * Zieht zufällige Gewinner für eine Woche (Admin-Funktion)
 * 
 * Algorithmus:
 * 1. Sammle alle User mit Losen dieser Woche
 * 2. Gewichte nach Anzahl der Lose
 * 3. Ziehe 3 zufällige Gewinner
 * 4. Wähle Qualitäts-Gewinner (beste Bewertung)
 */
export const drawWeeklyWinners = async (
  weekStart?: string
): Promise<{ success: boolean; winners: Winner[]; message: string }> => {
  const week = weekStart || getCurrentWeekStart();

  // Lade alle Lose dieser Woche
  const { data: allLoses, error: losesError } = await supabase
    .from('loses')
    .select('user_id, total_loses')
    .eq('week_start', week)
    .gt('total_loses', 0);

  if (losesError || !allLoses || allLoses.length === 0) {
    return {
      success: false,
      winners: [],
      message: 'Keine Teilnehmer für diese Woche gefunden',
    };
  }

  // Erstelle gewichtete Liste (jedes Los = ein Eintrag)
  const weightedUsers: string[] = [];
  allLoses.forEach((entry: { user_id: string; total_loses: number }) => {
    for (let i = 0; i < entry.total_loses; i++) {
      weightedUsers.push(entry.user_id);
    }
  });

  // Ziehe 3 zufällige Gewinner
  const winners: Winner[] = [];
  const drawnUserIds = new Set<string>();

  for (const type of ['random_1', 'random_2', 'random_3'] as const) {
    if (weightedUsers.length === 0) break;

    let attempts = 0;
    let winnerId: string | null = null;

    // Versuche einen noch nicht gezogenen User zu finden
    while (attempts < 100 && !winnerId) {
      const randomIndex = Math.floor(Math.random() * weightedUsers.length);
      const candidateId = weightedUsers[randomIndex];
      
      if (!drawnUserIds.has(candidateId)) {
        winnerId = candidateId;
        drawnUserIds.add(candidateId);
      }
      attempts++;
    }

    if (winnerId) {
      const winner = await createWinner(winnerId, type, week);
      if (winner) winners.push(winner);
    }
  }

  // Qualitäts-Gewinner: Beste Bewertung der Woche
  const { data: bestRating } = await supabase
    .from('ratings')
    .select('user_id, overall_stars, comment')
    .gte('created_at', week)
    .not('comment', 'is', null)
    .order('overall_stars', { ascending: false })
    .limit(1)
    .single();

  if (bestRating && !drawnUserIds.has(bestRating.user_id)) {
    const qualityWinner = await createWinner(bestRating.user_id, 'quality', week);
    if (qualityWinner) winners.push(qualityWinner);
  }

  return {
    success: true,
    winners,
    message: `${winners.length} Gewinner erfolgreich gezogen!`,
  };
};
