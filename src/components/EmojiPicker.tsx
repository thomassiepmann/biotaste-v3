import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface EmojiPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const EMOJIS = ['😍', '😊', '😐', '😞'];

export default function EmojiPicker({ label, value, onChange }: EmojiPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.emojiRow}>
        {EMOJIS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => onChange(emoji)}
            style={[
              styles.emojiButton,
              value === emoji && styles.emojiButtonSelected,
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  emoji: {
    fontSize: 24,
  },
});
