import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsAPI } from '../../services/api';
import EventCard from '../../components/EventCard';
import { COLORS, SPACING, RADIUS, CATEGORY_ICONS } from '../../theme';

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Social'];

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  useEffect(() => {
    if (query.length > 1 || category !== 'All') {
      doSearch();
    } else if (query.length === 0 && category === 'All') {
      setResults([]);
      setSearched(false);
    }
  }, [query, category]);

  const doSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await eventsAPI.getAll({ search: query, category });
      setResults(res.events || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search events..."
            placeholderTextColor={COLORS.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={doSearch}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category pills */}
      <View style={styles.catRow}>
        {CATEGORIES.map(cat => {
          const active = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.catPill, active && styles.catPillActive]}
            >
              <Ionicons name={CATEGORY_ICONS[cat] || 'apps-outline'} size={12} color={active ? '#fff' : COLORS.textTertiary} />
              <Text style={[styles.catPillText, active && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            {loading
              ? <Text style={styles.emptyText}>Searching...</Text>
              : searched
                ? <>
                    <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptyText}>Try a different keyword or category</Text>
                  </>
                : <>
                    <Ionicons name="telescope-outline" size={48} color={COLORS.textTertiary} />
                    <Text style={styles.emptyTitle}>Discover Events</Text>
                    <Text style={styles.emptyText}>Search by event name, tag, or select a category above</Text>
                  </>
            }
          </View>
        )}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => { Keyboard.dismiss(); navigation.navigate('EventDetail', { event: item }); }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: 8, paddingBottom: SPACING.md },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catPillText: { fontSize: 12, fontWeight: '600', color: COLORS.textTertiary },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center', paddingHorizontal: 20 },
});
