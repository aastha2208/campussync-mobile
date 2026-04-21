import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsAPI } from '../../services/api';
import EventCard from '../../components/EventCard';
import { COLORS, SPACING, RADIUS } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'registered', label: 'Registered', icon: 'checkmark-circle-outline' },
  { id: 'hosted', label: 'Hosting', icon: 'megaphone-outline' },
  { id: 'archived', label: 'Archived', icon: 'archive-outline' },
];

function EmptyState({ tab }) {
  const config = {
    registered: { icon: 'calendar-outline', title: 'No events yet', sub: 'Browse events and register to see them here.' },
    hosted: { icon: 'megaphone-outline', title: 'No hosted events', sub: 'Create your first event to get started!' },
    archived: { icon: 'archive-outline', title: 'Nothing archived', sub: 'Past events will appear here.' },
  }[tab];
  return (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={config.icon} size={40} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>{config.title}</Text>
      <Text style={styles.emptySub}>{config.sub}</Text>
    </View>
  );
}

export default function MyEventsScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('registered');
  const [registered, setRegistered] = useState([]);
  const [hosted, setHosted] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [regRes, hostRes] = await Promise.all([
        eventsAPI.getMyRegistered(),
        eventsAPI.getMyHosted(),
      ]);
      setRegistered(regRes.events || []);
      setHosted(hostRes.events || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const activeData = { registered, hosted, archived: [] }[activeTab];

  const stats = [
    { label: 'Registered', value: registered.length, color: COLORS.primary },
    { label: 'Hosting', value: hosted.length, color: COLORS.accent },
    { label: 'Completed', value: 2, color: COLORS.secondary },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Events</Text>
          <Text style={styles.subtitle}>Track your campus activity</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Create')} style={styles.createBtn}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.createBtnGrad}>
            <Ionicons name="add" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color + '33' }]}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} style={styles.tab} activeOpacity={0.8}>
                <View style={[styles.tabInner, active && styles.tabInnerActive]}>
                  <Ionicons name={tab.icon} size={15} color={active ? '#fff' : COLORS.textTertiary} />
                  <Text style={[styles.tabText, active && { color: '#fff' }]}>{tab.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        <View style={styles.listWrap}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : activeData.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            activeData.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onPress={() => navigation.navigate('EventDetail', { event })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textTertiary, marginTop: 2 },
  createBtn: { width: 44, height: 44, borderRadius: 22 },
  createBtnGrad: { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },
  tabsRow: { flexDirection: 'row', marginHorizontal: SPACING.lg, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: 4, marginBottom: SPACING.md },
  tab: { flex: 1 },
  tabInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: RADIUS.md },
  tabInnerActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textTertiary },
  listWrap: { paddingHorizontal: SPACING.lg },
  loadingText: { color: COLORS.textTertiary, textAlign: 'center', paddingVertical: 30 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center', paddingHorizontal: SPACING.xl },
});
