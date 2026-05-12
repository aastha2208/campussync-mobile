import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, Pressable, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../../theme';

const AVATAR_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#6366F1'];
const getAvatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ─── Info pages content ─────────────────────────────────────────────────────
const INFO_PAGES = {
  about: {
    title: 'About CampusSync',
    icon: 'information-circle',
    sections: [
      { title: 'What is CampusSync?', body: 'CampusSync is a campus event management platform for BMS College of Engineering. Students discover and register for college events, while club admins create and manage them.' },
      { title: 'Built by', body: '4th semester CSE students of BMSCE as part of the Mobile Application Development course (23CS4AEMAD).' },
    ],
  },
  help: {
    title: 'Help & Support',
    icon: 'help-circle',
    sections: [
      { title: 'How do I register for an event?', body: 'Browse events on Home, tap any event, then tap "Register". Free events register instantly. Paid events open a UPI payment screen.' },
      { title: 'Can I unregister?', body: 'Yes! Open the event from "My Events" and tap "Unregister".' },
      { title: 'How do I become a club admin?', body: 'Admin accounts are pre-registered for each of the 6 clubs. Self-registration as admin is not allowed.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    icon: 'shield-checkmark',
    sections: [
      { title: 'What we collect', body: 'We collect only the minimum information required: your BMSCE email, name, branch, semester, and the events you register for.' },
      { title: 'How we use it', body: '• To verify your BMSCE status\n• To send event notifications\n• To show event organizers your registration\n• To calculate activity points' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    icon: 'document-text',
    sections: [
      { title: 'Acceptable use', body: 'CampusSync is for BMSCE students and authorized club admins only. Misuse, spam, or impersonation is prohibited.' },
      { title: 'Account responsibility', body: 'You are responsible for maintaining the confidentiality of your account credentials.' },
    ],
  },
};

// ─── Menu items (My Points REMOVED) ─────────────────────────────────────────
const STUDENT_MENU = [
  { id: 'myevents', label: 'My Events', icon: 'calendar', color: COLORS.primary, action: 'navigate', target: 'MyEvents' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', color: COLORS.accent, action: 'navigate', target: 'Notifications' },
  { id: 'search', label: 'Search Events', icon: 'search', color: COLORS.secondary, action: 'navigate', target: 'Home' },
  { id: 'about', label: 'About CampusSync', icon: 'information-circle', color: COLORS.secondary, action: 'info' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle', color: COLORS.accent, action: 'info' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark', color: COLORS.warning, action: 'info' },
  { id: 'terms', label: 'Terms of Service', icon: 'document-text', color: COLORS.textTertiary, action: 'info' },
];

const ADMIN_MENU = [
  { id: 'myevents', label: 'My Hosted Events', icon: 'megaphone', color: COLORS.warning, action: 'navigate', target: 'MyEvents' },
  { id: 'create', label: 'Create New Event', icon: 'add-circle', color: COLORS.primary, action: 'navigate', target: 'Create' },
  { id: 'stats', label: 'Club Statistics', icon: 'stats-chart', color: COLORS.accent, action: 'navigate', target: 'AdminStats' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', color: COLORS.accent, action: 'navigate', target: 'Notifications' },
  { id: 'about', label: 'About CampusSync', icon: 'information-circle', color: COLORS.secondary, action: 'info' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle', color: COLORS.accent, action: 'info' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark', color: COLORS.warning, action: 'info' },
  { id: 'terms', label: 'Terms of Service', icon: 'document-text', color: COLORS.textTertiary, action: 'info' },
];

// ─── INFO MODAL ─────────────────────────────────────────────────────────────
function InfoModal({ visible, onClose, page }) {
  const insets = useSafeAreaInsets();
  if (!page) return null;
  const data = INFO_PAGES[page];
  if (!data) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + 20 }]} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={[styles.modalHeaderIcon, { backgroundColor: COLORS.primary + '22' }]}>
                <Ionicons name={data.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.modalTitle}>{data.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.lg }}>
            {data.sections.map((s, i) => (
              <View key={i} style={{ marginBottom: SPACING.lg }}>
                <Text style={styles.sectionTitle}>{s.title}</Text>
                <Text style={styles.sectionBody}>{s.body}</Text>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [infoPage, setInfoPage] = useState(null);

  const isAdmin = !!user?.isAdmin;
  const roleColor = isAdmin ? COLORS.warning : COLORS.primary;
  const avatarColor = getAvatarColor(user?.name || 'A');
  const initials = (user?.name || 'AS').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) logout();
    } else {
      Alert.alert('Log Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const handleMenuPress = (item) => {
    if (item.action === 'navigate') {
      navigation.navigate(item.target);
    } else if (item.action === 'info') {
      setInfoPage(item.id);
    }
  };

  const MENU = isAdmin ? ADMIN_MENU : STUDENT_MENU;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <InfoModal visible={!!infoPage} onClose={() => setInfoPage(null)} page={infoPage} />

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 140 }}
        bounces={true}
      >
        {/* Profile Header — purple gradient */}
        <LinearGradient
          colors={['rgba(139,92,246,0.25)', 'rgba(139,92,246,0.08)', 'transparent']}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
              <View style={[styles.avatarBadge, { backgroundColor: roleColor }]}>
                <Ionicons name={isAdmin ? 'shield-checkmark' : 'person'} size={10} color="#fff" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{user?.name || 'Student'}</Text>
              {user?.username && (
                <Text style={styles.username}>@{user.username}</Text>
              )}
              <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Badges row — Student + Branch·Sem (BMSCE removed) */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: roleColor + '22', borderColor: roleColor + '44' }]}>
            <Ionicons name={isAdmin ? 'shield-checkmark' : 'school'} size={12} color={roleColor} />
            <Text style={[styles.badgeText, { color: roleColor, fontWeight: '700' }]}>{isAdmin ? 'Admin' : 'Student'}</Text>
          </View>
          {!isAdmin && (
            <View style={styles.badge}>
              <Ionicons name="git-branch-outline" size={12} color={COLORS.textTertiary} />
              <Text style={styles.badgeText}>{user?.branch || 'CSE'} · Sem {user?.semester || '4'}</Text>
            </View>
          )}
          {isAdmin && user?.clubName && (
            <View style={styles.badge}>
              <Ionicons name="people-outline" size={12} color={COLORS.textTertiary} />
              <Text style={styles.badgeText}>{user.clubName}</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuList}>
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>CampusSync v1.0.0 · 2026</Text>

        {/* Sign Out */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl, borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.bg },
  name: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  username: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  email: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },

  // Badges
  badgesRow: { flexDirection: 'row', gap: 8, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },

  // Menu
  menuList: { paddingTop: SPACING.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },

  // Footer
  versionText: { textAlign: 'center', color: COLORS.textTertiary, fontSize: 11, marginTop: SPACING.lg, marginBottom: SPACING.md },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, paddingVertical: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.danger + '15', borderWidth: 1, borderColor: COLORS.danger + '44' },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.danger },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(8,8,24,0.97)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, maxHeight: '85%', borderTopWidth: 1, borderColor: COLORS.bgCardBorder },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.textTertiary, borderRadius: 2, alignSelf: 'center', marginTop: 10, opacity: 0.4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalHeaderIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center' },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  sectionBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});