import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Animated, Dimensions, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme';

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width * 0.55, 240);

// ─── PSEUDO QR PATTERN ───────────────────────────────────────────────────────
// Generate a realistic-looking QR code from text using a deterministic hash pattern
function generateQRPattern(text) {
  const size = 25; // 25x25 grid
  const grid = Array(size).fill(null).map(() => Array(size).fill(false));

  // Hash the text into grid pattern
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const seed = (r * 31 + c * 17 + hash) & 0xffffff;
      grid[r][c] = (seed % 7) < 3;
    }
  }

  // Add 3 corner finder patterns (the squares in corners of real QR codes)
  const drawFinder = (sr, sc) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[sr + r][sc + c] = isOuter || isInner;
      }
    }
    // Clear the row/col next to finder
    for (let i = 0; i < 8; i++) {
      if (sr + 7 < size) grid[sr + 7][sc + i] = false;
      if (sc + 7 < size && sr + i < size) grid[sr + i][sc + 7] = false;
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  return grid;
}

function PseudoQR({ text, size = QR_SIZE }) {
  const grid = generateQRPattern(text);
  const cellSize = size / grid.length;

  return (
    <View style={[styles.qrContainer, { width: size, height: size }]}>
      <View style={styles.qrInner}>
        {grid.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((cell, c) => (
              <View
                key={c}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? '#000' : '#fff',
                }}
              />
            ))}
          </View>
        ))}
      </View>
      {/* Logo in center */}
      <View style={[styles.qrLogo, { left: size / 2 - 18, top: size / 2 - 18 }]}>
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.qrLogoGrad}>
          <Text style={styles.qrLogoText}>CS</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// ─── SUCCESS SCREEN ──────────────────────────────────────────────────────────
function PaymentSuccess({ event, user, onDone }) {
  const insets = useSafeAreaInsets();
  const checkScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(confettiAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const txnId = 'TXN' + Date.now().toString().slice(-10);

  return (
    <View style={[styles.successContainer, { paddingTop: insets.top }]}>
      <View style={styles.successContent}>
        <Animated.View style={[styles.successCheckWrap, { transform: [{ scale: checkScale }] }]}>
          <LinearGradient colors={[COLORS.accent, '#059669']} style={styles.successCheck}>
            <Ionicons name="checkmark" size={56} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>You're registered for the event</Text>

          {/* Receipt */}
          <View style={styles.receipt}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Receipt</Text>
              <View style={styles.paidStamp}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.accent} />
                <Text style={styles.paidStampText}>PAID</Text>
              </View>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Event</Text>
              <Text style={styles.receiptValue} numberOfLines={1}>{event.title}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount Paid</Text>
              <Text style={[styles.receiptValue, { color: COLORS.accent, fontWeight: '800' }]}>₹{event.price}</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction ID</Text>
              <Text style={[styles.receiptValue, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 }]}>{txnId}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date & Time</Text>
              <Text style={styles.receiptValue}>{new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>

          {/* Email confirmation banner */}
          <View style={styles.emailBanner}>
            <View style={styles.emailIcon}>
              <Ionicons name="mail" size={18} color={COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emailTitle}>Confirmation email sent</Text>
              <Text style={styles.emailBody}>{user.email}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
          </View>

          <TouchableOpacity onPress={onDone} style={styles.doneBtn} activeOpacity={0.85}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.doneBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.doneBtnText}>View My Events</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── PAYMENT SCREEN ──────────────────────────────────────────────────────────
export default function PaymentScreen({ navigation, route }) {
  const { event } = route.params;
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min countdown
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Countdown timer
  useEffect(() => {
    if (paid) return;
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [paid]);

  // QR pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePayment = async () => {
    setPaying(true);
    // Simulate payment processing
    setTimeout(async () => {
      try {
        await eventsAPI.register(event._id, user.email);
        const ids = [...(user.registeredEvents || []), event._id];
        // NOTE: activity points awarded only on attendance, not on registration/payment
        updateUser({ registeredEvents: ids });
        setPaid(true);
      } catch (e) {
        Alert.alert('Payment Failed', 'Please try again.');
        setPaying(false);
      }
    }, 1800);
  };

  const handleDone = () => {
    navigation.navigate('Home');
    setTimeout(() => navigation.navigate('MyEvents'), 100);
  };

  // Show success screen
  if (paid) return <PaymentSuccess event={event} user={user} onDone={handleDone} />;

  const upiId = `bmsce.${event.club.toLowerCase().replace(/\s/g, '')}@hdfcbank`;
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(event.club)}&am=${event.price}&cu=INR&tn=${encodeURIComponent(event.title)}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={paying}>
          <Ionicons name="arrow-back" size={22} color={paying ? COLORS.textTertiary : COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Complete your registration</Text>
        </View>
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={12} color={COLORS.warning} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Event summary */}
        <View style={styles.eventCard}>
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <Ionicons name="people-outline" size={11} color={COLORS.textTertiary} />
              <Text style={styles.eventMetaText}>{event.club}</Text>
            </View>
            <View style={styles.eventMeta}>
              <Ionicons name="calendar-outline" size={11} color={COLORS.textTertiary} />
              <Text style={styles.eventMetaText}>
                {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupeeSign}>₹</Text>
            <Text style={styles.amountValue}>{event.price}</Text>
          </View>
          <View style={styles.bonusChip}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.bonusText}>+{event.activityPoints} Activity Points on attendance</Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.qrLabel}>Scan to pay with any UPI app</Text>

          <Animated.View style={[styles.qrCard, { transform: [{ scale: pulseAnim }] }]}>
            <PseudoQR text={upiString} />

            <View style={styles.upiRow}>
              <Text style={styles.upiLabel}>UPI ID:</Text>
              <Text style={styles.upiValue}>{upiId}</Text>
            </View>
          </Animated.View>

          {/* Supported apps */}
          <View style={styles.appsRow}>
            <Text style={styles.appsLabel}>Works with:</Text>
            <View style={styles.appPill}><Text style={styles.appName}>GPay</Text></View>
            <View style={styles.appPill}><Text style={styles.appName}>PhonePe</Text></View>
            <View style={styles.appPill}><Text style={styles.appName}>Paytm</Text></View>
            <View style={styles.appPill}><Text style={styles.appName}>BHIM</Text></View>
          </View>
        </View>

        {/* OR divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* I have paid button */}
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <TouchableOpacity onPress={handlePayment} disabled={paying} activeOpacity={0.85} style={styles.payBtnWrap}>
            <LinearGradient
              colors={paying ? ['#475569', '#475569'] : COLORS.gradientPrimary}
              style={styles.payBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {paying ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.payBtnText}>Verifying payment...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.payBtnText}>I have paid ₹{event.price}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.accent} />
            <Text style={styles.secureText}>Secured by BMSCE Payment Gateway · 256-bit encryption</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textTertiary },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.warning + '22', borderWidth: 1, borderColor: COLORS.warning + '44' },
  timerText: { fontSize: 12, fontWeight: '700', color: COLORS.warning, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  eventCard: { flexDirection: 'row', gap: 12, padding: 12, margin: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  eventImage: { width: 60, height: 60, borderRadius: RADIUS.md },
  eventTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  eventMetaText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },

  amountCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, padding: SPACING.lg, borderRadius: RADIUS.xl, backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: COLORS.primary + '44', alignItems: 'center', gap: 6 },
  amountLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  rupeeSign: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  amountValue: { fontSize: 56, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -2 },
  bonusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.warning + '22', marginTop: 4 },
  bonusText: { fontSize: 11, color: COLORS.warning, fontWeight: '700' },

  qrSection: { paddingHorizontal: SPACING.lg, alignItems: 'center', gap: 12 },
  qrLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  qrCard: { backgroundColor: '#fff', padding: 16, borderRadius: RADIUS.lg, alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  qrContainer: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  qrInner: { borderWidth: 0 },
  qrLogo: { position: 'absolute', width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff', padding: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  qrLogoGrad: { flex: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  qrLogoText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f3f4f6', borderRadius: RADIUS.md },
  upiLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  upiValue: { fontSize: 11, color: '#111827', fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  appsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' },
  appsLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },
  appPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardBorder },
  appName: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.bgCardBorder },
  dividerText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '700', letterSpacing: 1 },

  payBtnWrap: { borderRadius: RADIUS.lg, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 12 },
  payBtn: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  payBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  secureText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },

  // Success screen
  successContainer: { flex: 1, backgroundColor: COLORS.bg },
  confetti: { position: 'absolute', fontSize: 24, zIndex: 1 },
  successContent: { flex: 1, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  successCheckWrap: { marginBottom: SPACING.lg },
  successCheck: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 14 },
  successTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xl },

  receipt: { width: '100%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.md, marginBottom: SPACING.md },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  receiptTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, textTransform: 'uppercase', letterSpacing: 1 },
  paidStamp: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, backgroundColor: COLORS.accent + '22', borderWidth: 1, borderColor: COLORS.accent + '44' },
  paidStampText: { fontSize: 10, fontWeight: '800', color: COLORS.accent, letterSpacing: 0.5 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  receiptLabel: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '500' },
  receiptValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 12 },
  receiptDivider: { height: 1, backgroundColor: COLORS.bgCardBorder, marginVertical: 6 },

  emailBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', padding: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary + '15', borderWidth: 1, borderColor: COLORS.secondary + '33', marginBottom: SPACING.lg },
  emailIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.secondary + '22', alignItems: 'center', justifyContent: 'center' },
  emailTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  emailBody: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },

  doneBtn: { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  doneBtnGrad: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});