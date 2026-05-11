import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Share, Alert, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import { COLORS, SPACING, RADIUS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../theme';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

const formatDate = d => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatDeadline = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const timeUntil = d => {
  const diff = new Date(d) - new Date();
  if (diff <= 0) return 'Event passed';
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hrs}h remaining` : `${hrs}h remaining`;
};

// Cross-platform confirm — Alert.alert doesn't work on web
const confirmAction = (title, message, onConfirm) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
};

const showAlert = (title, message, onClose) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (onClose) onClose();
    return;
  }
  Alert.alert(title, message, [{ text: 'OK', onPress: onClose }]);
};

function InfoCard({ icon, color, label, value }) {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function EventDetailScreen({ navigation, route }) {
  const event = route.params?.event;
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [registered, setRegistered] = useState(user?.registeredEvents?.includes(event?._id));
  const [regLoading, setRegLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!event) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: COLORS.textSecondary }}>Event not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[event.category] || COLORS.primary;
  const catIcon = CATEGORY_ICONS[event.category] || 'grid-outline';
  const spotsLeft = event.maxCapacity - event.registeredCount;
  const isFull = spotsLeft <= 0;
  const pct = Math.min((event.registeredCount / event.maxCapacity) * 100, 100);

  const imageScale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.3, 1], extrapolateRight: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [IMAGE_HEIGHT - 100, IMAGE_HEIGHT - 40], outputRange: [0, 1], extrapolate: 'clamp' });

  const handleRegister = async () => {
    if (registered) {
      confirmAction('Unregister?', 'Cancel your registration?', async () => {
        setRegLoading(true);
        try {
          await eventsAPI.unregister(event._id, user.email);
          setRegistered(false);
          const ids = (user.registeredEvents || []).filter(id => id !== event._id);
          updateUser({ registeredEvents: ids });
          showAlert('Done', 'You have unregistered from this event.');
        } catch { showAlert('Error', 'Could not unregister.'); }
        finally { setRegLoading(false); }
      });
      return;
    }

    // PAID event → go to payment page
    if (event.price && event.price > 0) {
      navigation.navigate('Payment', { event });
      return;
    }

    // FREE event → register directly
    setRegLoading(true);
    try {
      await eventsAPI.register(event._id, user.email);
      setRegistered(true);
      const ids = Array.from(new Set([...(user.registeredEvents || []), event._id]));
      // NOTE: activity points are awarded ONLY when admin marks attendance, not on registration
      updateUser({ registeredEvents: ids });
      showAlert('🎉 Registered!', `You're registered for ${event.title}!\n\n💡 Earn ${event.activityPoints} activity points by attending the event\n\n✉️ Confirmation email sent to ${user.email}`);
    } catch { showAlert('Error', 'Registration failed.'); }
    finally { setRegLoading(false); }
  };

  // FIXED: No confirmation dialog (unreliable on Android), just delete + back
  const handleDelete = async () => {
    try {
      console.log('Deleting event:', event._id);
      await eventsAPI.delete(event._id, user);
      console.log('Delete success');
      navigation.goBack();
    } catch (e) {
      console.log('Delete error:', e.message);
      showAlert('Error', e.message || 'Could not delete event.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${event.title}" by ${event.club} at ${event.location} on ${formatDate(event.date)}! Earn ${event.activityPoints} activity points.`,
        title: event.title,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>{event.title}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {user?.isAdmin && event.clubId === user?.clubId && (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (user?.isAdmin ? 110 : 200) + insets.bottom }}
      >
        <View style={styles.imageContainer}>
          <Animated.Image source={{ uri: event.imageUrl }} style={[styles.heroImage, { transform: [{ scale: imageScale }] }]} />
          <LinearGradient colors={['rgba(8,8,24,0.3)', 'transparent', 'rgba(8,8,24,1)']} style={styles.imageGradient} />
          <View style={[styles.imageActions, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroBadgesRow}>
            <View style={[styles.heroCatBadge, { backgroundColor: catColor + 'DD' }]}>
              <Ionicons name={catIcon} size={13} color="#fff" />
              <Text style={styles.heroCatText}>{event.category}</Text>
            </View>
            {!user?.isAdmin && (
              <View style={styles.heroPointsBadge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.heroPointsText}>Earn +{event.activityPoints} pts on attendance</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.metaPair}>
              <View style={styles.clubBadge}>
                <Ionicons name="people-outline" size={12} color={COLORS.primary} />
                <Text style={styles.clubBadgeText}>{event.club}</Text>
              </View>
              <View style={styles.countdownBadge}>
                <Ionicons name="time-outline" size={12} color={COLORS.warning} />
                <Text style={styles.countdownText}>{timeUntil(event.date)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoCard icon="calendar" color={COLORS.primary} label="Date" value={formatDate(event.date)} />
            <InfoCard icon="time" color={COLORS.secondary} label="Time" value={event.time} />
            <InfoCard icon="location" color={COLORS.accent} label="Venue" value={event.location} />
            <InfoCard icon="alarm" color={COLORS.warning} label="Deadline" value={formatDeadline(event.registrationDeadline)} />
          </View>

          <View style={styles.capacityCard}>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityLabel}>Registration</Text>
              <Text style={styles.capacityCount}>
                <Text style={{ color: COLORS.primary, fontWeight: '800' }}>{event.registeredCount}</Text>
                <Text style={{ color: COLORS.textTertiary }}> / {event.maxCapacity}</Text>
              </Text>
            </View>
            <View style={styles.capacityBarBg}>
              <LinearGradient
                colors={pct > 90 ? [COLORS.danger, COLORS.warning] : pct > 70 ? [COLORS.warning, COLORS.accent] : COLORS.gradientPrimary}
                style={[styles.capacityBarFill, { width: `${pct}%` }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.capacityStatus}>{isFull ? '🔴 Full' : `🟢 ${spotsLeft} spots remaining`}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {(event.tags || []).map(tag => (
                <View key={tag} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted by</Text>
            <View style={styles.orgCard}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.orgAvatarGrad}>
                <Text style={styles.orgAvatarText}>{event.organizer.name[0]}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.orgName}>{event.organizer.name}</Text>
                  <Ionicons name="shield-checkmark" size={13} color={COLORS.warning} />
                </View>
                <Text style={styles.orgEmail}>{event.organizer.email}</Text>
              </View>
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom CTA — only for students */}
      {!user?.isAdmin && (
        <View style={styles.bottomCTA}>
          <View style={styles.ctaPrice}>
            {event.price > 0 ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
                  <Text style={[styles.ctaPointsText, { color: COLORS.accent }]}>₹{event.price}</Text>
                </View>
                <Text style={styles.ctaFreeLabel}>+{event.activityPoints} pts on attendance</Text>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.ctaPointsText}>+{event.activityPoints}</Text>
                </View>
                <Text style={styles.ctaFreeLabel}>pts on attendance · Free</Text>
              </>
            )}
          </View>
          <TouchableOpacity
            onPress={handleRegister}
            disabled={regLoading || (isFull && !registered)}
            activeOpacity={0.85}
            style={styles.ctaBtnWrap}
          >
            <LinearGradient
              colors={registered ? ['#EF444488', '#EF4444BB'] : isFull ? ['#475569', '#475569'] : COLORS.gradientPrimary}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name={registered ? 'close-circle-outline' : isFull ? 'lock-closed-outline' : 'checkmark-circle-outline'} size={20} color="#fff" />
              <Text style={styles.ctaBtnText}>
                {regLoading ? 'Processing...'
                  : registered ? 'Unregister'
                  : isFull ? 'Event Full'
                  : event.price > 0 ? `Pay ₹${event.price} & Register`
                  : 'Register & Earn Points'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 99, backgroundColor: COLORS.bg + 'F5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: 12, gap: 12 },
  stickyBack: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
  stickyTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  imageContainer: { height: IMAGE_HEIGHT, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', width: '100%', height: '100%' },
  imageActions: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  heroBadgesRow: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  heroCatBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
  heroCatText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  heroPointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, backgroundColor: 'rgba(245,158,11,0.95)' },
  heroPointsText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  content: { padding: SPACING.lg },
  titleRow: { marginBottom: SPACING.lg },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 32, marginBottom: 8 },
  metaPair: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  clubBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.primary + '44' },
  clubBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  countdownBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.warning + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
  countdownText: { fontSize: 11, fontWeight: '600', color: COLORS.warning },
  adminWarn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.warning + '44', marginBottom: SPACING.lg },
  adminWarnText: { flex: 1, fontSize: 12, color: COLORS.warning, fontWeight: '600' },
  adminDeleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.danger, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.md },
  adminDeleteBtnText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  infoCard: { width: (width - SPACING.lg * 2 - SPACING.sm) / 2, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.sm, gap: 4 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  infoLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '700', lineHeight: 18 },
  capacityCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.md, marginBottom: SPACING.lg },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  capacityLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  capacityCount: { fontSize: 14 },
  capacityBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  capacityBarFill: { height: '100%', borderRadius: 4 },
  capacityStatus: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.primary + '44' },
  tagText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  orgCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  orgAvatarGrad: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  orgAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  orgName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  orgEmail: { fontSize: 12, color: COLORS.textTertiary },
  contactBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  bottomCTA: { position: 'absolute', bottom: 88, left: 0, right: 0, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.bgCardBorder, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, zIndex: 10 },
  ctaPrice: { flex: 0.35 },
  ctaPointsText: { fontSize: 22, fontWeight: '800', color: COLORS.warning },
  ctaFreeLabel: { fontSize: 11, color: COLORS.textTertiary },
  ctaBtnWrap: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  ctaBtn: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: RADIUS.md },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});