import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI, CLUBS } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import { COLORS, SPACING, RADIUS } from '../../theme';

const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function EventStatsCard({ event, onPress }) {
  const fillPct = Math.min((event.registeredCount / event.maxCapacity) * 100, 100);
  const fillColor = fillPct > 90 ? COLORS.danger : fillPct > 70 ? COLORS.warning : COLORS.accent;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      {/* Event Header */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={11} color={COLORS.textTertiary} />
            <Text style={styles.cardMetaText}>{formatDate(event.date)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name="cash-outline" size={11} color={COLORS.textTertiary} />
            <Text style={styles.cardMetaText}>{event.price > 0 ? `₹${event.price}` : 'Free'}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBlock}>
          <Text style={[styles.statBig, { color: COLORS.primary }]}>{event.registeredCount}</Text>
          <Text style={styles.statSmall}>Registered</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={[styles.statBig, { color: COLORS.accent }]}>{event.maxCapacity - event.registeredCount}</Text>
          <Text style={styles.statSmall}>Spots Left</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={[styles.statBig, { color: COLORS.warning }]}>₹{event.registeredCount * (event.price || 0)}</Text>
          <Text style={styles.statSmall}>Revenue</Text>
        </View>
      </View>

      {/* Capacity bar */}
      <View style={styles.capacityRow}>
        <View style={styles.capacityBarBg}>
          <LinearGradient
            colors={fillPct > 90 ? [COLORS.danger, COLORS.warning] : [COLORS.primary, COLORS.secondary]}
            style={[styles.capacityFill, { width: `${fillPct}%` }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={[styles.capacityText, { color: fillColor }]}>{Math.round(fillPct)}%</Text>
      </View>

      {/* View students footer */}
      <View style={styles.cardFooter}>
        <Ionicons name="people" size={14} color={COLORS.primary} />
        <Text style={styles.cardFooterText}>View all registered students</Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminStatsScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const adminClub = CLUBS.find(c => c.id === user?.clubId);

  const load = useCallback(async () => {
    try {
      const res = await eventsAPI.getClubEvents(user?.clubId);
      setEvents(res.events || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.clubId]);

  useEffect(() => { load(); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalRegistered = events.reduce((s, e) => s + (e.registeredCount || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + ((e.registeredCount || 0) * (e.price || 0)), 0);
  const totalCapacity = events.reduce((s, e) => s + (e.maxCapacity || 0), 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.textSecondary }}>Admin access only.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSub}>{adminClub?.name || 'Your Club'}</Text>
        </View>
        {adminClub && (
          <View style={[styles.clubIcon, { backgroundColor: adminClub.color + '33' }]}>
            <Ionicons name={adminClub.icon} size={20} color={adminClub.color} />
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { borderColor: COLORS.primary + '44' }]}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.primary + '22' }]}>
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.summaryValue}>{events.length}</Text>
              <Text style={styles.summaryLabel}>Total Events</Text>
            </View>

            <View style={[styles.summaryCard, { borderColor: COLORS.accent + '44' }]}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.accent + '22' }]}>
                <Ionicons name="people" size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.summaryValue}>{totalRegistered}</Text>
              <Text style={styles.summaryLabel}>Registrations</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { borderColor: COLORS.warning + '44' }]}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.warning + '22' }]}>
                <Ionicons name="trending-up" size={18} color={COLORS.warning} />
              </View>
              <Text style={styles.summaryValue}>{fillRate}%</Text>
              <Text style={styles.summaryLabel}>Fill Rate</Text>
            </View>

            <View style={[styles.summaryCard, { borderColor: COLORS.secondary + '44' }]}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.secondary + '22' }]}>
                <Ionicons name="cash" size={18} color={COLORS.secondary} />
              </View>
              <Text style={styles.summaryValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
              <Text style={styles.summaryLabel}>Revenue</Text>
            </View>
          </View>
        </View>

        {/* Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>📋 Event-wise Breakdown</Text>

          {loading
            ? <Text style={styles.loadingText}>Loading...</Text>
            : events.length === 0
              ? <EmptyState
                  emoji="🎯"
                  title="No events yet"
                  description={`Get started by creating your first event for ${adminClub?.name || 'your club'}. Students will be notified instantly.`}
                  actionLabel="Create First Event"
                  onAction={() => navigation.navigate('Create')}
                  iconColor={adminClub?.color || COLORS.primary}
                />
              : events.map(event => (
                  <EventStatsCard
                    key={event._id}
                    event={event}
                    onPress={() => navigation.navigate('EventStudents', { event })}
                  />
                ))
          }
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  clubIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  summarySection: { padding: SPACING.lg, gap: SPACING.sm },
  summaryGrid: { flexDirection: 'row', gap: SPACING.sm },
  summaryCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, gap: 6 },
  summaryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  summaryLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },

  eventsSection: { paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
  loadingText: { color: COLORS.textTertiary, textAlign: 'center', paddingVertical: 30 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  emptyAction: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginTop: 4 },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, marginBottom: SPACING.md, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: 12 },
  cardImage: { width: 60, height: 60, borderRadius: RADIUS.md },
  cardHeaderText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },
  metaDot: { fontSize: 11, color: COLORS.textTertiary, marginHorizontal: 4 },

  statsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  statBlock: { flex: 1, alignItems: 'center', gap: 2 },
  statBig: { fontSize: 18, fontWeight: '800' },
  statSmall: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600' },
  statDivider: { width: 1, height: 24, backgroundColor: COLORS.bgCardBorder },

  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  capacityBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  capacityFill: { height: '100%', borderRadius: 3 },
  capacityText: { fontSize: 11, fontWeight: '700', minWidth: 32, textAlign: 'right' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, backgroundColor: COLORS.primary + '15', borderTopWidth: 1, borderTopColor: COLORS.primary + '22' },
  cardFooterText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});