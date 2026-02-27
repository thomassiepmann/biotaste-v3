import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { DUMMY_CHARGES, DUMMY_PRODUCTS } from '../data/dummyData';
import { User, Product, Charge } from '../types';

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'Obst': '🍎',
  'Gemüse': '🥦',
  'Kräuter': '🌿',
};

export default function HomeScreen({ route, navigation }: any) {
  const user: User = route.params?.user;

  const getProductForCharge = (charge: Charge): Product | undefined => {
    return DUMMY_PRODUCTS.find(p => p.id === charge.product_id);
  };

  const handleTastePress = (charge: Charge, product: Product) => {
    navigation.navigate('Rating', { charge, product, user });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hallo {user?.name}! 👋</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {user?.streak_days} Tage Streak!</Text>
          </View>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>🌱 {user?.points} Punkte</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Section 1: Open for tasting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offen zum Verkosten 🍽️</Text>
          
          {DUMMY_CHARGES.map((charge) => {
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
          })}
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
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  streakBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  pointsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.white,
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
});
