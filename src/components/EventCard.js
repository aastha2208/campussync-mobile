import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, CATEGORY_COLORS, CATEGORY_ICONS } from '../theme';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getCapacityColor(count, max) {
  const pct = count / max;
  if (pct >= 0.9) return COLORS.danger;
  if (pct >= 0.7) return COLORS.warning;
  return COLORS.accent;
}

export default function EventCard({ event, onPress, style, variant = 'default' }) {
  const catColor = CATEGORY_COLORS[event.category] || COLORS.other;
  const catIcon = CATEGORY_ICONS[event.category] || 'grid-outline';
  const capColor = getCapacityColor(event.registeredCount, event.maxCapacity);
  const spotsLeft = event.maxCapacity - event.registeredCount;

  if (variant === 'featured') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.featured, style]}>
        <Image source={{ uri: event.imageUrl }} style={styles.featuredImage} />
        <LinearGradient colors={['transparent', 'rgba(8,8,24,0.95)']} style={styles.featuredOverlay}>
          <View style={styles.featuredContent}>
            <View style={styles.catBadge}>
              <Ionicons name={catIcon} size={11} color={catColor} />
              <Text style={[styles.catBadgeText, { color: catColor }]}>{event.category}</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
              </View>
            </View>
            <View style={styles.featuredFooter}>
              <View style={styles.registeredRow}>
                <Ionicons name="people-outline" size={13} color={capColor} />
                <Text style={[styles.registeredText, { color: capColor }]}>
                  {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                </Text>
              </View>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.featuredBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.featuredBtnText}>View →</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
        <View style={[styles.featuredBadge, { backgroundColor: 'rgba(139,92,246,0.9)' }]}>
          <Ionicons name="star" size={11} color="#fff" />
          <Text style={styles.featuredBadgeText}>FEATURED</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.compact, style]}>
        <Image source={{ uri: event.imageUrl }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <View style={[styles.smallCatBadge, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
            <Text style={[styles.smallCatText, { color: catColor }]}>{event.category}</Text>
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textTertiary} />
            <Text style={styles.compactMeta}>{formatDate(event.date)} · {event.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.textTertiary} />
            <Text style={styles.compactMeta} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
      </TouchableOpacity>
    );
  }

  // Default card
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, style]}>
      <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={[styles.smallCatBadge, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
            <Ionicons name={catIcon} size={11} color={catColor} />
            <Text style={[styles.smallCatText, { color: catColor }]}>{event.category}</Text>
          </View>
          <View style={[styles.spotsChip, { backgroundColor: capColor + '22' }]}>
            <Text style={[styles.spotsText, { color: capColor }]}>
              {spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textTertiary} />
            <Text style={styles.metaText}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={COLORS.textTertiary} />
            <Text style={styles.metaText}>{event.time}</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={13} color={COLORS.textTertiary} />
          <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.orgRow}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>{event.organizer.name[0]}</Text>
            </View>
            <Text style={styles.orgName} numberOfLines={1}>{event.organizer.name}</Text>
          </View>
          <View style={styles.capacityBar}>
            <View style={[styles.capacityFill, { width: `${Math.min((event.registeredCount / event.maxCapacity) * 100, 100)}%`, backgroundColor: capColor }]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured
  featured: { height: 260, borderRadius: RADIUS.xl, overflow: 'hidden', marginRight: SPACING.md, width: 320, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  featuredImage: { position: 'absolute', width: '100%', height: '100%' },
  featuredOverlay: { flex: 1, justifyContent: 'flex-end' },
  featuredContent: { padding: SPACING.md },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  featuredTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8, lineHeight: 24 },
  featuredMeta: { gap: 4, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  registeredRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  registeredText: { fontSize: 12, fontWeight: '600' },
  featuredBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full },
  featuredBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  featuredBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  featuredBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  // Default card
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden', marginBottom: SPACING.md },
  cardImage: { width: '100%', height: 140 },
  cardBody: { padding: SPACING.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textTertiary, marginHorizontal: 6 },
  cardFooter: { marginTop: 12, gap: 8 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orgAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary + '33', alignItems: 'center', justifyContent: 'center' },
  orgAvatarText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  orgName: { fontSize: 12, color: COLORS.textTertiary, flex: 1 },
  capacityBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  capacityFill: { height: '100%', borderRadius: 2 },

  // Small badges
  smallCatBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, borderWidth: 1 },
  smallCatText: { fontSize: 10, fontWeight: '700' },
  spotsChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  spotsText: { fontSize: 10, fontWeight: '700' },

  // Compact
  compact: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.sm, gap: SPACING.sm, marginBottom: SPACING.sm },
  compactImage: { width: 70, height: 70, borderRadius: RADIUS.md },
  compactContent: { flex: 1, gap: 4 },
  compactTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 19 },
  compactMeta: { fontSize: 11, color: COLORS.textTertiary },
});
