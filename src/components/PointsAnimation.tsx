import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface PointsAnimationProps {
  visible: boolean;
  points: number;
  onClose: () => void;
}

export default function PointsAnimation({ visible, points, onClose }: PointsAnimationProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.points}>+{points} Punkte!</Text>
          <Text style={styles.message}>Danke für deine Bewertung!</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    minWidth: 250,
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  points: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: 16,
    color: theme.colors.gray,
  },
});
