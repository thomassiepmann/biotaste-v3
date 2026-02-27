export interface User {
  id: string;
  name: string;
  pin: string;
  points: number;
  streak_days: number;
  last_rating_date: string | null;
  role: 'employee' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  image_url?: string;
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
  points_earned: number;
}

export interface Reward {
  id: string;
  name: string;
  points_cost: number;
  description: string;
  icon: string;
}
