import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { theme } from '../constants/theme';

export default function NameInputScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setErrorMessage('Bitte gib deinen Namen ein');
      return;
    }

    // Prüfe ob Supabase konfiguriert ist
    if (!isSupabaseConfigured) {
      setErrorMessage('⚠️ Supabase nicht konfiguriert. Bitte .env Datei ausfüllen und App neu starten.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Prüfe ob Name in Supabase existiert (case-insensitive)
      const { data, error } = await supabase
        .from('app_users')
        .select('name')
        .ilike('name', trimmedName)
        .single();

      if (error || !data) {
        setErrorMessage('Name nicht bekannt. Bitte wende dich an den Admin.');
        setIsLoading(false);
        return;
      }

      // Name gefunden - speichere in AsyncStorage
      await AsyncStorage.setItem('userName', data.name);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Error validating name:', error);
      setErrorMessage('Verbindungsfehler. Bitte versuche es erneut.');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header with Paradieschen Logo */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/paradieschen-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Willkommen bei BioTaste! 🌿</Text>
          <Text style={styles.subtitle}>Wer bist du heute?</Text>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errorMessage && styles.inputError,
            ]}
            placeholder="Dein Name, z. B. Max Mustermann"
            placeholderTextColor={theme.colors.gray}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrorMessage('');
            }}
            autoFocus={true}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!isLoading}
          />
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* Button */}
        <TouchableOpacity 
          style={[
            styles.button,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Los geht's!</Text>
          )}
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
  logo: {
    width: 200,
    height: 100,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
  inputError: {
    borderColor: '#e53e3e',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#e53e3e',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: '#e53e3e',
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
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
  buttonDisabled: {
    backgroundColor: theme.colors.gray,
    opacity: 0.6,
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
