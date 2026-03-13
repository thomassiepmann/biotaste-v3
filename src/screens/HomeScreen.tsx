import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'Obst': '🍎',
  'Gemüse': '🥦',
  'Kräuter': '🌿',
};

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const storedUserName = await AsyncStorage.getItem('userName');
    setUserName(storedUserName);

    try {
      setProductsLoading(true);
      setProductsError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        setProductsError(error.message);
      } else {
        console.log('Products loaded:', data?.length);
        setProducts(data || []);
      }
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setProductsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleTastePress = (product: Product) => {
    navigation.navigate('Rating', { product });
  };

  const handleLogout = () => {
    Alert.alert('Abmelden?', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Nein', style: 'cancel' },
      {
        text: 'Ja',
        onPress: async () => {
          await AsyncStorage.removeItem('userName');
          navigation.reset({ index: 0, routes: [{ name: 'NameInput' }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hallo, {userName}! 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={28} color="#48bb78" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offen zum Verkosten 🍽️</Text>

          {productsLoading ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Lade Produkte...</Text>
            </View>
          ) : productsError ? (
            <View style={styles.infoBox}>
              <Text style={styles.errorText}>Fehler: {productsError}</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Text style={styles.retryText}>Erneut versuchen</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Keine aktiven Produkte gefunden</Text>
            </View>
          ) : (
            products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productCardContent}>
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryEmoji}>
                      {CATEGORY_EMOJIS[product.category] || '🌱'}
                    </Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    {product.supplier ? (
                      <Text style={styles.productSupplier}>{product.supplier}</Text>
                    ) : null}
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.tasteButton} onPress={() => handleTastePress(product)}>
                  <Text style={styles.tasteButtonText}>Jetzt verkosten →</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bereits bewertet ✅</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Noch keine Bewertungen heute</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.grayLight },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: theme.colors.white },
  logoutButton: {
    backgroundColor: theme.colors.white,
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },
  content: { flex: 1 },
  section: { padding: theme.spacing.lg },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.md },
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  productCardContent: { flexDirection: 'row', marginBottom: theme.spacing.md },
  categoryIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  categoryEmoji: { fontSize: 30 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 2 },
  productSupplier: { fontSize: 13, color: theme.colors.gray, marginBottom: 2 },
  productCategory: { fontSize: 12, color: theme.colors.primary, fontWeight: '500' },
  tasteButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  tasteButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.white },
  infoBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  infoText: { fontSize: 14, color: theme.colors.gray },
  errorText: { fontSize: 14, color: '#e53e3e', textAlign: 'center', marginBottom: theme.spacing.md },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  retryText: { color: theme.colors.white, fontWeight: '600' },
});
