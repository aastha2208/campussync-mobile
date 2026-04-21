import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../theme';

const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Social', 'Other'];

const TIMES = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'];

function Field({ label, icon, error, children }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function CreateEventScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Tech',
    date: '', time: '10:00 AM', location: '',
    maxCapacity: '', imageUrl: '', tags: '',
    registrationDeadline: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Event title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.length < 30) e.description = 'Description too short (min 30 chars)';
    if (!form.date) e.date = 'Event date is required';
    if (!form.location.trim()) e.location = 'Venue is required';
    if (!form.maxCapacity || isNaN(form.maxCapacity)) e.maxCapacity = 'Valid capacity required';
    if (!form.registrationDeadline) e.registrationDeadline = 'Deadline is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        maxCapacity: parseInt(form.maxCapacity),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        organizer: { name: user?.name || 'You', email: user?.email || '' },
        date: new Date(form.date).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      };
      await eventsAPI.create(payload);
      Alert.alert('🎉 Event Created!', `"${form.title}" has been posted successfully.`, [
        { text: 'View Events', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Create Event</Text>
          <Text style={styles.headerSub}>Post a new campus event</Text>
        </View>
        <View style={styles.headerIcon}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.headerIconGrad}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Basic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>

            <Field label="Event Title *" error={errors.title}>
              <View style={[styles.inputWrap, errors.title && styles.inputError]}>
                <Ionicons name="megaphone-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. HackBMSCE 2025" placeholderTextColor={COLORS.textTertiary} value={form.title} onChangeText={t => set('title', t)} />
              </View>
            </Field>

            <Field label="Description *" error={errors.description}>
              <View style={[styles.inputWrap, styles.textArea, errors.description && styles.inputError]}>
                <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 0 }]} placeholder="Describe your event in detail..." placeholderTextColor={COLORS.textTertiary} value={form.description} onChangeText={t => set('description', t)} multiline numberOfLines={5} />
              </View>
              <Text style={styles.charCount}>{form.description.length}/500</Text>
            </Field>

            {/* Category */}
            <Field label="Category *">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const active = form.category === cat;
                  const color = CATEGORY_COLORS[cat] || COLORS.primary;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => set('category', cat)}
                      style={[styles.catPill, { borderColor: color + '44', backgroundColor: active ? color + '33' : COLORS.bgInput }, active && { borderColor: color }]}
                    >
                      <Ionicons name={CATEGORY_ICONS[cat] || 'grid-outline'} size={14} color={active ? color : COLORS.textTertiary} />
                      <Text style={[styles.catPillText, { color: active ? color : COLORS.textTertiary }]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Field>
          </View>

          {/* Date & Time */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Date & Location</Text>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="Event Date *" error={errors.date}>
                  <View style={[styles.inputWrap, errors.date && styles.inputError]}>
                    <Ionicons name="calendar-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                    <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textTertiary} value={form.date} onChangeText={t => set('date', t)} />
                  </View>
                </Field>
              </View>
              <View style={{ width: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Time *</Text>
                <View style={[styles.inputWrap]}>
                  <Ionicons name="time-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                  <TextInput style={styles.input} placeholder="10:00 AM" placeholderTextColor={COLORS.textTertiary} value={form.time} onChangeText={t => set('time', t)} />
                </View>
              </View>
            </View>

            <Field label="Venue / Location *" error={errors.location}>
              <View style={[styles.inputWrap, errors.location && styles.inputError]}>
                <Ionicons name="location-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. CSE Block, BMSCE" placeholderTextColor={COLORS.textTertiary} value={form.location} onChangeText={t => set('location', t)} />
              </View>
            </Field>

            <Field label="Registration Deadline *" error={errors.registrationDeadline}>
              <View style={[styles.inputWrap, errors.registrationDeadline && styles.inputError]}>
                <Ionicons name="alarm-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textTertiary} value={form.registrationDeadline} onChangeText={t => set('registrationDeadline', t)} />
              </View>
            </Field>
          </View>

          {/* Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Additional Details</Text>

            <Field label="Max Capacity *" error={errors.maxCapacity}>
              <View style={[styles.inputWrap, errors.maxCapacity && styles.inputError]}>
                <Ionicons name="people-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. 100" placeholderTextColor={COLORS.textTertiary} value={form.maxCapacity} onChangeText={t => set('maxCapacity', t)} keyboardType="number-pad" />
              </View>
            </Field>

            <Field label="Tags (comma separated)">
              <View style={styles.inputWrap}>
                <Ionicons name="pricetag-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="e.g. AI, hackathon, prizes" placeholderTextColor={COLORS.textTertiary} value={form.tags} onChangeText={t => set('tags', t)} />
              </View>
            </Field>

            <Field label="Event Banner URL (optional)">
              <View style={styles.inputWrap}>
                <Ionicons name="image-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                <TextInput style={styles.input} placeholder="https://..." placeholderTextColor={COLORS.textTertiary} value={form.imageUrl} onChangeText={t => set('imageUrl', t)} autoCapitalize="none" />
              </View>
            </Field>
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name={loading ? 'hourglass-outline' : 'rocket-outline'} size={20} color="#fff" />
              <Text style={styles.submitBtnText}>{loading ? 'Publishing...' : 'Publish Event'}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 13, color: COLORS.textTertiary, marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 22 },
  headerIconGrad: { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: SPACING.lg },
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
  submitBtn: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.lg, gap: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
  submitBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
