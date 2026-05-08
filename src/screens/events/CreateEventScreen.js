import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsAPI, CLUBS } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../theme';

const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Social', 'Other'];
const POINTS_OPTIONS = [2, 3, 4, 5];

// ─── BMSCE VENUES ─────────────────────────────────────────────────────────────
const VENUE_GROUPS = [
  {
    name: 'PJ Block',
    icon: 'business',
    venues: [
      'PJ Block - Auditorium 1 (Ground Floor)',
      'PJ Block - Auditorium 2 (Ground Floor)',
      'PJ Block - 1st Floor',
      'PJ Block - 2nd Floor',
      'PJ Block - 3rd Floor',
      'PJ Block - 4th Floor',
      'PJ Block - 5th Floor',
      'PJ Block - 6th Floor',
      'PJ Block - 7th Floor',
    ],
  },
  {
    name: 'PG Block',
    icon: 'library',
    venues: [
      'PG Block - 1st Floor',
      'PG Block - 2nd Floor',
      'PG Block - 3rd Floor',
      'PG Block - 4th Floor',
      'PG Block - 5th Floor',
      'PG Block - 6th Floor',
    ],
  },
  {
    name: 'Mechanical Block',
    icon: 'cog',
    venues: [
      'Mechanical Block - 1st Floor',
      'Mechanical Block - 2nd Floor',
      'Mechanical Block - 3rd Floor',
    ],
  },
  {
    name: 'Sports & Outdoor',
    icon: 'football',
    venues: [
      'Indoor Stadium',
      'Open Ground',
      'BMSCE Cricket Ground',
    ],
  },
  {
    name: 'Basement',
    icon: 'arrow-down-circle',
    venues: [
      'Basement 1',
      'Basement 2',
    ],
  },
];

// Flatten all venues for quick lookup
const ALL_VENUES = VENUE_GROUPS.flatMap(g => g.venues);

// Time slots in 30-minute intervals
const TIME_SLOTS = [];
for (let h = 6; h <= 21; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    TIME_SLOTS.push(`${hour12}:${m.toString().padStart(2, '0')} ${ampm}`);
  }
}

// Display "2026-05-20" as "Wed, 20 May 2026"
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

// Build calendar cells for a given month
const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── DATE PICKER COMPONENT ───────────────────────────────────────────────────
function DatePickerModal({ visible, onClose, onSelect, selectedDate, minDate, title = 'Select Date' }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const cells = buildCalendar(viewYear, viewMonth);

  const isToday = (day) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  };

  const isDisabled = (day) => {
    if (!minDate) return false;
    const cellDate = new Date(viewYear, viewMonth, day);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return cellDate < min;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleSelect = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(dateStr);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.calendarModal} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.monthNavText}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calDaysRow}>
            {DAYS_SHORT.map(d => (
              <View key={d} style={styles.calDayCell}>
                <Text style={styles.calDayLabel}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calGrid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={i} style={styles.calCell} />;
              const today = isToday(day);
              const selected = isSelected(day);
              const disabled = isDisabled(day);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => !disabled && handleSelect(day)}
                  disabled={disabled}
                  activeOpacity={0.7}
                  style={styles.calCell}
                >
                  <View style={[
                    styles.calCellInner,
                    today && !selected && styles.calCellToday,
                    selected && styles.calCellSelected,
                  ]}>
                    <Text style={[
                      styles.calCellText,
                      today && !selected && { color: COLORS.primary, fontWeight: '800' },
                      selected && { color: '#fff', fontWeight: '800' },
                      disabled && { color: COLORS.textMuted, opacity: 0.3 },
                    ]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── TIME PICKER COMPONENT ───────────────────────────────────────────────────
function TimePickerModal({ visible, onClose, onSelect, selectedTime, title = 'Select Time' }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.timeModal} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map(t => {
                const selected = t === selectedTime;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => { onSelect(t); onClose(); }}
                    activeOpacity={0.8}
                    style={[styles.timeChip, selected && styles.timeChipSelected]}
                  >
                    <Text style={[styles.timeChipText, selected && { color: '#fff', fontWeight: '800' }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── VENUE PICKER COMPONENT ──────────────────────────────────────────────────
function VenuePickerModal({ visible, onClose, onSelect, selectedVenue }) {
  const [search, setSearch] = useState('');

  const filteredGroups = VENUE_GROUPS.map(group => ({
    ...group,
    venues: group.venues.filter(v => v.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.venues.length > 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.venueModal} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Venue</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.venueSearch}>
            <Ionicons name="search-outline" size={16} color={COLORS.textTertiary} />
            <TextInput
              style={styles.venueSearchInput}
              placeholder="Search venues..."
              placeholderTextColor={COLORS.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
            {filteredGroups.length === 0 ? (
              <View style={styles.venueEmpty}>
                <Ionicons name="search-outline" size={32} color={COLORS.textTertiary} />
                <Text style={styles.venueEmptyText}>No venues match "{search}"</Text>
              </View>
            ) : (
              filteredGroups.map(group => (
                <View key={group.name} style={styles.venueGroup}>
                  <View style={styles.venueGroupHeader}>
                    <Ionicons name={group.icon} size={14} color={COLORS.primary} />
                    <Text style={styles.venueGroupName}>{group.name}</Text>
                  </View>
                  {group.venues.map(v => {
                    const selected = v === selectedVenue;
                    return (
                      <TouchableOpacity
                        key={v}
                        onPress={() => { onSelect(v); onClose(); }}
                        activeOpacity={0.7}
                        style={[styles.venueRow, selected && styles.venueRowSelected]}
                      >
                        <View style={[styles.venueDot, { backgroundColor: selected ? COLORS.primary : COLORS.bgInput }]} />
                        <Text style={[styles.venueRowText, selected && { color: COLORS.primary, fontWeight: '700' }]}>{v}</Text>
                        {selected && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
    endTime: '01:00 PM',
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
  const [roomConflict, setRoomConflict] = useState({ hasConflict: false, conflicts: [] });
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [deadlinePickerVisible, setDeadlinePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(null); // 'start' or 'end' or null
  const [venuePickerVisible, setVenuePickerVisible] = useState(false);

  // Live check room conflicts when venue/date/time changes
  useEffect(() => {
    if (!form.location.trim() || !form.date || !form.time) {
      setRoomConflict({ hasConflict: false, conflicts: [] });
      return;
    }
    setCheckingConflict(true);
    const timer = setTimeout(() => {
      eventsAPI.checkRoomConflict({
        location: form.location,
        date: form.date,
        time: form.time,
        endTime: form.endTime,
      }).then(result => {
        setRoomConflict(result);
        setCheckingConflict(false);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [form.location, form.date, form.time, form.endTime]);

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

    // Block submission if room conflict
    if (roomConflict.hasConflict) {
      const conflict = roomConflict.conflicts[0];
      Alert.alert(
        '⚠️ Room Booking Conflict',
        `"${conflict.title}" by ${conflict.club} is already scheduled at ${conflict.location} on this date around ${conflict.time}.\n\nPlease pick a different time or venue.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

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
        endTime: form.endTime,
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
      {/* Picker Modals */}
      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelect={(d) => set('date', d)}
        selectedDate={form.date}
        minDate={new Date()}
        title="Select Event Date"
      />
      <DatePickerModal
        visible={deadlinePickerVisible}
        onClose={() => setDeadlinePickerVisible(false)}
        onSelect={(d) => set('registrationDeadline', d)}
        selectedDate={form.registrationDeadline}
        minDate={new Date()}
        title="Select Registration Deadline"
      />
      <TimePickerModal
        visible={timePickerVisible === 'start'}
        onClose={() => setTimePickerVisible(null)}
        onSelect={(t) => set('time', t)}
        selectedTime={form.time}
        title="Select Start Time"
      />
      <TimePickerModal
        visible={timePickerVisible === 'end'}
        onClose={() => setTimePickerVisible(null)}
        onSelect={(t) => set('endTime', t)}
        selectedTime={form.endTime}
        title="Select End Time"
      />
      <VenuePickerModal
        visible={venuePickerVisible}
        onClose={() => setVenuePickerVisible(false)}
        onSelect={(v) => set('location', v)}
        selectedVenue={form.location}
      />

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

            {/* Event Date — calendar picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Event Date *</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.85}
                style={[styles.pickerBtn, errors.date && styles.inputError]}
              >
                <Ionicons name="calendar" size={18} color={form.date ? COLORS.primary : COLORS.textTertiary} style={styles.icon} />
                <Text style={[styles.pickerBtnText, !form.date && styles.pickerBtnPlaceholder]}>
                  {form.date ? formatDateDisplay(form.date) : 'Tap to select date'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            {/* Time Range — start + end clock pickers */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Event Time *</Text>
              <View style={styles.timeRangeRow}>
                <TouchableOpacity
                  onPress={() => setTimePickerVisible('start')}
                  activeOpacity={0.85}
                  style={[styles.pickerBtn, { flex: 1 }]}
                >
                  <Ionicons name="time" size={16} color={COLORS.primary} style={styles.icon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timeLabel}>From</Text>
                    <Text style={styles.timeValue}>{form.time}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.timeArrow}>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.textTertiary} />
                </View>

                <TouchableOpacity
                  onPress={() => setTimePickerVisible('end')}
                  activeOpacity={0.85}
                  style={[styles.pickerBtn, { flex: 1 }]}
                >
                  <Ionicons name="time" size={16} color={COLORS.secondary} style={styles.icon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timeLabel}>To</Text>
                    <Text style={styles.timeValue}>{form.endTime}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Venue — dropdown picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Venue *</Text>
              <TouchableOpacity
                onPress={() => setVenuePickerVisible(true)}
                activeOpacity={0.85}
                style={[styles.pickerBtn, errors.location && styles.inputError, roomConflict.hasConflict && styles.inputConflict]}
              >
                <Ionicons name="location" size={18} color={roomConflict.hasConflict ? COLORS.danger : form.location ? COLORS.primary : COLORS.textTertiary} style={styles.icon} />
                <Text style={[styles.pickerBtnText, !form.location && styles.pickerBtnPlaceholder]} numberOfLines={1}>
                  {form.location || 'Tap to select venue'}
                </Text>
                {checkingConflict ? (
                  <Ionicons name="hourglass-outline" size={14} color={COLORS.textTertiary} />
                ) : !checkingConflict && form.location.trim() && form.date && form.time && !roomConflict.hasConflict ? (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                ) : (
                  <Ionicons name="chevron-down" size={16} color={COLORS.textTertiary} />
                )}
              </TouchableOpacity>
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

              {/* Conflict warning banner */}
              {roomConflict.hasConflict && (
                <View style={styles.conflictBanner}>
                  {roomConflict.conflicts.map((c, i) => (
                    <View key={c._id} style={styles.conflictItem}>
                      <Text style={styles.conflictBody}>
                        <Ionicons name="warning" size={13} color={COLORS.danger} />
                        {'  '}
                        <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>"{c.title}"</Text>
                        {' '}by <Text style={{ fontWeight: '700', color: COLORS.warning }}>{c.club}</Text>
                        {' '}is already using <Text style={{ fontWeight: '700' }}>{c.location}</Text> at{' '}
                        <Text style={{ fontWeight: '700' }}>{c.time}</Text>.
                      </Text>
                    </View>
                  ))}
                  <Text style={styles.conflictHint}>Please pick a different time or venue to proceed.</Text>
                </View>
              )}

              {!roomConflict.hasConflict && !checkingConflict && form.location.trim() && form.date && form.time && (
                <View style={styles.availableBanner}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.accent} />
                  <Text style={styles.availableText}>Venue is available at this time ✓</Text>
                </View>
              )}
            </View>

            {/* Registration Deadline — calendar picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Registration Deadline *</Text>
              <TouchableOpacity
                onPress={() => setDeadlinePickerVisible(true)}
                activeOpacity={0.85}
                style={[styles.pickerBtn, errors.registrationDeadline && styles.inputError]}
              >
                <Ionicons name="alarm" size={18} color={form.registrationDeadline ? COLORS.warning : COLORS.textTertiary} style={styles.icon} />
                <Text style={[styles.pickerBtnText, !form.registrationDeadline && styles.pickerBtnPlaceholder]}>
                  {form.registrationDeadline ? formatDateDisplay(form.registrationDeadline) : 'Tap to select deadline'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
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

          <TouchableOpacity onPress={handleSubmit} disabled={loading || roomConflict.hasConflict} activeOpacity={0.85}>
            <LinearGradient
              colors={roomConflict.hasConflict ? ['#475569', '#64748B'] : [COLORS.warning, '#F59E0B']}
              style={[styles.submitBtn, roomConflict.hasConflict && { opacity: 0.6 }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name={loading ? 'hourglass-outline' : 'rocket-outline'} size={20} color="#fff" />
              <Text style={styles.submitBtnText}>
                {loading ? 'Publishing...' : 'Publish & Notify Students'}
              </Text>
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

  // Picker buttons (replace TextInputs)
  pickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, minHeight: 50 },
  pickerBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  pickerBtnPlaceholder: { color: COLORS.textTertiary, fontWeight: '500' },
  timeRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeArrow: { width: 24, alignItems: 'center' },
  timeLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  timeValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 1 },

  // Modal overlay
  modalOverlay: { flex: 1, backgroundColor: 'rgba(8,8,24,0.97)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center' },

  // Calendar modal
  calendarModal: { width: '100%', maxWidth: 400, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  monthNavBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  monthNavText: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  calDaysRow: { flexDirection: 'row', paddingHorizontal: 4, paddingTop: 8 },
  calDayCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  calDayLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 4, paddingBottom: SPACING.md },
  calCell: { width: '14.285%', aspectRatio: 1, padding: 2 },
  calCellInner: { flex: 1, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  calCellToday: { backgroundColor: COLORS.primary + '22', borderWidth: 1, borderColor: COLORS.primary },
  calCellSelected: { backgroundColor: COLORS.primary },
  calCellText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },

  // Time picker modal
  timeModal: { width: '100%', maxWidth: 400, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: SPACING.md },
  timeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.bgCardBorder, minWidth: 92, alignItems: 'center' },
  timeChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },

  // Venue picker modal
  venueModal: { width: '100%', maxWidth: 500, maxHeight: '85%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden' },
  venueSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: SPACING.md, marginVertical: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  venueSearchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  venueGroup: { paddingHorizontal: SPACING.md, paddingBottom: 10 },
  venueGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  venueGroupName: { fontSize: 11, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: RADIUS.md, marginBottom: 4 },
  venueRowSelected: { backgroundColor: COLORS.primary + '15', borderWidth: 1, borderColor: COLORS.primary + '44' },
  venueDot: { width: 8, height: 8, borderRadius: 4 },
  venueRowText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  venueEmpty: { alignItems: 'center', paddingVertical: 30, gap: 6 },
  venueEmptyText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

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
  inputConflict: { borderColor: COLORS.danger, backgroundColor: COLORS.danger + '11' },

  // Conflict banner
  conflictBanner: { marginTop: 8, padding: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.danger + '15', borderWidth: 1, borderColor: COLORS.danger + '44' },
  conflictHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  conflictIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: COLORS.danger + '22', alignItems: 'center', justifyContent: 'center' },
  conflictTitle: { fontSize: 13, fontWeight: '800', color: COLORS.danger },
  conflictItem: { paddingVertical: 4 },
  conflictBody: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  conflictHint: { fontSize: 11, color: COLORS.danger, fontWeight: '600', marginTop: 6, fontStyle: 'italic' },

  availableBanner: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, paddingHorizontal: 8, paddingVertical: 5, borderRadius: RADIUS.sm, backgroundColor: COLORS.accent + '15', alignSelf: 'flex-start' },
  availableText: { fontSize: 11, color: COLORS.accent, fontWeight: '700' },
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