import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Animated, StatusBar, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import EventCard from '../../components/EventCard';
import { COLORS, SPACING, RADIUS, CATEGORY_ICONS } from '../../theme';

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Social'];

// Same color mapping as profile
const AVATAR_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#6366F1'];
function getAvatarColor(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getGenderIcon(gender) {
  if (gender === 'female') return 'woman';
  if (gender === 'male') return 'man';
  return 'person';
}

function StatCard({ label, value, icon, color }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '33' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── PROFILE DROPDOWN MODAL ──────────────────────────────────────────────────
function ProfileModal({ visible, onClose, user, navigation, logout }) {
  const avatarColor = getAvatarColor(user?.name || '');
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const username = user?.username || user?.name?.split(' ')[0]?.toLowerCase() || 'student';

  const QUICK_ACTIONS = [
    { icon: 'calendar-outline', label: 'My Events', color: COLORS.primary, onPress: () => { onClose(); navigation.navigate('MyEvents'); } },
    { icon: 'add-circle-outline', label: 'Create Event', color: COLORS.accent, onPress: () => { onClose(); navigation.navigate('Create'); } },
    { icon: 'notifications-outline', label: 'Notifications', color: COLORS.warning, onPress: () => { onClose(); navigation.navigate('Notifications'); } },
    { icon: 'search-outline', label: 'Search Events', color: COLORS.secondary, onPress: () => { onClose(); navigation.navigate('Search'); } },
    { icon: 'person-outline', label: 'Edit Profile', color: COLORS.info, onPress: () => { onClose(); navigation.navigate('Profile'); } },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
          {/* User Info Block */}
          <View style={styles.modalUserBlock}>
            <View style={[styles.modalAvatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.modalAvatarText}>{initials}</Text>
              <View style={styles.modalGenderDot}>
                <Ionicons name={getGenderIcon(user?.gender)} size={10} color="#fff" />
              </View>
            </View>
            <View style={styles.modalUserInfo}>
              <Text style={styles.modalName}>{user?.name || 'Student'}</Text>
              <Text style={styles.modalUsername}>@{username}</Text>
              <Text style={styles.modalEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Role + Branch badges */}
          <View style={styles.modalBadgeRow}>
            <View style={[styles.modalBadge, { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary + '44' }]}>
              <Ionicons name="school-outline" size={11} color={COLORS.primary} />
              <Text style={[styles.modalBadgeText, { color: COLORS.primary }]}>{user?.role === 'organizer' ? 'Organizer' : 'Student'}</Text>
            </View>
            <View style={styles.modalBadge}>
              <Ionicons name="git-branch-outline" size={11} color={COLORS.textTertiary} />
              <Text style={styles.modalBadgeText}>{user?.branch || 'CSE'} · Sem {user?.semester || 4}</Text>
            </View>
            <View style={styles.modalBadge}>
              <Ionicons name="business-outline" size={11} color={COLORS.textTertiary} />
              <Text style={styles.modalBadgeText}>BMSCE</Text>
            </View>
          </View>

          <View style={styles.modalDivider} />

          {/* Quick Actions */}
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity key={i} style={styles.modalAction} onPress={action.onPress} activeOpacity={0.7}>
              <View style={[styles.modalActionIcon, { backgroundColor: action.color + '22' }]}>
                <Ionicons name={action.icon} size={18} color={action.color} />
              </View>
              <Text style={styles.modalActionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}

          <View style={styles.modalDivider} />

          {/* Sign Out */}
          <TouchableOpacity style={styles.modalSignOut} onPress={() => { onClose(); logout(); }} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
            <Text style={styles.modalSignOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const avatarColor = getAvatarColor(user?.name || '');
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const username = user?.username || user?.name?.split(' ')[0]?.toLowerCase() || 'student';
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const load = useCallback(async (cat = category) => {
    try {
      const res = await eventsAPI.getAll({ category: cat });
      const all = res.events || [];
      setFeatured(all.find(e => e.isFeatured) || all[0]);
      setEvents(all.filter(e => !e.isFeatured));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [category]);
  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={user}
        navigation={navigation}
        logout={logout}
      />

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          {/* Left: Avatar + greeting */}
          <TouchableOpacity style={styles.headerLeft} onPress={() => setProfileModalVisible(true)} activeOpacity={0.8}>
            {/* Avatar circle */}
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
              {/* Gender icon badge */}
              <View style={[styles.genderBadge, { backgroundColor: user?.gender === 'female' ? '#EC4899' : '#3B82F6' }]}>
                <Ionicons name={getGenderIcon(user?.gender)} size={9} color="#fff" />
              </View>
            </View>

            {/* Name + email */}
            <View style={styles.headerTextBlock}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{firstName} <Text style={styles.userNameWave}>👋</Text></Text>
              <View style={styles.userMeta}>
                <Text style={styles.usernameText}>@{username}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.emailText} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Right: notification bell */}
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
            <View style={styles.notifDot} />
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Click hint */}
        <TouchableOpacity onPress={() => setProfileModalVisible(true)} style={styles.profileHint}>
          <Ionicons name="person-circle-outline" size={14} color={COLORS.primary} />
          <Text style={styles.profileHintText}>Tap your avatar for account options</Text>
          <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
          <Text style={styles.searchPlaceholder}>Search events, clubs, tags...</Text>
          <View style={styles.filterBtn}>
            <Ionicons name="options-outline" size={16} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Events Today" value="3" icon="calendar" color={COLORS.primary} />
          <StatCard label="Registered" value={user?.registeredEvents?.length || 2} icon="checkmark-circle" color={COLORS.accent} />
          <StatCard label="This Week" value="8" icon="trending-up" color={COLORS.warning} />
        </View>

        {/* Featured */}
        {featured && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚡ Featured</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: SPACING.lg }}>
              <EventCard event={featured} variant="featured" onPress={() => navigation.navigate('EventDetail', { event: featured })} />
              {events.slice(0, 2).map(e => (
                <EventCard key={e._id} event={e} variant="featured" onPress={() => navigation.navigate('EventDetail', { event: e })} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: SPACING.lg }]}>Browse by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8 }}>
            {CATEGORIES.map(cat => {
              const active = category === cat;
              return (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)} activeOpacity={0.8} style={[styles.catChip, active && styles.catChipActive]}>
                  {active
                    ? <LinearGradient colors={COLORS.gradientPrimary} style={styles.catChipGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Ionicons name={CATEGORY_ICONS[cat] || 'apps-outline'} size={13} color="#fff" />
                        <Text style={[styles.catChipText, { color: '#fff' }]}>{cat}</Text>
                      </LinearGradient>
                    : <>
                        <Ionicons name={CATEGORY_ICONS[cat] || 'apps-outline'} size={13} color={COLORS.textTertiary} />
                        <Text style={styles.catChipText}>{cat}</Text>
                      </>
                  }
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Events List */}
        <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🗓 Upcoming Events</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>{events.length}</Text></View>
          </View>
          {loading
            ? <Text style={styles.loadingText}>Loading events...</Text>
            : events.length === 0
              ? <View style={styles.emptyBox}>
                  <Ionicons name="calendar-outline" size={48} color={COLORS.textTertiary} />
                  <Text style={styles.emptyText}>No events in this category</Text>
                  <TouchableOpacity onPress={() => setCategory('All')}><Text style={styles.emptyAction}>View all events</Text></TouchableOpacity>
                </View>
              : events.map(ev => (
                  <EventCard key={ev._id} event={ev} onPress={() => navigation.navigate('EventDetail', { event: ev })} />
                ))
          }
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  genderBadge: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.bg },
  headerTextBlock: { flex: 1 },
  greeting: { fontSize: 12, color: COLORS.textTertiary },
  userName: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  userNameWave: { fontSize: 18 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1, flexWrap: 'wrap' },
  usernameText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  metaDot: { fontSize: 11, color: COLORS.textTertiary },
  emailText: { fontSize: 11, color: COLORS.textTertiary, flex: 1 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.bgCardBorder, flexShrink: 0 },
  notifDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, zIndex: 1, borderWidth: 1.5, borderColor: COLORS.bg },

  // Profile hint
  profileHint: { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.primary + '11', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.primary + '33' },
  profileHintText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  // Search
  searchBar: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  searchPlaceholder: { flex: 1, color: COLORS.textTertiary, fontSize: 14 },
  filterBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.sm, alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textTertiary, textAlign: 'center' },

  // Sections
  section: { marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  countBadge: { backgroundColor: COLORS.primary + '33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  countBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  catScroll: { marginTop: SPACING.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden' },
  catChipActive: { borderColor: 'transparent' },
  catChipGradient: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8 },
  catChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary, paddingHorizontal: 14, paddingVertical: 8 },
  loadingText: { color: COLORS.textTertiary, textAlign: 'center', paddingVertical: 40 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  emptyAction: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },

  // Profile Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-start', paddingTop: 100, paddingHorizontal: SPACING.lg },
  modalCard: { backgroundColor: '#111130', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  modalUserBlock: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, backgroundColor: 'rgba(139,92,246,0.1)' },
  modalAvatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 },
  modalAvatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  modalGenderDot: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: '#EC4899', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#111130' },
  modalUserInfo: { flex: 1 },
  modalName: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  modalUsername: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  modalEmail: { fontSize: 12, color: COLORS.textTertiary },
  modalBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  modalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  modalBadgeText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },
  modalDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: SPACING.lg },
  modalAction: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 13 },
  modalActionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalActionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  modalSignOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: COLORS.danger + '11' },
  modalSignOutText: { fontSize: 14, fontWeight: '700', color: COLORS.danger },
});