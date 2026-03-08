import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { DUMMY_CHARGES } from '../data/dummyData';
import { Product, Charge, WeeklyLoses, Streak } from '../types';
import { getCurrentWeekLoses } from '../services/lotteryService';
import { getCurrentStreak } from '../services/streakService';
import StreakBadge from '../components/StreakBadge';
import { supabase } from '../lib/supabase';

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'Obst': '🍎',
  'Gemüse': '🥦',
  'Kräuter': '🌿',
};

export default function HomeScreen({ navigation }: any) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [weeklyLoses, setWeeklyLoses] = useState<WeeklyLoses | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
    }

    // Fetch products from Supabase
    try {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (error) {
        setProductsError(error.message);
        console.error('Error fetching products:', error);
      } else if (data) {
        setProducts(data);
      }
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'Unknown error');
      console.error('Unexpected error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }

    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getProductForCharge = (charge: Charge): Product | undefined => {
    return products.find(p => p.id === charge.product_id);
  };

  const handleTastePress = (charge: Charge, product: Product) => {
    navigation.navigate('Rating', { charge, product });
  };

  const handleLogout = () => {
    Alert.alert(
      'Abmelden?',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Nein', style: 'cancel' },
        { 
          text: 'Ja', 
          onPress: async () => {
            await AsyncStorage.removeItem('userName');
            navigation.reset({
              index: 0,
              routes: [{ name: 'NameInput' }],
            });
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hallo, {userName}! 👋</Text>
          
          {/* Lose-Anzeige */}
          <View style={styles.losesDisplay}>
            <Text style={styles.losesText}>
              🎟️ {weeklyLoses?.total_loses || 0} {(weeklyLoses?.total_loses || 0) === 1 ? 'Los' : 'Lose'} diese Woche
            </Text>
          </View>

          {/* Streak Badge */}
          {streak && streak.current_streak > 0 && (
            <View style={styles.streakContainer}>
              <StreakBadge streak={streak} showProtection={false} />
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={28} color="#48bb78" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Section 1: Open for tasting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offen zum Verkosten 🍽️</Text>
          
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Lade Produkte...</Text>
            </View>
          ) : productsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Fehler beim Laden der Produkte: {productsError}</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Keine aktiven Produkte gefunden</Text>
            </View>
          ) : (
            DUMMY_CHARGES.map((charge) => {
              const product = getProductForCharge(charge);
              if (!product) return null;

              return (
                <View key={charge.id} style={styles.productCard}>
                  <View style={styles.productCardContent}>
                    <View style={styles.categoryIcon}>
                      <Text style={styles.categoryEmoji}>
                        {CATEGORY_EMOJIS[product.category] || '🌱'}
                      </Text>
                    </View>
                    
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productSupplier}>{product.supplier}</Text>
                      <Text style={styles.productCharge}>
                        {charge.charge_code} • {new Date(charge.delivery_date).toLocaleDateString('de-DE')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.tasteButton}
                    onPress={() => handleTastePress(charge, product)}
                  >
                    <Text style={styles.tasteButtonText}>Jetzt verkosten →</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Section 2: Already rated */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bereits bewertet ✅</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Noch keine Bewertungen heute</Text>
          </View>
        </View>
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
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  losesDisplay: {
    marginBottom: theme.spacing.sm,
  },
  losesText: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.9,
  },
  streakContainer: {
    marginTop: theme.spacing.xs,
  },
  logoutButton: {
    backgroundColor: theme.colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
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
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardContent: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  categoryEmoji: {
    fontSize: 30,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  productSupplier: {
    fontSize: 13,
    color: theme.colors.gray,
    marginBottom: 2,
  },
  productCharge: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  tasteButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  tasteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  emptyState: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  loadingContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  errorContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#e53e3e',
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
});
