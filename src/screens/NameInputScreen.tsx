import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';

export default function NameInputScreen({ navigation }: any) {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      Alert.alert('Fehler', 'Bitte gib deinen Namen ein');
      return;
    }

    try {
      await AsyncStorage.setItem('userName', trimmedName);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Fehler', 'Name konnte nicht gespeichert werden');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🌿</Text>
          <Text style={styles.title}>Hallo! Wer bist du heute? 🌿</Text>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Dein Name, z. B. Max Mustermann"
            placeholderTextColor={theme.colors.gray}
            value={name}
            onChangeText={setName}
            autoFocus={true}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        {/* Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Los geht's!</Text>
        </TouchableOpacity>

        {/* Hint */}
        <Text style={styles.hint}>
          Dein Name wird nur lokal und für Punktezwecke verwendet. Du kannst ihn jederzeit löschen (Logout).
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 2,
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f855a',
    textAlign: 'center',
    lineHeight: 36,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.grayLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 18,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  button: {
    backgroundColor: '#48bb78',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },
});
