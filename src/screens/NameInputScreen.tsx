import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { theme } from '../constants/theme';

type Employee = {
  id: string;
  name: string;
};

export default function NameInputScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [helperMessage, setHelperMessage] = useState('Tippe mindestens 3 Buchstaben.');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setErrorMessage('⚠️ Supabase nicht konfiguriert. Bitte .env Datei ausfüllen und App neu starten.');
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const trimmed = query.trim();

    if (trimmed.length < 3) {
      setEmployees([]);
      setIsSearching(false);
      setErrorMessage('');
      setHelperMessage(trimmed.length === 0 ? 'Tippe mindestens 3 Buchstaben.' : 'Noch etwas genauer suchen (mind. 3 Buchstaben).');
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setErrorMessage('');
      setHelperMessage('Suche läuft...');

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, name')
          .eq('active', true)
          .ilike('name', `%${trimmed}%`)
          .order('name', { ascending: true })
          .limit(10);

        if (error) throw error;

        const rows = (data as Employee[]) || [];
        setEmployees(rows);

        if (rows.length === 0) {
          setHelperMessage('Keine Treffer. Wende dich an den Admin.');
        } else {
          setHelperMessage('Wähle deinen Namen aus der Liste.');
        }
      } catch (error) {
        console.error('Error searching employees:', error);
        setEmployees([]);
        setErrorMessage('Verbindungsfehler bei der Suche. Bitte versuche es erneut.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelectEmployee = async (employee: Employee) => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      await AsyncStorage.setItem('userName', employee.name);
      await AsyncStorage.setItem('userId', employee.id);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Error saving employee:', error);
      setErrorMessage('Fehler beim Anmelden. Bitte versuche es erneut.');
      setIsLoggingIn(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/paradieschen-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Willkommen bei BioTaste! 🌿</Text>
          <Text style={styles.subtitle}>Wer bist du heute?</Text>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setErrorMessage('');
            }}
            placeholder="Name suchen, z. B. Elementar..."
            placeholderTextColor={theme.colors.gray}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoggingIn}
          />
        </View>

        {isSearching || isLoggingIn ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{isLoggingIn ? 'Anmeldung läuft...' : 'Suche...'}</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.helperText}>{helperMessage}</Text>

            {/* Trefferliste */}
            <View style={styles.employeeList}>
              {employees.map((emp) => (
                <TouchableOpacity
                  key={emp.id}
                  style={styles.employeeButton}
                  onPress={() => handleSelectEmployee(emp)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.employeeEmoji}>👤</Text>
                  <Text style={styles.employeeName}>{emp.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Hint */}
        <Text style={styles.hint}>
          Suche deinen Namen über das Feld. Falls du nicht aufgeführt bist, wende dich an den Admin.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
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
  loadingBox: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  searchBox: {
    marginBottom: theme.spacing.md,
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
  errorBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#e53e3e',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  employeeList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  employeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.grayLight,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  employeeEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },
});
