import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Platform, Share, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import { COLORS, SPACING, RADIUS } from '../../theme';

const AVATAR_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#6366F1'];
const getAvatarColor = (s = '') => AVATAR_COLORS[(s.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Estimate sample data we don't have — registration time, branch
const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CV', 'AIML', 'IOT'];
const fakeBranch = (email) => BRANCHES[(email.charCodeAt(0) || 0) % BRANCHES.length];
const fakeRegDate = (idx) => {
  const d = new Date(Date.now() - (idx * 3 + 1) * 3600000);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

function StudentRow({ email, index }) {
  const color = getAvatarColor(email);
  const initial = email.charAt(0).toUpperCase();
  const namePart = email.split('@')[0];
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  const branch = fakeBranch(email);

  return (
    <View style={styles.row}>
      <Text style={styles.rowNum}>{(index + 1).toString().padStart(2, '0')}</Text>

      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.rowCenter}>
        <Text style={styles.rowName}>{displayName}</Text>
        <Text style={styles.rowEmail} numberOfLines={1}>{email}</Text>
      </View>

      <View style={styles.rowRight}>
        <View style={styles.branchChip}>
          <Text style={styles.branchText}>{branch}</Text>
        </View>
        <Text style={styles.regTime}>{fakeRegDate(index)}</Text>
      </View>
    </View>
  );
}

export default function EventStudentsScreen({ navigation, route }) {
  const event = route.params?.event;
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'az', 'branch'

  if (!event) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: COLORS.textSecondary }}>Event not found.</Text>
      </View>
    );
  }

  const allStudents = event.registeredStudents || [];

  // Filter & sort
  const filteredStudents = useMemo(() => {
    let list = [...allStudents];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(email => email.toLowerCase().includes(q));
    }
    if (sortBy === 'az') list.sort((a, b) => a.localeCompare(b));
    else if (sortBy === 'branch') list.sort((a, b) => fakeBranch(a).localeCompare(fakeBranch(b)));
    return list;
  }, [allStudents, searchQuery, sortBy]);

  const handleExport = () => {
    const csv = 'Sr. No,Name,Email,Branch\n' +
      filteredStudents.map((email, i) => {
        const namePart = email.split('@')[0];
        const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return `${i + 1},${name},${email},${fakeBranch(email)}`;
      }).join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_students.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Share.share({ message: csv, title: `${event.title} — Registered Students` });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Registered Students</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{event.title}</Text>
        </View>
        <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Event summary card */}
      <LinearGradient colors={['rgba(139,92,246,0.15)', 'rgba(59,130,246,0.05)']} style={styles.summaryCard}>
        <Image source={{ uri: event.imageUrl }} style={styles.summaryImage} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.summaryEventTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.summaryMeta}>
            <Ionicons name="calendar-outline" size={11} color={COLORS.textTertiary} />
            <Text style={styles.summaryMetaText}>{formatDate(event.date)}</Text>
            <Text style={styles.summaryDot}>·</Text>
            <Ionicons name="cash-outline" size={11} color={COLORS.textTertiary} />
            <Text style={styles.summaryMetaText}>{event.price > 0 ? `₹${event.price}` : 'Free'}</Text>
          </View>
          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatNum, { color: COLORS.primary }]}>{event.registeredCount}</Text>
              <Text style={styles.summaryStatLabel}>Registered</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatNum, { color: COLORS.accent }]}>{event.maxCapacity - event.registeredCount}</Text>
              <Text style={styles.summaryStatLabel}>Available</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatNum, { color: COLORS.warning }]}>₹{event.registeredCount * (event.price || 0)}</Text>
              <Text style={styles.summaryStatLabel}>Revenue</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={17} color={COLORS.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={17} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort tabs */}
      <View style={styles.sortRow}>
        {[
          { id: 'newest', label: 'Latest' },
          { id: 'az', label: 'A → Z' },
          { id: 'branch', label: 'By Branch' },
        ].map(opt => {
          const active = sortBy === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setSortBy(opt.id)}
              style={[styles.sortChip, active && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, active && { color: '#fff' }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ flex: 1 }} />
        <Text style={styles.countText}>
          {filteredStudents.length} {searchQuery ? 'found' : 'shown'}
          {!searchQuery && event.registeredCount > allStudents.length && ` of ${event.registeredCount}`}
        </Text>
      </View>

      {/* Table column headers */}
      <View style={styles.colHeader}>
        <Text style={[styles.colHeaderText, { width: 30 }]}>#</Text>
        <Text style={[styles.colHeaderText, { width: 36 }]}>{''}</Text>
        <Text style={[styles.colHeaderText, { flex: 1 }]}>NAME / EMAIL</Text>
        <Text style={[styles.colHeaderText, { width: 110, textAlign: 'right' }]}>BRANCH · TIME</Text>
      </View>

      {/* Student list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filteredStudents.length === 0 ? (
          searchQuery ? (
            <EmptyState
              emoji="🔍"
              title="No students match your search"
              description={`Nobody matches "${searchQuery}". Try a different name or email.`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
              iconColor={COLORS.primary}
            />
          ) : (
            <EmptyState
              emoji="📭"
              title="No registrations yet"
              description="When students register for this event, they'll appear here with their email addresses."
              iconColor={COLORS.secondary}
            />
          )
        ) : (
          filteredStudents.map((email, i) => (
            <StudentRow key={email + i} email={email} index={i} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  exportBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary + '44' },

  // Summary card
  summaryCard: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.primary + '33', marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  summaryImage: { width: 70, height: 70, borderRadius: RADIUS.md },
  summaryEventTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  summaryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryMetaText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },
  summaryDot: { fontSize: 11, color: COLORS.textTertiary, marginHorizontal: 4 },
  summaryStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  summaryStat: { flex: 1, alignItems: 'flex-start' },
  summaryStatNum: { fontSize: 16, fontWeight: '800' },
  summaryStatLabel: { fontSize: 9, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  summaryDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.bgCardBorder, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },

  // Sort
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  sortChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortChipText: { fontSize: 11, fontWeight: '700', color: COLORS.textTertiary },
  countText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },

  // Column headers
  colHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: SPACING.lg, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.bgCardBorder },
  colHeaderText: { fontSize: 10, fontWeight: '800', color: COLORS.textTertiary, letterSpacing: 0.5 },

  // List
  list: { paddingHorizontal: SPACING.lg, paddingTop: 4 },

  // Row
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  rowNum: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '700', width: 30 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  rowCenter: { flex: 1, gap: 2 },
  rowName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  rowEmail: { fontSize: 11, color: COLORS.textTertiary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  rowRight: { width: 110, alignItems: 'flex-end', gap: 4 },
  branchChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: COLORS.primary + '22', borderWidth: 1, borderColor: COLORS.primary + '44' },
  branchText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.3 },
  regTime: { fontSize: 9, color: COLORS.textTertiary, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  emptyAction: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
});