export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'employee' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  supplier?: string;
  image_url?: string;
  is_available: boolean;
  created_at?: string;
}

export interface Charge {
  id: string;
  product_id: string;
  charge_code: string;
  delivery_date: string;
  supplier_batch?: string;
}

export interface Rating {
  id: string;
  user_id: string;
  charge_id: string;
  overall_stars: number;
  taste_emoji: string;
  optic_emoji: string;
  texture_emoji: string;
  comment?: string;
  photo_url?: string;
  loses_earned: number;
}

// ============================================
// LOTTERIE/LOS-SYSTEM TYPEN
// ============================================

export interface WeeklyLoses {
  id: string;
  user_id: string;
  week_start: string; // ISO date string (Monday)
  total_loses: number;
  bonus_loses: number;
  streak_loses: number;
  daily_count: number;
  last_rating_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_rating_date: string | null;
  streak_protection_used: boolean;
  protection_reset_month: number | null;
  created_at: string;
  updated_at: string;
}

export interface Winner {
  id: string;
  user_id: string;
  week_start: string;
  winner_type: 'random_1' | 'random_2' | 'random_3' | 'quality';
  prize: string;
  is_anonymous: boolean;
  reward_claimed: boolean;
  reward_qr_code: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  is_anonymous: boolean;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  icon: string;
  winner_type: 'random_1' | 'random_2' | 'random_3' | 'quality';
}

// Service Response Types
export interface AwardLosesResult {
  success: boolean;
  losesAwarded: number;
  message: string;
  newTotal?: number;
}

export interface StreakUpdateResult {
  success: boolean;
  currentStreak: number;
  bonusLoses: number;
  message: string;
}
