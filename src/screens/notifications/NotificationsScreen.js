import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationsAPI } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme';

const TYPE_CONFIG = {
  success: { icon: 'checkmark-circle', color: COLORS.accent, bg: COLORS.accent + '22' },
  reminder: { icon: 'alarm', color: COLORS.warning, bg: COLORS.warning + '22' },
  warning: { icon: 'warning', color: COLORS.danger, bg: COLORS.danger + '22' },
  info: { icon: 'information-circle', color: COLORS.secondary, bg: COLORS.secondary + '22' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function NotifCard({ notif, onPress }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, !notif.read && styles.cardUnread]}
    >
      {!notif.read && <View style={styles.unreadDot} />}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.notifTitle, !notif.read && { color: COLORS.textPrimary }]}>{notif.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
        <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const res = await notificationsAPI.getAll();
    setNotifications(res.notifications || []);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(ns => ns.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.unreadCount}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={40} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No notifications right now.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <NotifCard notif={item} onPress={() => markRead(item._id)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  unreadCount: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.primary + '44' },
  markAllText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.md, marginBottom: SPACING.sm, position: 'relative' },
  cardUnread: { borderColor: COLORS.primary + '44', backgroundColor: COLORS.primary + '08' },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  iconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  notifBody: { fontSize: 13, color: COLORS.textTertiary, lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.bgCardBorder },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 13, color: COLORS.textTertiary },
});
