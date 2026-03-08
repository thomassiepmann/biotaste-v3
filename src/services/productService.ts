import { supabase } from '../lib/supabase';
import { Product } from '../types';

/**
 * Fetch all available products from Supabase
 */
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Produkte:', error);
    return [];
  }

  return data || [];
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fehler beim Laden des Produkts:', error);
    return null;
  }

  return data;
};

/**
 * Fetch products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_available', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Produkte:', error);
    return [];
  }

  return data || [];
};
