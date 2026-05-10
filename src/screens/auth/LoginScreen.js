import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { CLUBS } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme';

// Map clubId to admin email prefix (e.g. 'cultural' club → 'cult.admin' emails)
const CLUB_EMAIL_PREFIX = {
  ieee: 'ieee',
  aiml: 'aiml',
  cultural: 'cult',
  sports: 'spo',
  photography: 'photo',
  literary: 'lit',
};

const ROLES = [
  { id: 'student', label: 'Student', icon: 'school', desc: 'Browse & join events' },
  { id: 'admin', label: 'Admin', icon: 'shield-checkmark', desc: 'Manage your club\'s events' },
];

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState('student');
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  // When admin role + club selected, auto-suggest email format
  useEffect(() => {
    if (role === 'admin' && selectedClubId && !email) {
      const prefix = CLUB_EMAIL_PREFIX[selectedClubId] || selectedClubId;
      setEmail(`${prefix}.admin1@bmsce.ac.in`);
    }
  }, [role, selectedClubId]);

  // Reset email when role/club changes
  useEffect(() => {
    if (role === 'student') setSelectedClubId(null);
  }, [role]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    const errs = {};
    if (role === 'admin' && !selectedClubId) errs.club = 'Please select your club';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!email.toLowerCase().endsWith('@bmsce.ac.in')) errs.email = 'Only @bmsce.ac.in emails allowed';
    else if (role === 'admin' && selectedClubId) {
      const prefix = CLUB_EMAIL_PREFIX[selectedClubId] || selectedClubId;
      if (!email.toLowerCase().startsWith(`${prefix}.admin`)) {
        errs.email = `Use ${prefix}.admin1 or ${prefix}.admin2 format`;
      }
    }
    if (!password) errs.password = 'Password is required';
    else if (password.length < 1) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) { shake(); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password, role);
    } catch (e) {
      Alert.alert('Login Failed', e.message || 'Invalid credentials.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0d0d2b', '#080818', '#0a0a1a']} style={styles.container}>
      <View style={[styles.glow, { top: -60, left: -60, backgroundColor: 'rgba(139,92,246,0.12)' }]} />
      <View style={[styles.glow, { bottom: 100, right: -80, backgroundColor: 'rgba(59,130,246,0.08)' }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
            <View style={styles.logoWrap}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.logo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.logoText}>CS</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headline}>Welcome Back 👋</Text>
            <Text style={styles.subtext}>Sign in to your CampusSync account</Text>
          </Animated.View>

          {/* Role Selector */}
          <Animated.View style={[styles.roleSection, { opacity: fadeAnim }]}>
            <Text style={styles.sectionLabel}>I am a...</Text>
            <View style={styles.roleRow}>
              {ROLES.map(r => {
                const active = role === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    activeOpacity={0.85}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                  >
                    {active
                      ? <LinearGradient colors={COLORS.gradientPrimary} style={styles.roleIcon}>
                          <Ionicons name={r.icon} size={22} color="#fff" />
                        </LinearGradient>
                      : <View style={[styles.roleIcon, { backgroundColor: COLORS.bgInput }]}>
                          <Ionicons name={r.icon} size={22} color={COLORS.textTertiary} />
                        </View>
                    }
                    <Text style={[styles.roleLabel, active && { color: COLORS.textPrimary }]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Club selector — only for admin */}
          {role === 'admin' && (
            <Animated.View style={[styles.clubSection, { opacity: fadeAnim }]}>
              <Text style={styles.sectionLabel}>Which club are you from?</Text>
              <View style={styles.clubGrid}>
                {CLUBS.map(c => {
                  const active = selectedClubId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => {
                        const prefix = CLUB_EMAIL_PREFIX[c.id] || c.id;
                        setSelectedClubId(c.id);
                        setEmail(`${prefix}.admin1@bmsce.ac.in`);
                        setErrors(p => ({ ...p, club: null }));
                      }}
                      activeOpacity={0.85}
                      style={[styles.clubCard, { borderColor: active ? c.color : COLORS.bgCardBorder, backgroundColor: active ? c.color + '22' : COLORS.bgCard }]}
                    >
                      <View style={[styles.clubIcon, { backgroundColor: c.color + '33' }]}>
                        <Ionicons name={c.icon} size={20} color={c.color} />
                      </View>
                      <Text style={[styles.clubLabel, active && { color: c.color, fontWeight: '700' }]}>{c.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.club && <Text style={styles.errorText}>{errors.club}</Text>}
            </Animated.View>
          )}

          {/* Form Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }]}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>BMSCE Email</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={errors.email ? COLORS.danger : COLORS.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={role === 'admin' ? `${CLUB_EMAIL_PREFIX[selectedClubId] || 'club'}.admin1@bmsce.ac.in` : 'aastha@bmsce.ac.in'}
                  placeholderTextColor={COLORS.textTertiary}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors(p => ({ ...p, email: null })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.password ? COLORS.danger : COLORS.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textTertiary}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors(p => ({ ...p, password: null })); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85} style={styles.btnWrap}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <Text style={styles.btnText}>Signing in...</Text>
                  : <View style={styles.btnInner}>
                      <Text style={styles.btnText}>Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </View>
                }
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {role === 'student' && (
            <Animated.View style={[styles.registerWrap, { opacity: fadeAnim }]}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg },
  glow: { position: 'absolute', width: 250, height: 250, borderRadius: 125 },
  backBtn: { width: 40, marginBottom: SPACING.md },

  logoWrap: { marginBottom: SPACING.sm },
  logo: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  logoText: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  headline: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12, marginBottom: 6 },
  subtext: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },

  roleSection: { marginTop: SPACING.md },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10, marginLeft: 4 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: 14, alignItems: 'center', gap: 6 },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(139,92,246,0.12)' },
  roleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  roleDesc: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'center' },

  clubSection: { marginTop: SPACING.md },
  clubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubCard: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1.5 },
  clubIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  clubLabel: { flex: 1, fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  adminEmailHint: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 12, padding: 10, backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.warning + '33' },
  adminEmailHintText: { flex: 1, fontSize: 11, color: COLORS.warning, fontWeight: '500', lineHeight: 16 },

  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.md },
  fieldGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, height: 50 },
  inputError: { borderColor: COLORS.danger },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 5, marginLeft: 4 },
  btnWrap: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btn: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  registerWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  registerText: { color: COLORS.textSecondary, fontSize: 14 },
  registerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});