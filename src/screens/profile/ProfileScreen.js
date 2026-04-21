import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../../theme';

const SETTINGS = [
  { id: 'notif', label: 'Event Notifications', icon: 'notifications-outline', type: 'toggle' },
  { id: 'reminder', label: 'Event Reminders', icon: 'alarm-outline', type: 'toggle' },
  { id: 'email', label: 'Email Updates', icon: 'mail-outline', type: 'toggle' },
];

const MENU = [
  { id: 'about', label: 'About CampusSync', icon: 'information-circle-outline', color: COLORS.secondary },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', color: COLORS.accent },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark-outline', color: COLORS.warning },
  { id: 'terms', label: 'Terms of Service', icon: 'document-text-outline', color: COLORS.textTertiary },
];

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editBranch, setEditBranch] = useState(user?.branch || '');
  const [toggles, setToggles] = useState({ notif: true, reminder: true, email: false });

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const handleSaveProfile = () => {
    updateUser({ name: editName, branch: editBranch });
    setEditing(false);
    Alert.alert('✅ Profile Updated', 'Your changes have been saved.');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const roleBadgeColor = user?.role === 'organizer' ? COLORS.warning : COLORS.primary;
  const roleLabel = user?.role === 'organizer' ? '🎙 Organizer' : '🎓 Student';

  const stats = [
    { label: 'Registered', value: user?.registeredEvents?.length || 2, icon: 'calendar-outline', color: COLORS.primary },
    { label: 'Hosted', value: user?.hostedEvents?.length || 0, icon: 'megaphone-outline', color: COLORS.accent },
    { label: 'Semester', value: user?.semester || 4, icon: 'school-outline', color: COLORS.secondary },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={['rgba(139,92,246,0.15)', 'transparent']} style={styles.headerGrad}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Profile</Text>
            <TouchableOpacity onPress={() => setEditing(v => !v)} style={styles.editBtn}>
              <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
              <View style={[styles.roleDot, { backgroundColor: roleBadgeColor }]} />
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
                  <View style={[styles.badge, { backgroundColor: roleBadgeColor + '22', borderColor: roleBadgeColor + '44' }]}>
                    <Text style={[styles.badgeText, { color: roleBadgeColor }]}>{roleLabel}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Ionicons name="git-branch-outline" size={12} color={COLORS.textTertiary} />
                    <Text style={styles.badgeText}>{user?.branch || 'CSE'}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Ionicons name="school-outline" size={12} color={COLORS.textTertiary} />
                    <Text style={styles.badgeText}>{user?.college || 'BMSCE'}</Text>
                  </View>
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

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.card}>
            {MENU.map((item, i) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
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

        {/* App Version */}
        <Text style={styles.versionText}>CampusSync v1.0.0 · BMSCE · 2025</Text>

        {/* Logout */}
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
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary + '44' },
  avatarSection: { alignItems: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  avatarWrap: { position: 'relative', marginBottom: SPACING.sm },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  roleDot: { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.bg },
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
});
