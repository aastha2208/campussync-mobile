import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Animated, Share, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import { COLORS, SPACING, RADIUS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../theme';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDeadline(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return 'Event passed';
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hrs}h remaining`;
  return `${hrs}h remaining`;
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
      Alert.alert('Unregister?', 'Are you sure you want to cancel your registration?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, unregister', style: 'destructive',
          onPress: async () => {
            setRegLoading(true);
            try {
              await eventsAPI.unregister(event._id);
              setRegistered(false);
              const ids = (user.registeredEvents || []).filter(id => id !== event._id);
              updateUser({ registeredEvents: ids });
              Alert.alert('Done', 'You have unregistered from this event.');
            } catch (e) {
              Alert.alert('Error', 'Could not unregister. Please try again.');
            } finally {
              setRegLoading(false);
            }
          }
        },
      ]);
      return;
    }
    setRegLoading(true);
    try {
      await eventsAPI.register(event._id);
      setRegistered(true);
      const ids = [...(user.registeredEvents || []), event._id];
      updateUser({ registeredEvents: ids });
      Alert.alert('🎉 Registered!', `You are now registered for ${event.title}. Check My Events for details.`);
    } catch (e) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${event.title}" at ${event.location} on ${formatDate(event.date)}! Join via CampusSync.`,
        title: event.title,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      {/* Sticky header on scroll */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>{event.title}</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: event.imageUrl }}
            style={[styles.heroImage, { transform: [{ scale: imageScale }] }]}
          />
          <LinearGradient colors={['rgba(8,8,24,0.3)', 'transparent', 'rgba(8,8,24,1)']} style={styles.imageGradient} />

          {/* Top actions */}
          <View style={[styles.imageActions, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.circleBtn}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Category badge */}
          <View style={[styles.heroCatBadge, { backgroundColor: catColor + 'DD' }]}>
            <Ionicons name={catIcon} size={13} color="#fff" />
            <Text style={styles.heroCatText}>{event.category}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & countdown */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.countdownBadge}>
              <Ionicons name="time-outline" size={13} color={COLORS.warning} />
              <Text style={styles.countdownText}>{timeUntil(event.date)}</Text>
            </View>
          </View>

          {/* Info cards */}
          <View style={styles.infoGrid}>
            <InfoCard icon="calendar" color={COLORS.primary} label="Date" value={formatDate(event.date)} />
            <InfoCard icon="time" color={COLORS.secondary} label="Time" value={event.time} />
            <InfoCard icon="location" color={COLORS.accent} label="Venue" value={event.location} />
            <InfoCard icon="alarm" color={COLORS.warning} label="Deadline" value={formatDeadline(event.registrationDeadline)} />
          </View>

          {/* Registration capacity */}
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
            <Text style={styles.capacityStatus}>
              {isFull ? '🔴 This event is at full capacity' : `🟢 ${spotsLeft} spots remaining`}
            </Text>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {event.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Organizer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.orgCard}>
              <View style={styles.orgAvatar}>
                <LinearGradient colors={COLORS.gradientPrimary} style={styles.orgAvatarGrad}>
                  <Text style={styles.orgAvatarText}>{event.organizer.name[0]}</Text>
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.orgName}>{event.organizer.name}</Text>
                <Text style={styles.orgEmail}>{event.organizer.email}</Text>
              </View>
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.ctaPrice}>
          <Text style={styles.ctaFreeText}>FREE</Text>
          <Text style={styles.ctaFreeLabel}>No registration fee</Text>
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
            <Ionicons
              name={registered ? 'close-circle-outline' : isFull ? 'lock-closed-outline' : 'checkmark-circle-outline'}
              size={20} color="#fff"
            />
            <Text style={styles.ctaBtnText}>
              {regLoading ? 'Processing...' : registered ? 'Unregister' : isFull ? 'Event Full' : 'Register Now'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  heroCatBadge: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
  heroCatText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  content: { padding: SPACING.lg },
  titleRow: { marginBottom: SPACING.lg },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 32, marginBottom: 8 },
  countdownBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: COLORS.warning + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
  countdownText: { fontSize: 12, fontWeight: '600', color: COLORS.warning },
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
  orgAvatar: { width: 48, height: 48, borderRadius: 24 },
  orgAvatarGrad: { flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  orgAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  orgName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  orgEmail: { fontSize: 12, color: COLORS.textTertiary },
  contactBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.bgCardBorder, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ctaPrice: { flex: 0.35 },
  ctaFreeText: { fontSize: 22, fontWeight: '800', color: COLORS.accent },
  ctaFreeLabel: { fontSize: 11, color: COLORS.textTertiary },
  ctaBtnWrap: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  ctaBtn: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: RADIUS.md },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
