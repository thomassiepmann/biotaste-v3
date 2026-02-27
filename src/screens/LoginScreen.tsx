import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { theme } from '../constants/theme';
import { DUMMY_USERS } from '../data/dummyData';
import { User } from '../types';

const USER_AVATARS: { [key: string]: string } = {
  'Anna': '👩',
  'Ben': '👨',
  'Clara': '👩‍🦱',
  'David': '👨‍🦰',
};

export default function LoginScreen({ navigation }: any) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setPin('');
  };

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === selectedUser?.pin) {
            navigation.navigate('MainTabs', { user: selectedUser });
            setSelectedUser(null);
            setPin('');
          } else {
            // Wrong PIN - shake animation
            Animated.sequence([
              Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
              Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
              Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
              Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
            setTimeout(() => setPin(''), 500);
          }
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🌿</Text>
        <Text style={styles.headerTitle}>BioTaste</Text>
        <Text style={styles.headerSubtitle}>Wer bist du?</Text>
      </View>

      {/* User Grid */}
      <View style={styles.userGrid}>
        {DUMMY_USERS.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => handleUserSelect(user)}
          >
            <Text style={styles.userAvatar}>{USER_AVATARS[user.name] || '👤'}</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PIN Modal */}
      <Modal
        visible={selectedUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedUser?.name}</Text>
            
            {/* PIN Dots */}
            <Animated.View 
              style={[
                styles.pinDots,
                { transform: [{ translateX: shakeAnimation }] },
                pin.length === 4 && pin !== selectedUser?.pin && styles.pinDotsError
              ]}
            >
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    i < pin.length && styles.pinDotFilled,
                  ]}
                />
              ))}
            </Animated.View>

            {/* Number Pad */}
            <View style={styles.numberPad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handlePinPress(num.toString())}
                >
                  <Text style={styles.numberText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.numberButton} />
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => handlePinPress('0')}
              >
                <Text style={styles.numberText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteText}>⌫</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSelectedUser(null);
                setPin('');
              }}
            >
              <Text style={styles.cancelText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    backgroundColor: theme.colors.primary,
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  headerEmoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  userGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    alignContent: 'flex-start',
  },
  userCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userAvatar: {
    fontSize: 60,
    marginBottom: theme.spacing.sm,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  pinDotsError: {
    backgroundColor: theme.colors.red + '20',
    borderRadius: 20,
    paddingVertical: 8,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.gray,
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  numberButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  numberText: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
  },
  deleteText: {
    fontSize: 28,
    color: theme.colors.gray,
  },
  cancelButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  cancelText: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});
