import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Animated, StatusBar, Modal, Pressable, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI, CLUBS } from '../../services/api';
import EventCard from '../../components/EventCard';
import CalendarView from '../../components/CalendarView';
import EmptyState from '../../components/EmptyState';
import { COLORS, SPACING, RADIUS, CATEGORY_ICONS } from '../../theme';

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Social'];

const SORT_OPTIONS = [
  { id: 'date', label: 'Date (earliest first)', icon: 'calendar-outline' },
  { id: 'club', label: 'Club (A → Z)', icon: 'people-circle-outline' },
  { id: 'points', label: 'Activity Points (high → low)', icon: 'star-outline' },
  { id: 'newest', label: 'Newest first', icon: 'sparkles-outline' },
];

const AVATAR_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#6366F1'];
const getAvatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getGenderIcon = (g) => g === 'female' ? 'woman' : g === 'male' ? 'man' : 'person';

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

// ─── Profile Dropdown ────────────────────────────────────────────────────────
function ProfileModal({ visible, onClose, user, navigation, logout }) {
  const avatarColor = getAvatarColor(user?.name || '');
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const username = user?.username || user?.name?.split(' ')[0]?.toLowerCase() || 'student';

  const QUICK_ACTIONS = user?.isAdmin
    ? [
        { icon: 'add-circle-outline', label: 'Create Event', color: COLORS.accent, onPress: () => { onClose(); navigation.navigate('Create'); } },
        { icon: 'stats-chart-outline', label: 'View Statistics', color: COLORS.warning, onPress: () => { onClose(); navigation.navigate('AdminStats'); } },
        { icon: 'list-outline', label: 'My Hosted Events', color: COLORS.primary, onPress: () => { onClose(); navigation.navigate('MyEvents'); } },
        { icon: 'notifications-outline', label: 'Notifications', color: COLORS.info, onPress: () => { onClose(); navigation.navigate('Notifications'); } },
        { icon: 'search-outline', label: 'Search Events', color: COLORS.secondary, onPress: () => { onClose(); navigation.navigate('Search'); } },
      ]
    : [
        { icon: 'calendar-outline', label: 'My Events', color: COLORS.primary, onPress: () => { onClose(); navigation.navigate('MyEvents'); } },
        { icon: 'star-outline', label: `My Points: ${user?.activityPoints || 0}`, color: COLORS.warning, onPress: () => onClose() },
        { icon: 'notifications-outline', label: 'Notifications', color: COLORS.accent, onPress: () => { onClose(); navigation.navigate('Notifications'); } },
        { icon: 'search-outline', label: 'Search Events', color: COLORS.secondary, onPress: () => { onClose(); navigation.navigate('Search'); } },
        { icon: 'person-outline', label: 'Edit Profile', color: COLORS.info, onPress: () => { onClose(); navigation.navigate('Profile'); } },
      ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
          <View style={styles.modalUserBlock}>
            <View style={[styles.modalAvatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.modalAvatarText}>{initials}</Text>
              <View style={styles.modalGenderDot}>
                <Ionicons name={getGenderIcon(user?.gender)} size={10} color="#fff" />
              </View>
            </View>
            <View style={styles.modalUserInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.modalName}>{user?.name || 'Student'}</Text>
                {user?.isAdmin && <Ionicons name="shield-checkmark" size={14} color={COLORS.warning} />}
              </View>
              <Text style={styles.modalUsername}>@{username}</Text>
              <Text style={styles.modalEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.modalBadgeRow}>
            <View style={[styles.modalBadge, { backgroundColor: (user?.isAdmin ? COLORS.warning : COLORS.primary) + '22', borderColor: (user?.isAdmin ? COLORS.warning : COLORS.primary) + '44' }]}>
              <Ionicons name={user?.isAdmin ? 'shield-checkmark-outline' : 'school-outline'} size={11} color={user?.isAdmin ? COLORS.warning : COLORS.primary} />
              <Text style={[styles.modalBadgeText, { color: user?.isAdmin ? COLORS.warning : COLORS.primary }]}>
                {user?.isAdmin ? 'Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
              </Text>
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

          {QUICK_ACTIONS.map((a, i) => (
            <TouchableOpacity key={i} style={styles.modalAction} onPress={a.onPress} activeOpacity={0.7}>
              <View style={[styles.modalActionIcon, { backgroundColor: a.color + '22' }]}>
                <Ionicons name={a.icon} size={18} color={a.color} />
              </View>
              <Text style={styles.modalActionLabel}>{a.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}

          <View style={styles.modalDivider} />

          <TouchableOpacity style={styles.modalSignOut} onPress={() => { onClose(); logout(); }} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
            <Text style={styles.modalSignOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Filter & Sort Modal ─────────────────────────────────────────────────────
function FilterModal({ visible, onClose, sortBy, setSortBy, club, setClub }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.filterOverlay} onPress={onClose}>
        <Pressable style={styles.filterSheet} onPress={e => e.stopPropagation()}>
          <View style={styles.filterHandle} />
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>🎯 Sort & Filter</Text>
            <TouchableOpacity onPress={() => { setSortBy('date'); setClub('All'); }}>
              <Text style={styles.filterReset}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map(opt => {
              const active = sortBy === opt.id;
              return (
                <TouchableOpacity key={opt.id} style={[styles.filterRow, active && styles.filterRowActive]} onPress={() => setSortBy(opt.id)} activeOpacity={0.7}>
                  <Ionicons name={opt.icon} size={18} color={active ? COLORS.primary : COLORS.textTertiary} />
                  <Text style={[styles.filterRowText, active && { color: COLORS.primary, fontWeight: '700' }]}>{opt.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.filterSectionTitle, { marginTop: 20 }]}>Filter by Club</Text>
            <View style={styles.clubGrid}>
              {/* "All" first, then each club */}
              <TouchableOpacity
                key="All"
                onPress={() => setClub('All')}
                style={[styles.clubChip, club === 'All' && styles.clubChipActive]}
              >
                <Text style={[styles.clubChipText, club === 'All' && { color: '#fff' }]}>All</Text>
              </TouchableOpacity>
              {CLUBS.map(c => {
                const active = club === c.name;
                return (
                  <TouchableOpacity key={c.id} onPress={() => setClub(c.name)} style={[styles.clubChip, active && styles.clubChipActive]}>
                    <Ionicons name={c.icon} size={12} color={active ? '#fff' : c.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.clubChipText, active && { color: '#fff' }]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.applyBtn} activeOpacity={0.85}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.applyBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </LinearGradient>
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
  const [reminders, setReminders] = useState([]);
  const [category, setCategory] = useState('All');
  const [club, setClub] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [allEventsForSearch, setAllEventsForSearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
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

  const load = useCallback(async () => {
    try {
      const res = await eventsAPI.getAll({ category, club, sortBy, search: searchQuery });
      let all = res.events || [];

      // CLUB SCOPING: Admins only see events from their own club
      if (user?.isAdmin && user?.clubName) {
        all = all.filter(e => e.club === user.clubName);
      }

      setFeatured(all.find(e => e.isFeatured) || all[0]);
      setEvents(all.filter(e => !e.isFeatured));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, club, sortBy, searchQuery, user?.isAdmin, user?.clubName]);

  useEffect(() => { load(); }, [category, club, sortBy, searchQuery]);

  // Fetch all events once for suggestions
  useEffect(() => {
    eventsAPI.getAll({}).then(res => setAllEventsForSearch(res.events || []));
  }, []);

  // STUDENT REMINDERS: fetch all events independently (ignore filters)
  useEffect(() => {
    if (user?.isAdmin) { setReminders([]); return; }
    const registeredIds = user?.registeredEvents || [];
    if (registeredIds.length === 0) { setReminders([]); return; }

    // Fetch all events without filters
    eventsAPI.getAll({}).then(res => {
      const allEvents = res.events || [];
      const now = Date.now();
      const upcoming = allEvents.filter(e => {
        if (!registeredIds.includes(e._id)) return false;
        const eventTime = new Date(e.date).getTime();
        const hoursUntil = (eventTime - now) / 3600000;
        return hoursUntil > 0 && hoursUntil <= 336; // within 14 days
      });
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      setReminders(upcoming);
    });
  }, [user?.registeredEvents, user?.isAdmin, refreshing]);

  // Reload events every time Home screen comes back into focus (e.g. after deleting)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );
  const onRefresh = () => { setRefreshing(true); load(); };

  const filtersActive = club !== 'All' || sortBy !== 'date';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <ProfileModal visible={profileModalVisible} onClose={() => setProfileModalVisible(false)} user={user} navigation={navigation} logout={logout} />
      <FilterModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} sortBy={sortBy} setSortBy={setSortBy} club={club} setClub={setClub} />

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => setProfileModalVisible(true)} activeOpacity={0.8}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
              <View style={[styles.genderBadge, { backgroundColor: user?.isAdmin ? COLORS.warning : (user?.gender === 'female' ? '#EC4899' : '#3B82F6') }]}>
                <Ionicons name={user?.isAdmin ? 'shield-checkmark' : getGenderIcon(user?.gender)} size={9} color="#fff" />
              </View>
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.userName}>{firstName}</Text>
                <Text style={styles.userNameWave}>{user?.isAdmin ? '🛡️' : '👋'}</Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={styles.usernameText}>@{username}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.emailText} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
            <View style={styles.notifDot} />
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search bar — tap opens fullscreen search modal */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSearchActive(true)}
          style={[styles.searchBar, searchActive && styles.searchBarActive]}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
          <View style={{ flex: 1 }}>
            {searchQuery
              ? <Text style={[styles.searchInput, { paddingVertical: 0 }]} numberOfLines={1}>{searchQuery}</Text>
              : <Text style={styles.searchPlaceholder}>Search events, clubs, tags...</Text>
            }
          </View>
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation && e.stopPropagation(); setFilterModalVisible(true); }}
              style={[styles.filterBtn, filtersActive && styles.filterBtnActive]}
            >
              <Ionicons name="options-outline" size={16} color={filtersActive ? '#fff' : COLORS.primary} />
              {filtersActive && <View style={styles.filterBtnDot} />}
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Fullscreen search modal */}
        <Modal visible={searchActive} animationType="slide" transparent={false} onRequestClose={() => setSearchActive(false)}>
          <View style={[styles.searchModal, { paddingTop: insets.top }]}>
            <View style={styles.searchModalHeader}>
              <TouchableOpacity onPress={() => setSearchActive(false)} style={styles.searchModalBack}>
                <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <View style={[styles.searchBar, styles.searchBarActive, { flex: 1, marginHorizontal: 0, marginBottom: 0 }]}>
                <Ionicons name="search-outline" size={18} color={COLORS.primary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events, clubs, tags..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  onSubmitEditing={() => {
                    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
                      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
                    }
                    setSearchActive(false);
                  }}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {searchQuery.length === 0 ? (
                <>
                  {recentSearches.length > 0 && (
                    <>
                      <View style={styles.suggestionHeader}>
                        <Ionicons name="time-outline" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.suggestionHeaderText}>Recent</Text>
                        <TouchableOpacity onPress={() => setRecentSearches([])} style={{ marginLeft: 'auto' }}>
                          <Text style={styles.clearAllText}>Clear</Text>
                        </TouchableOpacity>
                      </View>
                      {recentSearches.map((s, i) => (
                        <TouchableOpacity key={i} style={styles.suggestionRow} onPress={() => { setSearchQuery(s); setSearchActive(false); }}>
                          <Ionicons name="time-outline" size={15} color={COLORS.textTertiary} />
                          <Text style={styles.suggestionText}>{s}</Text>
                          <Ionicons name="arrow-up-back-outline" size={14} color={COLORS.textTertiary} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  <View style={styles.suggestionHeader}>
                    <Ionicons name="flash-outline" size={12} color={COLORS.textTertiary} />
                    <Text style={styles.suggestionHeaderText}>Quick filters</Text>
                  </View>
                  <View style={styles.quickFilters}>
                    {['Free', 'This Week', 'Tech', 'Cultural', 'Sports'].map(qf => (
                      <TouchableOpacity key={qf} style={styles.quickFilterChip} onPress={() => { setSearchQuery(qf.toLowerCase()); setSearchActive(false); }}>
                        <Text style={styles.quickFilterText}>{qf}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {allEventsForSearch.length > 0 && (
                    <>
                      <View style={styles.suggestionHeader}>
                        <Ionicons name="trending-up-outline" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.suggestionHeaderText}>Popular events</Text>
                      </View>
                      {allEventsForSearch
                        .slice()
                        .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
                        .slice(0, 3)
                        .map(ev => (
                          <TouchableOpacity key={ev._id} style={styles.suggestionRow} onPress={() => { setSearchActive(false); navigation.navigate('EventDetail', { event: ev }); }}>
                            <View style={styles.suggestionEventIcon}>
                              <Ionicons name="flame" size={13} color={COLORS.warning} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.suggestionText} numberOfLines={1}>{ev.title}</Text>
                              <Text style={styles.suggestionSub}>{ev.club} · {ev.registeredCount} registered</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={14} color={COLORS.textTertiary} />
                          </TouchableOpacity>
                        ))}
                    </>
                  )}
                </>
              ) : (
                (() => {
                  const q = searchQuery.toLowerCase();
                  const matches = allEventsForSearch.filter(e =>
                    e.title.toLowerCase().includes(q) ||
                    e.description.toLowerCase().includes(q) ||
                    e.club.toLowerCase().includes(q) ||
                    e.tags.some(t => t.toLowerCase().includes(q)) ||
                    e.category.toLowerCase().includes(q)
                  ).slice(0, 8);

                  if (matches.length === 0) {
                    return (
                      <View style={styles.noSuggestion}>
                        <Ionicons name="search-outline" size={32} color={COLORS.textTertiary} />
                        <Text style={styles.noSuggestionText}>No events found for "{searchQuery}"</Text>
                        <Text style={styles.noSuggestionHint}>Try different keywords</Text>
                      </View>
                    );
                  }

                  return (
                    <>
                      <View style={styles.suggestionHeader}>
                        <Ionicons name="search-outline" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.suggestionHeaderText}>{matches.length} match{matches.length > 1 ? 'es' : ''}</Text>
                      </View>
                      {matches.map(ev => (
                        <TouchableOpacity key={ev._id} style={styles.suggestionRow} onPress={() => {
                          setSearchActive(false);
                          if (!recentSearches.includes(searchQuery.trim())) {
                            setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
                          }
                          navigation.navigate('EventDetail', { event: ev });
                        }}>
                          <View style={[styles.suggestionEventIcon, { backgroundColor: COLORS.primary + '22' }]}>
                            <Ionicons name="calendar" size={13} color={COLORS.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.suggestionText} numberOfLines={1}>{ev.title}</Text>
                            <Text style={styles.suggestionSub} numberOfLines={1}>{ev.club} · {ev.category}</Text>
                          </View>
                          <Ionicons name="arrow-forward" size={14} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                      ))}
                    </>
                  );
                })()
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* Active filters display */}
        {filtersActive && (
          <View style={styles.activeFiltersRow}>
            <Ionicons name="funnel" size={12} color={COLORS.primary} />
            <Text style={styles.activeFiltersText}>
              Sorted by {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
              {club !== 'All' && ` · ${club}`}
            </Text>
            <TouchableOpacity onPress={() => { setSortBy('date'); setClub('All'); }}>
              <Ionicons name="close-circle" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Events Today" value="3" icon="calendar" color={COLORS.primary} />
          <StatCard label={user?.isAdmin ? 'Hosted' : 'Registered'} value={user?.isAdmin ? user?.hostedEvents?.length || 3 : user?.registeredEvents?.length || 2} icon={user?.isAdmin ? 'megaphone' : 'checkmark-circle'} color={COLORS.accent} />
          <StatCard label={user?.isAdmin ? 'This Month' : 'My Points'} value={user?.isAdmin ? '12' : (user?.activityPoints || '0')} icon={user?.isAdmin ? 'trending-up' : 'star'} color={COLORS.warning} />
        </View>

        {/* Admin quick action */}
        {user?.isAdmin && (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('Create')} style={styles.adminCta} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.warning, '#F59E0B']} style={styles.adminCtaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="add-circle" size={26} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminCtaTitle}>Create {user.clubName} Event</Text>
                  <Text style={styles.adminCtaSub}>All BMSCE students will be auto-notified</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('AdminStats')} style={styles.statsCta} activeOpacity={0.85}>
              <View style={styles.statsCtaInner}>
                <View style={styles.statsCtaIcon}>
                  <Ionicons name="stats-chart" size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statsCtaTitle}>View Statistics</Text>
                  <Text style={styles.statsCtaSub}>See registered students per event</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Reminders — for students with upcoming registered events */}
        {!user?.isAdmin && reminders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⏰ Your Upcoming Events</Text>
              <View style={styles.countBadge}><Text style={styles.countBadgeText}>{reminders.length}</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 10 }}>
              {reminders.map(rem => {
                const hoursUntil = Math.floor((new Date(rem.date).getTime() - Date.now()) / 3600000);
                const isToday = hoursUntil < 24;
                const isTomorrow = hoursUntil >= 24 && hoursUntil < 48;
                const timeLabel = isToday
                  ? `Today · ${rem.time}`
                  : isTomorrow ? `Tomorrow · ${rem.time}`
                  : `In ${Math.ceil(hoursUntil / 24)}d · ${rem.time}`;
                const urgent = hoursUntil < 24;

                return (
                  <TouchableOpacity
                    key={rem._id}
                    onPress={() => navigation.navigate('EventDetail', { event: rem })}
                    activeOpacity={0.85}
                    style={[styles.reminderCard, urgent && styles.reminderCardUrgent]}
                  >
                    <LinearGradient
                      colors={urgent ? ['rgba(239,68,68,0.2)', 'rgba(245,158,11,0.1)'] : ['rgba(139,92,246,0.18)', 'rgba(59,130,246,0.08)']}
                      style={styles.reminderInner}
                    >
                      <View style={styles.reminderTop}>
                        <View style={[styles.reminderTimeBadge, { backgroundColor: urgent ? COLORS.danger + '33' : COLORS.primary + '33' }]}>
                          <Ionicons name={urgent ? 'flame' : 'time-outline'} size={11} color={urgent ? COLORS.danger : COLORS.primary} />
                          <Text style={[styles.reminderTimeText, { color: urgent ? COLORS.danger : COLORS.primary }]}>{timeLabel}</Text>
                        </View>
                      </View>
                      <Text style={styles.reminderTitle} numberOfLines={2}>{rem.title}</Text>
                      <View style={styles.reminderMeta}>
                        <Ionicons name="location-outline" size={11} color={COLORS.textTertiary} />
                        <Text style={styles.reminderMetaText} numberOfLines={1}>{rem.location}</Text>
                      </View>
                      <View style={styles.reminderFooter}>
                        <View style={styles.reminderClubChip}>
                          <Text style={styles.reminderClubText}>{rem.club}</Text>
                        </View>
                        <Ionicons name="arrow-forward-circle" size={20} color={urgent ? COLORS.danger : COLORS.primary} />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

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

        {/* Categories — only for students */}
        {!user?.isAdmin && (
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
        )}

        {/* Events list / calendar */}
        <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{user?.isAdmin ? `🗓 ${user.clubName} Events` : '🗓 Upcoming Events'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.countBadge}><Text style={styles.countBadgeText}>{events.length}</Text></View>
              {/* View Mode Toggle */}
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  onPress={() => setViewMode('list')}
                  style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="list-outline" size={15} color={viewMode === 'list' ? '#fff' : COLORS.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode('calendar')}
                  style={[styles.viewToggleBtn, viewMode === 'calendar' && styles.viewToggleActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={15} color={viewMode === 'calendar' ? '#fff' : COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {loading
            ? <Text style={styles.loadingText}>Loading events...</Text>
            : events.length === 0
              ? <EmptyState
                  emoji={searchQuery ? "🔎" : "🔍"}
                  title={searchQuery ? `No matches for "${searchQuery}"` : "No events match your filters"}
                  description={searchQuery
                    ? "Try a different keyword, or browse by category instead."
                    : user?.isAdmin
                      ? `Your club hasn't posted any events yet. Create one to get started!`
                      : "Try adjusting your category or club filter to see more events."}
                  actionLabel={searchQuery ? "Clear Search" : (user?.isAdmin ? "Create Event" : "Clear Filters")}
                  onAction={() => {
                    if (searchQuery) setSearchQuery('');
                    else if (user?.isAdmin) navigation.navigate('Create');
                    else { setCategory('All'); setClub('All'); }
                  }}
                  iconColor={COLORS.primary}
                />
              : viewMode === 'calendar'
                ? <View style={{ marginHorizontal: -SPACING.lg }}>
                    <CalendarView
                      events={featured ? [featured, ...events] : events}
                      onEventPress={(event) => navigation.navigate('EventDetail', { event })}
                      registeredEvents={user?.registeredEvents || []}
                    />
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

  searchBar: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, paddingHorizontal: 14, paddingVertical: 4, gap: 10 },
  searchBarActive: { borderColor: COLORS.primary + '88', backgroundColor: COLORS.primary + '11' },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14, paddingVertical: 10 },
  searchPlaceholder: { flex: 1, color: COLORS.textTertiary, fontSize: 14 },

  // Search Modal (fullscreen)
  searchModal: { flex: 1, backgroundColor: COLORS.bg },
  searchModalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: SPACING.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  searchModalBack: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Autocomplete dropdown
  suggestionsDropdown: { position: 'absolute', top: 56, left: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 16, zIndex: 100, maxHeight: 460 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionHeaderText: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  clearAllText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  suggestionEventIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.warning + '22', alignItems: 'center', justifyContent: 'center' },
  suggestionText: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  suggestionSub: { fontSize: 11, color: COLORS.textTertiary, marginTop: 1 },
  quickFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingVertical: 4 },
  quickFilterChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, backgroundColor: COLORS.primary + '22', borderWidth: 1, borderColor: COLORS.primary + '44' },
  quickFilterText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  noSuggestion: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  noSuggestionText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  noSuggestionHint: { fontSize: 11, color: COLORS.textTertiary },
  dismissBtn: { paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.bgCardBorder, marginTop: 4 },
  dismissText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },
  filterBtn: { width: 32, height: 32, borderRadius: 9, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterBtnDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.warning, borderWidth: 1, borderColor: '#fff' },

  activeFiltersRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.primary + '33', alignSelf: 'flex-start' },
  activeFiltersText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.sm, alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textTertiary, textAlign: 'center' },

  adminCta: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden', shadowColor: COLORS.warning, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  adminCtaGrad: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  adminCtaTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  adminCtaSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  statsCta: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary + '15', borderWidth: 1, borderColor: COLORS.primary + '44' },
  statsCtaInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  statsCtaIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  statsCtaTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  statsCtaSub: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },

  section: { marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  countBadge: { backgroundColor: COLORS.primary + '33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  countBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  // View toggle
  viewToggle: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: 2 },
  viewToggleBtn: { width: 32, height: 28, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  viewToggleActive: { backgroundColor: COLORS.primary },

  // Reminders
  reminderCard: { width: 260, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.primary + '44' },
  reminderCardUrgent: { borderColor: COLORS.danger + '66' },
  reminderInner: { padding: 14, gap: 8 },
  reminderTop: { flexDirection: 'row', alignItems: 'center' },
  reminderTimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  reminderTimeText: { fontSize: 11, fontWeight: '800' },
  reminderTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 20 },
  reminderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderMetaText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500', flex: 1 },
  reminderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  reminderClubChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.08)' },
  reminderClubText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700' },
  catScroll: { marginTop: SPACING.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden' },
  catChipActive: { borderColor: 'transparent' },
  catChipGradient: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8 },
  catChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary, paddingHorizontal: 14, paddingVertical: 8 },
  loadingText: { color: COLORS.textTertiary, textAlign: 'center', paddingVertical: 40 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  emptyAction: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },

  // Profile modal
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

  // Filter modal
  filterOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  filterSheet: { backgroundColor: '#111130', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, maxHeight: '85%', paddingBottom: 30 },
  filterHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  filterTitle: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary },
  filterReset: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  filterSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: RADIUS.md, marginBottom: 4 },
  filterRowActive: { backgroundColor: COLORS.primary + '15' },
  filterRowText: { flex: 1, fontSize: 14, color: COLORS.textSecondary },
  clubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  clubChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  clubChipText: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '600' },
  applyBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.md },
  applyBtnGrad: { height: 50, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});