import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const features = [
    { icon: 'calendar', label: '18+ Events', color: COLORS.primary },
    { icon: 'people', label: '6 Clubs', color: COLORS.accent },
    { icon: 'star', label: 'Earn Points', color: COLORS.warning },
  ];

  return (
    <LinearGradient colors={['#0d0d2b', '#080818', '#0a0a1a']} style={styles.container}>
      {/* Background glows */}
      <View style={[styles.glow, { top: 80, left: -80, backgroundColor: 'rgba(139,92,246,0.15)' }]} />
      <View style={[styles.glow, { bottom: 200, right: -100, backgroundColor: 'rgba(59,130,246,0.10)' }]} />

      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 30 }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.logo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.logoText}>CS</Text>
          </LinearGradient>
        </Animated.View>

        {/* Headline */}
        <Animated.View style={[styles.headerBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.appName}>CampusSync</Text>
          <Text style={styles.tagline}>Your Campus, Connected</Text>
          <Text style={styles.subtitle}>The official event hub of BMS College of Engineering</Text>
        </Animated.View>

        {/* Feature pills */}
        <Animated.View style={[styles.featuresRow, { opacity: fadeAnim }]}>
          {features.map((f, i) => (
            <View key={i} style={[styles.featureChip, { borderColor: f.color + '44' }]}>
              <Ionicons name={f.icon} size={14} color={f.color} />
              <Text style={[styles.featureText, { color: f.color }]}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Question */}
        <Animated.View style={[styles.questionBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.questionText}>Have you registered before?</Text>
          <Text style={styles.questionHint}>Pick an option to continue</Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttonsBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* YES — Login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.85} style={styles.btnPrimaryWrap}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.btnPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <View style={styles.btnTextBlock}>
                <Text style={styles.btnPrimaryTitle}>Yes, I have an account</Text>
                <Text style={styles.btnPrimarySub}>Continue to Login</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* NO — Register */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.85} style={styles.btnSecondaryWrap}>
            <View style={styles.btnSecondary}>
              <Ionicons name="person-add" size={22} color={COLORS.primary} />
              <View style={styles.btnTextBlock}>
                <Text style={styles.btnSecondaryTitle}>No, I'm new here</Text>
                <Text style={styles.btnSecondarySub}>Create your BMSCE account</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Ionicons name="shield-checkmark" size={13} color={COLORS.textTertiary} />
          <Text style={styles.footerText}>Only @bmsce.ac.in emails accepted</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140 },
  content: { flex: 1, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'space-between' },

  logoSection: { alignItems: 'center' },
  logo: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 16 },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 2 },

  headerBlock: { alignItems: 'center', marginTop: SPACING.lg },
  appName: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 1, marginBottom: 4 },
  tagline: { fontSize: 15, color: COLORS.primary, fontWeight: '600', marginBottom: 12 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 20 },

  featuresRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1 },
  featureText: { fontSize: 12, fontWeight: '700' },

  questionBlock: { alignItems: 'center' },
  questionText: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  questionHint: { fontSize: 13, color: COLORS.textTertiary },

  buttonsBlock: { width: '100%', gap: 12 },
  btnPrimaryWrap: { borderRadius: RADIUS.lg, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  btnTextBlock: { flex: 1 },
  btnPrimaryTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  btnPrimarySub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  btnSecondaryWrap: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnSecondary: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.primary + '44', borderRadius: RADIUS.lg },
  btnSecondaryTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  btnSecondarySub: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },

  footer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },
});