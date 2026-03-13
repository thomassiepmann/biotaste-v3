import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { theme } from '../constants/theme';

type UserSuggestion = {
  id: string;
  name: string;
};

const normalizeSearchInput = (value: string) =>
  value
    .trim()
    .replace(/[^A-Za-z0-9äöüÄÖÜß\s-]/g, '')
    .replace(/\s+/g, ' ');

export default function NameInputScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);

  useEffect(() => {
    const searchTerm = normalizeSearchInput(name);

    if (searchTerm.length < 3 || !isSupabaseConfigured) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);

      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .eq('active', true)
        .ilike('name', `${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(5);

      if (error) {
        setSuggestions([]);
        setSelectedUser(null);
        setErrorMessage('Namenssuche momentan nicht verfügbar. Bitte versuche es erneut.');
        setIsSearching(false);
        return;
      }

      const matches = data ?? [];

      // Automatische Namensauswahl, sobald nach 3+ Buchstaben genau 1 Treffer existiert
      if (matches.length === 1) {
        const user = matches[0];
        setSelectedUser(user);
        setSuggestions(matches);

        if (searchTerm.toLowerCase() !== user.name.trim().toLowerCase()) {
          setName(user.name);
        }
      } else {
        setSelectedUser(null);
        setSuggestions(matches);
      }

      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [name]);

  const selectUser = (user: UserSuggestion) => {
    setName(user.name);
    setSelectedUser(user);
    setSuggestions([]);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const normalizedName = normalizeSearchInput(name);
    
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
      // Nutze vorausgewählten Namen falls vorhanden
      let resolvedUser: UserSuggestion | null = selectedUser;

      if (!resolvedUser) {
        // 1) Prefix-Suche und dann exakten Match bevorzugen
        const { data: prefixData, error: prefixError } = await supabase
          .from('employees')
          .select('id, name')
          .eq('active', true)
          .ilike('name', `${normalizedName}%`)
          .order('name', { ascending: true })
          .limit(20);

        if (prefixError) {
          console.error('Name lookup failed:', prefixError);
          setErrorMessage('Namenssuche fehlgeschlagen. Bitte später erneut versuchen.');
          setIsLoading(false);
          return;
        }

        const matches = prefixData ?? [];

        if (matches.length === 1) {
          resolvedUser = matches[0];
          setName(matches[0].name);
          setSelectedUser(matches[0]);
        } else if (matches.length > 1) {
          const exactMatch = matches.find(
            (user) => user.name.trim().toLowerCase() === normalizedName.toLowerCase()
          );

          if (exactMatch) {
            resolvedUser = exactMatch;
            setSelectedUser(exactMatch);
          } else {
            setSuggestions(matches.slice(0, 5));
            setErrorMessage('Mehrere Namen gefunden – bitte aus der Liste auswählen.');
            setIsLoading(false);
            return;
          }
        }
      }

      if (!resolvedUser) {
        setErrorMessage('Name nicht bekannt. Bitte wende dich an den Admin.');
        setIsLoading(false);
        return;
      }

      // Name gefunden - speichere in AsyncStorage
      await AsyncStorage.setItem('userName', resolvedUser.name);
      await AsyncStorage.setItem('userId', resolvedUser.id);
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
          <Text style={styles.subtitle}>Mitarbeiter-Login</Text>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errorMessage && styles.inputError,
            ]}
            placeholder="Name eingeben (min. 3 Buchstaben)"
            placeholderTextColor={theme.colors.gray}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setSelectedUser(null);
              setErrorMessage('');
            }}
            autoFocus={true}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!isLoading}
          />

          {isSearching ? (
            <Text style={styles.searchHint}>Suche Namen…</Text>
          ) : null}

          {suggestions.length > 0 ? (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.suggestionItem}
                  onPress={() => selectUser(user)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{user.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {selectedUser ? (
            <Text style={styles.searchHint}>✅ Name automatisch ausgewählt</Text>
          ) : null}

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
          Gib die ersten 3 Buchstaben deines Namens ein.
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
  searchHint: {
    marginTop: theme.spacing.sm,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  suggestionsContainer: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.grayLight,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  suggestionText: {
    fontSize: 16,
    color: theme.colors.text,
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
