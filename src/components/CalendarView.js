import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_COLORS = {
  Tech: COLORS.primary,
  Cultural: '#EC4899',
  Sports: '#F59E0B',
  Workshop: '#10B981',
  Academic: '#06B6D4',
  Social: '#8B5CF6',
  Other: '#6366F1',
};

export default function CalendarView({ events, onEventPress, registeredEvents = [] }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // Group events by date (YYYY-MM-DD format)
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const getEventsOnDay = (day) => {
    const key = `${currentYear}-${currentMonth}-${day}`;
    return eventsByDate[key] || [];
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarCells = [];

  // Empty cells for offset
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const isSelected = (day) =>
    selectedDate &&
    day === selectedDate.day &&
    currentMonth === selectedDate.month &&
    currentYear === selectedDate.year;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleDayPress = (day) => {
    const events = getEventsOnDay(day);
    if (events.length === 0) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate({ day, month: currentMonth, year: currentYear });
  };

  const selectedDayEvents = selectedDate ? getEventsOnDay(selectedDate.day) : [];

  return (
    <View style={styles.container}>
      {/* Month header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.monthText}>{MONTHS[currentMonth]} {currentYear}</Text>
          <Text style={styles.monthSub}>{events.length} events this view</Text>
        </View>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Day labels */}
      <View style={styles.dayRow}>
        {DAYS.map(d => (
          <View key={d} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarCells.map((day, i) => {
          if (day === null) {
            return <View key={i} style={styles.cell} />;
          }

          const dayEvents = getEventsOnDay(day);
          const hasEvents = dayEvents.length > 0;
          const today = isToday(day);
          const selected = isSelected(day);
          const isRegistered = dayEvents.some(e => registeredEvents.includes(e._id));

          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
              style={styles.cell}
              disabled={!hasEvents && !today}
            >
              <View style={[
                styles.cellInner,
                today && styles.cellToday,
                selected && styles.cellSelected,
              ]}>
                <Text style={[
                  styles.cellNumber,
                  today && styles.cellNumberToday,
                  selected && styles.cellNumberSelected,
                  hasEvents && !today && !selected && styles.cellNumberHasEvents,
                ]}>
                  {day}
                </Text>

                {/* Event dots */}
                {hasEvents && (
                  <View style={styles.dotsRow}>
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.dot,
                          { backgroundColor: CATEGORY_COLORS[e.category] || COLORS.primary }
                        ]}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={styles.moreText}>+{dayEvents.length - 3}</Text>
                    )}
                  </View>
                )}

                {/* Registered indicator */}
                {isRegistered && !selected && (
                  <View style={styles.registeredBadge}>
                    <Ionicons name="checkmark" size={8} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day events */}
      {selectedDate && selectedDayEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            {DAYS[new Date(selectedDate.year, selectedDate.month, selectedDate.day).getDay()]}, {selectedDate.day} {MONTHS[selectedDate.month].slice(0, 3)}
          </Text>
          <Text style={styles.eventsCount}>{selectedDayEvents.length} event{selectedDayEvents.length > 1 ? 's' : ''} scheduled</Text>

          {selectedDayEvents.map(event => {
            const cat = CATEGORY_COLORS[event.category] || COLORS.primary;
            const isReg = registeredEvents.includes(event._id);
            return (
              <TouchableOpacity
                key={event._id}
                onPress={() => onEventPress(event)}
                activeOpacity={0.85}
                style={[styles.eventCard, { borderLeftColor: cat }]}
              >
                <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.eventTitleRow}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                    {isReg && (
                      <View style={styles.regChip}>
                        <Ionicons name="checkmark-circle" size={10} color={COLORS.accent} />
                        <Text style={styles.regChipText}>Registered</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.eventMetaRow}>
                    <Ionicons name="time-outline" size={11} color={COLORS.textTertiary} />
                    <Text style={styles.eventMetaText}>{event.time}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Ionicons name="location-outline" size={11} color={COLORS.textTertiary} />
                    <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
                  </View>
                  <View style={styles.eventBottomRow}>
                    <View style={[styles.catChip, { backgroundColor: cat + '22' }]}>
                      <Text style={[styles.catChipText, { color: cat }]}>{event.category}</Text>
                    </View>
                    {event.price > 0 ? (
                      <Text style={styles.priceText}>₹{event.price}</Text>
                    ) : (
                      <Text style={styles.freeText}>Free</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Legend */}
      {!selectedDate && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Categories</Text>
          <View style={styles.legendRow}>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <View key={cat} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Hint */}
      {!selectedDate && (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={13} color={COLORS.textTertiary} />
          <Text style={styles.hintText}>Tap any highlighted date to see events</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg },

  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, paddingVertical: 4 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary + '44' },
  monthText: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  monthSub: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },

  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  dayLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.285%', aspectRatio: 1, padding: 2 },
  cellInner: { flex: 1, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: 'transparent' },
  cellToday: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  cellSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cellNumber: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary },
  cellNumberToday: { color: COLORS.primary, fontWeight: '800' },
  cellNumberSelected: { color: '#fff', fontWeight: '800' },
  cellNumberHasEvents: { color: COLORS.textPrimary, fontWeight: '700' },

  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, position: 'absolute', bottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  moreText: { fontSize: 9, color: COLORS.textSecondary, fontWeight: '800', marginLeft: 2 },

  registeredBadge: { position: 'absolute', top: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },

  // Selected day events
  eventsSection: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.bgCardBorder },
  eventsTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  eventsCount: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '600', marginBottom: SPACING.sm },
  eventCard: { flexDirection: 'row', gap: 10, padding: 10, marginBottom: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderLeftWidth: 3, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  eventImage: { width: 56, height: 56, borderRadius: RADIUS.sm },
  eventTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  regChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, backgroundColor: COLORS.accent + '22' },
  regChipText: { fontSize: 9, color: COLORS.accent, fontWeight: '800' },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  eventMetaText: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '500' },
  metaDot: { fontSize: 10, color: COLORS.textTertiary, marginHorizontal: 2 },
  eventBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  catChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  catChipText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  priceText: { fontSize: 12, color: COLORS.warning, fontWeight: '800' },
  freeText: { fontSize: 11, color: COLORS.accent, fontWeight: '700' },

  // Legend
  legend: { marginTop: SPACING.md, padding: 10, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  legendTitle: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: SPACING.sm },
  hintText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },
});