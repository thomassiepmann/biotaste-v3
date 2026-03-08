import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';

type AdminTab = 'employees' | 'articles' | 'ratings';

type Employee = {
  id: string;
  name: string;
};

type Article = {
  id: string;
  name: string;
  category?: string | null;
  supplier?: string | null;
};

type RatingRow = {
  id: string;
  user_id: string | null;
  charge_id: string | null;
  overall_stars: number | null;
  comment: string | null;
  created_at: string | null;
};

export default function AdminScreen() {
  const [tab, setTab] = useState<AdminTab>('employees');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [articleTable, setArticleTable] = useState<'articles' | 'products'>('products');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeName, setEmployeeName] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [articleName, setArticleName] = useState('');
  const [articleCategory, setArticleCategory] = useState('');
  const [articleSupplier, setArticleSupplier] = useState('');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [chargeMap, setChargeMap] = useState<Record<string, { charge_code?: string; product_id?: string }>>({});
  const [productMap, setProductMap] = useState<Record<string, { name?: string }>>({});
  const [ratingNameFilter, setRatingNameFilter] = useState('');
  const [ratingMinStars, setRatingMinStars] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const employeeNameById = useMemo(() => {
    return employees.reduce<Record<string, string>>((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  }, [employees]);

  const filteredRatings = useMemo(() => {
    return ratings.filter((row) => {
      const minStars = Number(ratingMinStars || 0);
      const starsOk = !minStars || (row.overall_stars || 0) >= minStars;

      const employeeName = row.user_id ? employeeNameById[row.user_id] || '' : '';
      const searchValue = `${employeeName} ${row.comment || ''}`.toLowerCase();
      const textOk = !ratingNameFilter.trim() || searchValue.includes(ratingNameFilter.trim().toLowerCase());

      return starsOk && textOk;
    });
  }, [ratings, ratingMinStars, ratingNameFilter, employeeNameById]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await Promise.all([
        detectAndLoadArticles(),
        loadEmployees(),
        loadRatingsAndRelations(),
      ]);
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden der Admin-Daten.');
    } finally {
      setLoading(false);
    }
  };

  const detectAndLoadArticles = async () => {
    const tryArticles = await supabase.from('articles').select('id,name').limit(1);
    const selectedTable = tryArticles.error ? 'products' : 'articles';
    setArticleTable(selectedTable);

    const { data, error: loadError } = await supabase
      .from(selectedTable)
      .select('id,name,category,supplier')
      .order('name', { ascending: true });

    if (loadError) throw loadError;
    setArticles((data as Article[]) || []);
  };

  const loadEmployees = async () => {
    const { data, error: e } = await supabase
      .from('employees')
      .select('id,name')
      .order('name', { ascending: true });

    if (e) throw e;
    setEmployees((data as Employee[]) || []);
  };

  const loadRatingsAndRelations = async () => {
    const [{ data: ratingData, error: ratingError }, { data: chargeData, error: chargeError }, { data: productData, error: productError }] = await Promise.all([
      supabase
        .from('ratings')
        .select('id,user_id,charge_id,overall_stars,comment,created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('charges').select('id,charge_code,product_id'),
      supabase.from('products').select('id,name'),
    ]);

    if (ratingError) throw ratingError;
    if (chargeError) throw chargeError;
    if (productError) throw productError;

    const cMap: Record<string, { charge_code?: string; product_id?: string }> = {};
    (chargeData || []).forEach((c: any) => {
      cMap[c.id] = { charge_code: c.charge_code, product_id: c.product_id };
    });

    const pMap: Record<string, { name?: string }> = {};
    (productData || []).forEach((p: any) => {
      pMap[p.id] = { name: p.name };
    });

    setChargeMap(cMap);
    setProductMap(pMap);
    setRatings((ratingData as RatingRow[]) || []);
  };

  const saveEmployee = async () => {
    const trimmed = employeeName.trim();
    if (!trimmed) return setError('Bitte Mitarbeitername eingeben.');

    setActionLoading(true);
    setError('');
    setInfo('');
    try {
      if (editingEmployeeId) {
        const { error: e } = await supabase.from('employees').update({ name: trimmed }).eq('id', editingEmployeeId);
        if (e) throw e;
        setInfo('Mitarbeiter aktualisiert.');
      } else {
        const { error: e } = await supabase.from('employees').insert({ name: trimmed });
        if (e) throw e;
        setInfo('Mitarbeiter hinzugefügt.');
      }
      setEmployeeName('');
      setEditingEmployeeId(null);
      await loadEmployees();
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Speichern des Mitarbeiters.');
    } finally {
      setActionLoading(false);
    }
  };

  const editEmployee = (item: Employee) => {
    setEditingEmployeeId(item.id);
    setEmployeeName(item.name);
    setError('');
    setInfo('Bearbeitungsmodus aktiv.');
  };

  const deleteEmployee = async (id: string) => {
    setActionLoading(true);
    setError('');
    setInfo('');
    try {
      const { error: e } = await supabase.from('employees').delete().eq('id', id);
      if (e) throw e;
      setInfo('Mitarbeiter gelöscht.');
      await loadEmployees();
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Löschen.');
    } finally {
      setActionLoading(false);
    }
  };

  const saveArticle = async () => {
    const trimmedName = articleName.trim();
    if (!trimmedName) return setError('Bitte Artikelnamen eingeben.');

    const payload = {
      name: trimmedName,
      category: articleCategory.trim() || null,
      supplier: articleSupplier.trim() || null,
    };

    setActionLoading(true);
    setError('');
    setInfo('');
    try {
      if (editingArticleId) {
        const { error: e } = await supabase.from(articleTable).update(payload).eq('id', editingArticleId);
        if (e) throw e;
        setInfo('Artikel aktualisiert.');
      } else {
        const { error: e } = await supabase.from(articleTable).insert(payload);
        if (e) throw e;
        setInfo('Artikel hinzugefügt.');
      }
      setEditingArticleId(null);
      setArticleName('');
      setArticleCategory('');
      setArticleSupplier('');
      await detectAndLoadArticles();
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Speichern des Artikels.');
    } finally {
      setActionLoading(false);
    }
  };

  const editArticle = (item: Article) => {
    setEditingArticleId(item.id);
    setArticleName(item.name || '');
    setArticleCategory(item.category || '');
    setArticleSupplier(item.supplier || '');
    setError('');
    setInfo('Bearbeitungsmodus aktiv.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Admin-Daten werden geladen…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin Panel</Text>
      <Text style={styles.subtitle}>Route: /admin</Text>

      <View style={styles.tabRow}>
        <TabButton title="Mitarbeiter" active={tab === 'employees'} onPress={() => setTab('employees')} />
        <TabButton title="Artikel" active={tab === 'articles'} onPress={() => setTab('articles')} />
        <TabButton title="Auswertung" active={tab === 'ratings'} onPress={() => setTab('ratings')} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      {tab === 'employees' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>employees: anzeigen / hinzufügen / bearbeiten / löschen</Text>
          <TextInput
            style={styles.input}
            placeholder="Mitarbeitername"
            value={employeeName}
            onChangeText={setEmployeeName}
          />
          <TouchableOpacity style={styles.button} onPress={saveEmployee} disabled={actionLoading}>
            <Text style={styles.buttonText}>{editingEmployeeId ? 'Mitarbeiter speichern' : 'Mitarbeiter hinzufügen'}</Text>
          </TouchableOpacity>

          {employees.map((emp) => (
            <View key={emp.id} style={styles.rowItem}>
              <Text style={styles.rowTitle}>{emp.name}</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.smallButton} onPress={() => editEmployee(emp)}>
                  <Text style={styles.smallButtonText}>Bearbeiten</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallButton, styles.danger]} onPress={() => deleteEmployee(emp.id)}>
                  <Text style={styles.smallButtonText}>Löschen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'articles' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Artikel-Tabelle: {articleTable}</Text>
          <TextInput style={styles.input} placeholder="Artikelname" value={articleName} onChangeText={setArticleName} />
          <TextInput style={styles.input} placeholder="Kategorie" value={articleCategory} onChangeText={setArticleCategory} />
          <TextInput style={styles.input} placeholder="Lieferant" value={articleSupplier} onChangeText={setArticleSupplier} />

          <TouchableOpacity style={styles.button} onPress={saveArticle} disabled={actionLoading}>
            <Text style={styles.buttonText}>{editingArticleId ? 'Artikel speichern' : 'Artikel hinzufügen'}</Text>
          </TouchableOpacity>

          {articles.map((a) => (
            <View key={a.id} style={styles.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{a.name}</Text>
                <Text style={styles.rowSub}>{a.category || '-'} · {a.supplier || '-'}</Text>
              </View>
              <TouchableOpacity style={styles.smallButton} onPress={() => editArticle(a)}>
                <Text style={styles.smallButtonText}>Bearbeiten</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'ratings' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bewertungen / Auswertungen mit Filtern</Text>
          <TextInput
            style={styles.input}
            placeholder="Filter: Mitarbeitername oder Kommentar"
            value={ratingNameFilter}
            onChangeText={setRatingNameFilter}
          />
          <TextInput
            style={styles.input}
            placeholder="Mindest-Sterne (1-5)"
            keyboardType="numeric"
            value={ratingMinStars}
            onChangeText={setRatingMinStars}
          />

          <Text style={styles.rowSub}>Treffer: {filteredRatings.length}</Text>

          {filteredRatings.map((r) => {
            const charge = r.charge_id ? chargeMap[r.charge_id] : undefined;
            const product = charge?.product_id ? productMap[charge.product_id] : undefined;
            const employeeName = r.user_id ? employeeNameById[r.user_id] || r.user_id : 'unbekannt';

            return (
              <View key={r.id} style={styles.ratingItem}>
                <Text style={styles.rowTitle}>{employeeName} · ⭐ {r.overall_stars ?? '-'}</Text>
                <Text style={styles.rowSub}>Charge: {charge?.charge_code || '-'}</Text>
                <Text style={styles.rowSub}>Artikel: {product?.name || '-'}</Text>
                <Text style={styles.rowSub}>Kommentar: {r.comment || '-'}</Text>
                <Text style={styles.rowSub}>Zeit: {r.created_at || '-'}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

function TabButton({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grayLight,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 56,
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#EEE',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E7E7E7',
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  rowItem: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  rowSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#E8F3EA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  danger: {
    backgroundColor: '#FFE1E1',
  },
  ratingItem: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingVertical: 10,
  },
  error: {
    color: '#C92A2A',
    marginBottom: 8,
  },
  info: {
    color: '#2B8A3E',
    marginBottom: 8,
  },
});
