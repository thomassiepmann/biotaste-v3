import { User, Product, Charge, Reward } from '../types';

export const DUMMY_USERS: User[] = [
  { id: '1', name: 'Anna', pin: '0000', points: 340, streak_days: 5, last_rating_date: null, role: 'admin' },
  { id: '2', name: 'Ben', pin: '0000', points: 125, streak_days: 3, last_rating_date: null, role: 'employee' },
  { id: '3', name: 'Clara', pin: '0000', points: 80, streak_days: 1, last_rating_date: null, role: 'employee' },
  { id: '4', name: 'David', pin: '0000', points: 210, streak_days: 7, last_rating_date: null, role: 'employee' },
];

export const DUMMY_PRODUCTS: Product[] = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Bio-Äpfel Gala', category: 'Obst', supplier: 'Obsthof Müller' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Rispentomaten', category: 'Gemüse', supplier: 'BioGärtnerei Schmidt' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Basilikum', category: 'Kräuter', supplier: 'Kräuterhof Weber' },
];

export const DUMMY_CHARGES: Charge[] = [
  { id: '660e8400-e29b-41d4-a716-446655440001', product_id: '550e8400-e29b-41d4-a716-446655440001', charge_code: 'KW09-001', delivery_date: '2025-03-01', supplier_batch: 'ML-2025-09' },
  { id: '660e8400-e29b-41d4-a716-446655440002', product_id: '550e8400-e29b-41d4-a716-446655440002', charge_code: 'KW09-002', delivery_date: '2025-03-02', supplier_batch: 'BS-2025-09' },
  { id: '660e8400-e29b-41d4-a716-446655440003', product_id: '550e8400-e29b-41d4-a716-446655440003', charge_code: 'KW09-003', delivery_date: '2025-03-03', supplier_batch: 'KW-2025-09' },
];

export const DUMMY_REWARDS: Reward[] = [
  { id: 'r1', name: 'Bio-Kaffee', points_cost: 300, description: 'Ein leckerer Bio-Kaffee', icon: '☕' },
  { id: 'r2', name: 'Bio-Snack', points_cost: 800, description: 'Snack deiner Wahl', icon: '🍎' },
  { id: 'r3', name: 'Bio-Tasche', points_cost: 1500, description: 'Stylische Bio-Tragetasche', icon: '👜' },
  { id: 'r4', name: 'Extra-Urlaubstag', points_cost: 5000, description: 'Ein freier Tag extra!', icon: '🌟' },
];
