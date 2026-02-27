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

const EMOJI_TAGS = {
  geschmack: [
    { id: 'suess', label: '🍬 Süß' },
    { id: 'sauer', label: '🍋 Sauer' },
    { id: 'salzig', label: '🧂 Salzig' },
    { id: 'waessrig', label: '💧 Wässrig' },
    { id: 'aromatisch', label: '🌿 Aromatisch' },
  ],
  zustand: [
    { id: 'frisch', label: '✨ Frisch' },
    { id: 'ueberreif', label: '⚠️ Überreif' },
    { id: 'noch_nicht_reif', label: '🌱 Noch nicht reif' },
    { id: 'matschig', label: '🤢 Matschig' },
  ],
  besonders: [
    { id: 'top_qualitaet', label: '🏆 Top Qualität' },
    { id: 'enttaeuschend', label: '👎 Enttäuschend' },
    { id: 'schaedling', label: '🐛 Schädling' },
  ],
};

export default function RatingScreen({ route, navigation }: any) {
  const { charge, product }: { charge: Charge; product: Product } = route.params;
  const [userName, setUserName] = useState<string | null>(null);

  const [overallStars, setOverallStars] = useState(0);
  const [tasteEmoji, setTasteEmoji] = useState('');
  const [opticEmoji, setOpticEmoji] = useState('');
  const [textureEmoji, setTextureEmoji] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userName').then(name => setUserName(name));
  }, []);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tagId]);
      }
    }
  };

  const calculatePoints = () => {
    let points = 20; // Base points
    // Smileys ausgefüllt
    if (tasteEmoji && opticEmoji && textureEmoji) points += 5;
    // Tags gewählt
    if (selectedTags.length > 0) points += 5;
    // Kommentar geschrieben
    if (comment.trim().length > 0) points += 5;
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

        {/* Emoji Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsSectionTitle}>Geschmack</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
            {EMOJI_TAGS.geschmack.map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag.id) && styles.tagChipSelected,
                ]}
                onPress={() => toggleTag(tag.id)}
              >
                <Text style={[
                  styles.tagChipText,
                  selectedTags.includes(tag.id) && styles.tagChipTextSelected,
                ]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.tagsSectionTitle}>Zustand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
            {EMOJI_TAGS.zustand.map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag.id) && styles.tagChipSelected,
                ]}
                onPress={() => toggleTag(tag.id)}
              >
                <Text style={[
                  styles.tagChipText,
                  selectedTags.includes(tag.id) && styles.tagChipTextSelected,
                ]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.tagsSectionTitle}>Besonders</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
            {EMOJI_TAGS.besonders.map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag.id) && styles.tagChipSelected,
                ]}
                onPress={() => toggleTag(tag.id)}
              >
                <Text style={[
                  styles.tagChipText,
                  selectedTags.includes(tag.id) && styles.tagChipTextSelected,
                ]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>Kurzer Kommentar (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Kurzer Kommentar (optional)..."
            placeholderTextColor={theme.colors.gray}
            multiline
            maxLength={150}
            value={comment}
            onChangeText={setComment}
          />
          <Text style={styles.characterCount}>{comment.length}/150</Text>
        </View>

        {/* Points Preview */}
        <View style={styles.pointsPreview}>
          <Text style={styles.pointsPreviewText}>
            Du bekommst +{calculatePoints()} Punkte
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
  tagsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f855a',
    marginBottom: 8,
    marginTop: 8,
  },
  tagsRow: {
    marginBottom: 8,
  },
  tagChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: '#48bb78',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tagChipSelected: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48bb78',
  },
  tagChipTextSelected: {
    color: theme.colors.white,
  },
  commentSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  commentInput: {
    backgroundColor: theme.colors.grayLight,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'right',
    marginTop: 4,
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
