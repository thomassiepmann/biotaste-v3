import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import StarRating from '../components/StarRating';
import EmojiPicker from '../components/EmojiPicker';
import PointsAnimation from '../components/PointsAnimation';
import { Product, Charge } from '../types';

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'Obst': '🍎',
  'Gemüse': '🥦',
  'Kräuter': '🌿',
};

export default function RatingScreen({ route, navigation }: any) {
  const { charge, product }: { charge: Charge; product: Product } = route.params;
  const [userName, setUserName] = useState<string | null>(null);

  const [overallStars, setOverallStars] = useState(0);
  const [tasteEmoji, setTasteEmoji] = useState('');
  const [opticEmoji, setOpticEmoji] = useState('');
  const [textureEmoji, setTextureEmoji] = useState('');
  const [comment, setComment] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userName').then(name => setUserName(name));
  }, []);

  const calculatePoints = () => {
    let points = 15; // Base points
    if (comment.trim().length > 0) points += 5;
    if (hasPhoto) points += 10;
    return points;
  };

  const handleSubmit = () => {
    if (overallStars === 0) {
      alert('Bitte gib eine Sternebewertung ab!');
      return;
    }

    const points = calculatePoints();
    setShowPointsAnimation(true);

    // After animation, navigate back
    setTimeout(() => {
      navigation.goBack();
    }, 2500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Product Info */}
        <View style={styles.productSection}>
          <View style={styles.productEmojiCircle}>
            <Text style={styles.productEmoji}>
              {CATEGORY_EMOJIS[product.category] || '🌱'}
            </Text>
          </View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSupplier}>{product.supplier}</Text>
          <Text style={styles.productCharge}>
            {charge.charge_code} • {new Date(charge.delivery_date).toLocaleDateString('de-DE')}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Overall Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>Gesamteindruck</Text>
          <StarRating value={overallStars} onChange={setOverallStars} />
        </View>

        {/* Emoji Pickers */}
        <View style={styles.emojiSection}>
          <EmojiPicker
            label="Geschmack"
            value={tasteEmoji}
            onChange={setTasteEmoji}
          />
          <EmojiPicker
            label="Optik"
            value={opticEmoji}
            onChange={setOpticEmoji}
          />
          <EmojiPicker
            label="Textur"
            value={textureEmoji}
            onChange={setTextureEmoji}
          />
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>Kurzer Kommentar (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Was ist dir aufgefallen?"
            placeholderTextColor={theme.colors.gray}
            multiline
            numberOfLines={3}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        {/* Photo Button */}
        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => setHasPhoto(!hasPhoto)}
        >
          <Text style={styles.photoEmoji}>📷</Text>
          <Text style={styles.photoText}>
            {hasPhoto ? 'Foto hinzugefügt ✓' : 'Foto hinzufügen'}
          </Text>
        </TouchableOpacity>

        {/* Points Preview */}
        <View style={styles.pointsPreview}>
          <Text style={styles.pointsPreviewText}>
            Du verdienst: +{calculatePoints()} Punkte
          </Text>
        </View>

        {/* Spacer for sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            overallStars === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Abschicken</Text>
        </TouchableOpacity>
      </View>

      {/* Points Animation */}
      <PointsAnimation
        visible={showPointsAnimation}
        points={calculatePoints()}
        onClose={() => setShowPointsAnimation(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayLight,
  },
  backButton: {
    width: 40,
  },
  backArrow: {
    fontSize: 28,
    color: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  productSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  productEmojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  productEmoji: {
    fontSize: 60,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  productSupplier: {
    fontSize: 14,
    color: theme.colors.gray,
    marginBottom: theme.spacing.xs,
  },
  productCharge: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.grayLight,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  ratingSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emojiSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  commentSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  commentInput: {
    backgroundColor: theme.colors.grayLight,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoButton: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  photoText: {
    fontSize: 16,
    color: theme.colors.gray,
    fontWeight: '500',
  },
  pointsPreview: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  pointsPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grayLight,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});
