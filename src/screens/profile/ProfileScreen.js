import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, TextInput, Modal, Pressable, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { CLUBS } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme';

const SETTINGS = [
  { id: 'notif', label: 'Event Notifications', icon: 'notifications-outline' },
  { id: 'reminder', label: 'Event Reminders', icon: 'alarm-outline' },
  { id: 'email', label: 'Email Updates', icon: 'mail-outline' },
];

// ─── INFO PAGES CONTENT ──────────────────────────────────────────────────────
const INFO_PAGES = {
  about: {
    title: 'About CampusSync',
    icon: 'information-circle',
    color: COLORS.secondary,
    sections: [
      {
        heading: 'What is CampusSync?',
        body: 'CampusSync is the official campus event management platform for BMS College of Engineering. It connects students, club admins, and event organizers in one unified space.',
      },
      {
        heading: 'Our Mission',
        body: 'To make discovering, registering for, and managing campus events effortless — so students can focus on what matters: participating, learning, and growing.',
      },
      {
        heading: 'Key Features',
        body: '• Browse 18+ events across 6 active clubs\n• Earn activity points for participation\n• Track your registered events in one place\n• Get instant notifications for new events\n• Club admins can manage their own events',
      },
      {
        heading: 'Built By',
        body: '4th semester CSE students of BMSCE as part of the Mobile Application Development course (23CS4AEMAD).',
      },
    ],
  },
  help: {
    title: 'Help & Support',
    icon: 'help-circle',
    color: COLORS.accent,
    sections: [
      {
        heading: 'How do I register for an event?',
        body: 'Open any event from the Home screen, scroll down, and tap "Register & Earn Points". You\'ll be added to the event and earn activity points instantly.',
      },
      {
        heading: 'Can I cancel my registration?',
        body: 'Yes! Open the event from "My Events" and tap "Unregister". Your activity points will also be reverted.',
      },
      {
        heading: 'How do I become a club admin?',
        body: 'Admin accounts are pre-registered for each of the 6 clubs by the BMSCE administration. Self-registration as admin is not allowed.',
      },
      {
        heading: 'My event isn\'t showing up — why?',
        body: 'Pull down on the home screen to refresh. If the issue persists, check that you\'re not filtering by category or club.',
      },
      {
        heading: 'Need more help?',
        body: 'Contact the CampusSync team at:\nsupport@bmsce.ac.in\n\nOr visit the Computer Science Department office during working hours.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    icon: 'shield-checkmark',
    color: COLORS.warning,
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect only the minimum information required: your BMSCE email address, name, branch, semester, and the events you register for. No personal data outside the BMSCE ecosystem is accessed.',
      },
      {
        heading: 'How We Use Your Data',
        body: '• To verify your BMSCE student/admin status\n• To send event notifications you opted into\n• To show event organizers a list of registered students\n• To calculate your activity points',
      },
      {
        heading: 'Data Sharing',
        body: 'Your data is never sold or shared with third parties. Event organizers (admins of the relevant club) can see your name and email when you register for their event — that is the only sharing.',
      },
      {
        heading: 'Your Rights',
        body: 'You can sign out, request data deletion, or modify your preferences anytime via the Profile screen. For data deletion requests, contact the CSE department.',
      },
      {
        heading: 'Last Updated',
        body: 'May 2026',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    icon: 'document-text',
    color: COLORS.textTertiary,
    sections: [
      {
        heading: 'Eligibility',
        body: 'CampusSync is exclusively for current students, faculty, and authorized admins of BMS College of Engineering. Only @bmsce.ac.in email addresses are accepted.',
      },
      {
        heading: 'Acceptable Use',
        body: 'You agree to use CampusSync respectfully:\n• Do not register for events you do not intend to attend\n• Do not attempt to access admin features without authorization\n• Do not misuse the platform for spam or harassment',
      },
      {
        heading: 'Event Registration',
        body: 'Registering for an event is a commitment. Repeated no-shows may result in temporary suspension of your registration privileges, at the discretion of club admins.',
      },
      {
        heading: 'Account Termination',
        body: 'BMSCE administration reserves the right to suspend or terminate accounts that violate these terms or campus policies.',
      },
      {
        heading: 'Disclaimer',
        body: 'CampusSync is a student-built academic project. Event details are provided by club admins; CampusSync is not responsible for changes or cancellations made by event hosts.',
      },
    ],
  },
};

const MENU = [
  { id: 'about', label: 'About CampusSync', icon: 'information-circle-outline', color: COLORS.secondary },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', color: COLORS.accent },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark-outline', color: COLORS.warning },
  { id: 'terms', label: 'Terms of Service', icon: 'document-text-outline', color: COLORS.textTertiary },
];

const AVATAR_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#6366F1'];
const getAvatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ─── INFO MODAL ──────────────────────────────────────────────────────────────
function InfoModal({ visible, onClose, page }) {
  const insets = useSafeAreaInsets();
  if (!page) return null;
  const data = INFO_PAGES[page];
  if (!data) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIcon, { backgroundColor: data.color + '22' }]}>
              <Ionicons name={data.icon} size={22} color={data.color} />
            </View>
            <Text style={styles.modalTitle}>{data.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sections */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            {data.sections.map((section, i) => (
              <View key={i} style={styles.infoSection}>
                <Text style={[styles.infoHeading, { color: data.color }]}>{section.heading}</Text>
                <Text style={styles.infoBody}>{section.body}</Text>
              </View>
            ))}

            <View style={{ height: 20 }} />

            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.modalCloseGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.modalCloseBtnText}>Got it</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── PROFILE SCREEN ──────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editBranch, setEditBranch] = useState(user?.branch || '');
  const [toggles, setToggles] = useState({ notif: true, reminder: true, email: false });
  const [infoPage, setInfoPage] = useState(null);

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const avatarColor = getAvatarColor(user?.name || '');
  const adminClub = user?.isAdmin ? CLUBS.find(c => c.id === user.clubId) : null;

  const handleSaveProfile = () => {
    updateUser({ name: editName, branch: editBranch });
    setEditing(false);
    Alert.alert('✅ Profile Updated', 'Your changes have been saved.');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // On web, use native confirm
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) logout();
    } else {
      Alert.alert('Log Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  // PROPER role detection — based on isAdmin flag set during login
  const isAdmin = !!user?.isAdmin;
  const roleBadgeColor = isAdmin ? COLORS.warning : COLORS.primary;
  const roleLabel = isAdmin ? '🛡️ Admin' : '🎓 Student';

  const stats = isAdmin
    ? [
        { label: 'Hosted', value: user?.hostedEvents?.length || 3, icon: 'megaphone-outline', color: COLORS.warning },
        { label: 'Club', value: adminClub?.name?.split(' ')[0] || '—', icon: 'people-outline', color: adminClub?.color || COLORS.primary },
        { label: 'Role', value: 'Admin', icon: 'shield-checkmark-outline', color: COLORS.danger },
      ]
    : [
        { label: 'Registered', value: user?.registeredEvents?.length || 2, icon: 'calendar-outline', color: COLORS.primary },
        { label: 'Points', value: user?.activityPoints || 0, icon: 'star-outline', color: COLORS.warning },
        { label: 'Semester', value: user?.semester || 4, icon: 'school-outline', color: COLORS.secondary },
      ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <InfoModal visible={!!infoPage} onClose={() => setInfoPage(null)} page={infoPage} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={['rgba(139,92,246,0.15)', 'transparent']} style={styles.headerGrad}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Profile</Text>
            <TouchableOpacity onPress={() => setEditing(v => !v)} style={styles.editBtn}>
              <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={[styles.roleDot, { backgroundColor: roleBadgeColor }]}>
                <Ionicons name={isAdmin ? 'shield-checkmark' : 'person'} size={10} color="#fff" />
              </View>
            </View>

            {editing ? (
              <View style={styles.editFields}>
                <View style={styles.editInputWrap}>
                  <Ionicons name="person-outline" size={16} color={COLORS.textTertiary} style={{ marginRight: 8 }} />
                  <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} placeholder="Full Name" placeholderTextColor={COLORS.textTertiary} />
                </View>
                <View style={styles.editInputWrap}>
                  <Ionicons name="git-branch-outline" size={16} color={COLORS.textTertiary} style={{ marginRight: 8 }} />
                  <TextInput style={styles.editInput} value={editBranch} onChangeText={setEditBranch} placeholder="Branch (e.g. CSE)" placeholderTextColor={COLORS.textTertiary} autoCapitalize="characters" />
                </View>
                <TouchableOpacity onPress={handleSaveProfile} style={styles.saveBtn}>
                  <LinearGradient colors={COLORS.gradientPrimary} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="checkmark-outline" size={16} color="#fff" />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.metaRow}>
                  {/* Role badge — only one, correctly */}
                  <View style={[styles.badge, { backgroundColor: roleBadgeColor + '22', borderColor: roleBadgeColor + '44' }]}>
                    <Text style={[styles.badgeText, { color: roleBadgeColor, fontWeight: '700' }]}>{roleLabel}</Text>
                  </View>
                  {/* Club for admin, branch for student */}
                  {isAdmin && adminClub ? (
                    <View style={[styles.badge, { backgroundColor: adminClub.color + '22', borderColor: adminClub.color + '44' }]}>
                      <Ionicons name={adminClub.icon} size={11} color={adminClub.color} />
                      <Text style={[styles.badgeText, { color: adminClub.color }]}>{adminClub.name}</Text>
                    </View>
                  ) : (
                    <View style={styles.badge}>
                      <Ionicons name="git-branch-outline" size={11} color={COLORS.textTertiary} />
                      <Text style={styles.badgeText}>{user?.branch || 'CSE'}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color + '33' }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '22' }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.card}>
            {SETTINGS.map((setting, i) => (
              <View key={setting.id}>
                <View style={styles.settingRow}>
                  <View style={[styles.settingIcon, { backgroundColor: COLORS.primary + '22' }]}>
                    <Ionicons name={setting.icon} size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Switch
                    value={toggles[setting.id]}
                    onValueChange={v => setToggles(p => ({ ...p, [setting.id]: v }))}
                    trackColor={{ false: COLORS.bgInput, true: COLORS.primary + '88' }}
                    thumbColor={toggles[setting.id] ? COLORS.primary : COLORS.textTertiary}
                  />
                </View>
                {i < SETTINGS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Menu — now functional! */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.card}>
            {MENU.map((item, i) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={() => setInfoPage(item.id)}>
                  <View style={[styles.settingIcon, { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
                {i < MENU.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.versionText}>CampusSync v1.0.0 · 2026</Text>

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
  headerGrad: { paddingBottom: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  pageTitle: { flex: 1, fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginLeft: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.bgCardBorder },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary + '44' },
  avatarSection: { alignItems: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  avatarWrap: { position: 'relative', marginBottom: SPACING.sm },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  roleDot: { position: 'absolute', bottom: 4, right: 4, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.bg },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  userEmail: { fontSize: 13, color: COLORS.textTertiary },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  badgeText: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '600' },
  editFields: { width: '100%', gap: SPACING.sm },
  editInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.bgCardBorder, paddingHorizontal: 14, height: 48 },
  editInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  saveBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.sm, alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600', textAlign: 'center' },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  settingIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.bgCardBorder, marginHorizontal: SPACING.md },
  versionText: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginBottom: SPACING.lg },
  logoutBtn: { marginHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.danger + '15', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.danger + '33', height: 52 },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.danger },

  // Info Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(8,8,24,0.97)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#0d0d2b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  modalIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
  modalContent: { padding: SPACING.lg },
  infoSection: { marginBottom: SPACING.lg },
  infoHeading: { fontSize: 14, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  modalCloseBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.md },
  modalCloseGrad: { height: 50, alignItems: 'center', justifyContent: 'center' },
  modalCloseBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});