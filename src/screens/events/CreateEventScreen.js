import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsAPI, CLUBS } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../theme';

const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Social', 'Other'];
const POINTS_OPTIONS = [2, 3, 4, 5];

// ─── ADMIN-ONLY BLOCKER ──────────────────────────────────────────────────────
function AdminOnlyView({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.lockedContainer, { paddingTop: insets.top }]}>
      <View style={styles.lockedContent}>
        <View style={styles.lockedIconWrap}>
          <LinearGradient colors={[COLORS.warning + 'AA', COLORS.warning + '55']} style={styles.lockedIconGrad}>
            <Ionicons name="shield-checkmark" size={48} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.lockedTitle}>Admin Access Only</Text>
        <Text style={styles.lockedDesc}>
          Only authorized BMSCE club admins can create events.
        </Text>

        <View style={styles.lockedInfoCard}>
          <View style={styles.lockedInfoRow}>
            <Ionicons name="information-circle" size={16} color={COLORS.primary} />
            <Text style={styles.lockedInfoTitle}>Want to host an event?</Text>
          </View>
          <Text style={styles.lockedInfoText}>
            Contact your club's admin or faculty coordinator. They'll post it on your behalf.
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.lockedBackBtn}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.lockedBackGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.lockedBackText}>Back to Events</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CreateEventScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // GATE: only admins past this point
  if (!user?.isAdmin) {
    return <AdminOnlyView navigation={navigation} />;
  }

  // Find the admin's club details
  const adminClub = CLUBS.find(c => c.id === user.clubId);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Tech',
    date: '',
    time: '10:00 AM',
    location: '',
    maxCapacity: '',
    imageUrl: '',
    tags: '',
    registrationDeadline: '',
    activityPoints: 3,
    price: 0,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description required';
    else if (form.description.length < 30) e.description = 'Min 30 characters';
    if (!form.date) e.date = 'Date is required';
    if (!form.location.trim()) e.location = 'Venue required';
    if (!form.maxCapacity || isNaN(form.maxCapacity)) e.maxCapacity = 'Valid capacity required';
    if (!form.registrationDeadline) e.registrationDeadline = 'Deadline required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        club: user.clubName,            // auto-set from admin's club
        clubId: user.clubId,            // auto-set from admin's club
        activityPoints: form.activityPoints,
        price: parseInt(form.price) || 0,
        date: new Date(form.date).toISOString(),
        time: form.time,
        location: form.location,
        maxCapacity: parseInt(form.maxCapacity),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        organizer: { name: user.name, email: user.email },
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      };
      await eventsAPI.create(payload, user);
      Alert.alert(
        '🎉 Event Created!',
        `"${form.title}" has been posted under ${user.clubName}. All BMSCE students will be notified.`,
        [{ text: 'View Events', onPress: () => navigation.navigate('Home') }]
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.headerTitle}>Create Event</Text>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={11} color={COLORS.warning} />
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>Posting under {user.clubName}</Text>
        </View>
        <View style={styles.headerIcon}>
          <LinearGradient colors={[COLORS.warning, '#F59E0B']} style={styles.headerIconGrad}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Locked Club Card */}
          {adminClub && (
            <View style={[styles.lockedClubCard, { borderColor: adminClub.color + '55', backgroundColor: adminClub.color + '15' }]}>
              <View style={[styles.lockedClubIcon, { backgroundColor: adminClub.color + '33' }]}>
                <Ionicons name={adminClub.icon} size={20} color={adminClub.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lockedClubLabel}>Hosting Club</Text>
                <Text style={[styles.lockedClubName, { color: adminClub.color }]}>{adminClub.name}</Text>
              </View>
              <Ionicons name="lock-closed" size={16} color={adminClub.color} />
            </View>
          )}

          {/* Basic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <View style={[styles.inputWrap, errors.title && styles.inputError]}>
                <Ionicons name="megaphone-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. HackBMSCE 2025" placeholderTextColor={COLORS.textTertiary} value={form.title} onChangeText={t => set('title', t)} />
              </View>
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description *</Text>
              <View style={[styles.inputWrap, styles.textArea, errors.description && styles.inputError]}>
                <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 0 }]} placeholder="Describe your event..." placeholderTextColor={COLORS.textTertiary} value={form.description} onChangeText={t => set('description', t)} multiline />
              </View>
              <Text style={styles.charCount}>{form.description.length} characters</Text>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const active = form.category === cat;
                  const color = CATEGORY_COLORS[cat] || COLORS.primary;
                  return (
                    <TouchableOpacity key={cat} onPress={() => set('category', cat)} style={[styles.catPill, { borderColor: color + '44', backgroundColor: active ? color + '33' : COLORS.bgInput }, active && { borderColor: color }]}>
                      <Ionicons name={CATEGORY_ICONS[cat] || 'grid-outline'} size={14} color={active ? color : COLORS.textTertiary} />
                      <Text style={[styles.catPillText, { color: active ? color : COLORS.textTertiary }]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Activity Points *</Text>
              <View style={styles.pointsRow}>
                {POINTS_OPTIONS.map(p => {
                  const active = form.activityPoints === p;
                  return (
                    <TouchableOpacity key={p} onPress={() => set('activityPoints', p)} style={[styles.pointChip, active && styles.pointChipActive]}>
                      <Ionicons name="star" size={14} color={active ? '#fff' : COLORS.warning} />
                      <Text style={[styles.pointChipText, active && { color: '#fff' }]}>{p} pts</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Event Price (₹) — max 150</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="cash-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="0 (free) or up to 150" placeholderTextColor={COLORS.textTertiary} value={String(form.price)} onChangeText={t => {
                  const num = parseInt(t) || 0;
                  set('price', Math.min(num, 150));
                }} keyboardType="number-pad" />
              </View>
            </View>
          </View>

          {/* Date & Location */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Date & Location</Text>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Event Date *</Text>
                <View style={[styles.inputWrap, errors.date && styles.inputError]}>
                  <Ionicons name="calendar-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textTertiary} value={form.date} onChangeText={t => set('date', t)} />
                </View>
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>
              <View style={{ width: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Time *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="time-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                  <TextInput style={styles.input} placeholder="10:00 AM" placeholderTextColor={COLORS.textTertiary} value={form.time} onChangeText={t => set('time', t)} />
                </View>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Venue *</Text>
              <View style={[styles.inputWrap, errors.location && styles.inputError]}>
                <Ionicons name="location-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. CSE Block, BMSCE" placeholderTextColor={COLORS.textTertiary} value={form.location} onChangeText={t => set('location', t)} />
              </View>
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Registration Deadline *</Text>
              <View style={[styles.inputWrap, errors.registrationDeadline && styles.inputError]}>
                <Ionicons name="alarm-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textTertiary} value={form.registrationDeadline} onChangeText={t => set('registrationDeadline', t)} />
              </View>
              {errors.registrationDeadline && <Text style={styles.errorText}>{errors.registrationDeadline}</Text>}
            </View>
          </View>

          {/* Additional Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Additional Details</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Max Capacity *</Text>
              <View style={[styles.inputWrap, errors.maxCapacity && styles.inputError]}>
                <Ionicons name="people-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. 100" placeholderTextColor={COLORS.textTertiary} value={form.maxCapacity} onChangeText={t => set('maxCapacity', t)} keyboardType="number-pad" />
              </View>
              {errors.maxCapacity && <Text style={styles.errorText}>{errors.maxCapacity}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tags (comma separated)</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="pricetag-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. AI, hackathon" placeholderTextColor={COLORS.textTertiary} value={form.tags} onChangeText={t => set('tags', t)} />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Banner URL (optional)</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="image-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="https://..." placeholderTextColor={COLORS.textTertiary} value={form.imageUrl} onChangeText={t => set('imageUrl', t)} autoCapitalize="none" />
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.warning, '#F59E0B']} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name={loading ? 'hourglass-outline' : 'rocket-outline'} size={20} color="#fff" />
              <Text style={styles.submitBtnText}>{loading ? 'Publishing...' : 'Publish & Notify Students'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, backgroundColor: COLORS.warning + '22', borderWidth: 1, borderColor: COLORS.warning + '44' },
  adminBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.warning, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 22 },
  headerIconGrad: { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: SPACING.lg },

  lockedClubCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1.5, marginBottom: SPACING.lg },
  lockedClubIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  lockedClubLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  lockedClubName: { fontSize: 16, fontWeight: '800' },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.lg, marginBottom: SPACING.lg },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
  fieldGroup: { marginBottom: SPACING.md },
  row: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, minHeight: 48 },
  inputError: { borderColor: COLORS.danger },
  textArea: { alignItems: 'flex-start', paddingVertical: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  charCount: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'right', marginTop: 4 },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 4, marginLeft: 4 },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  catPillText: { fontSize: 12, fontWeight: '600' },
  pointsRow: { flexDirection: 'row', gap: 8 },
  pointChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 11, borderRadius: RADIUS.md, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.warning + '33' },
  pointChipActive: { backgroundColor: COLORS.warning, borderColor: COLORS.warning },
  pointChipText: { fontSize: 13, fontWeight: '700', color: COLORS.warning },
  submitBtn: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.lg, gap: 10, shadowColor: COLORS.warning, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Locked view
  lockedContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', paddingHorizontal: SPACING.lg },
  lockedContent: { alignItems: 'center' },
  lockedIconWrap: { marginBottom: SPACING.lg },
  lockedIconGrad: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.warning, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 14 },
  lockedTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  lockedDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: SPACING.lg, paddingHorizontal: SPACING.md },
  lockedInfoCard: { width: '100%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.primary + '33', padding: SPACING.md, marginBottom: SPACING.lg },
  lockedInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  lockedInfoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  lockedInfoText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  lockedBackBtn: { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden' },
  lockedBackGrad: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  lockedBackText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});