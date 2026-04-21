import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../../theme';

const ROLES = [
  { id: 'student', label: 'Student', icon: 'school-outline', desc: 'Discover & join events' },
  { id: 'organizer', label: 'Organizer', icon: 'megaphone-outline', desc: 'Create & manage events' },
];

const GENDERS = [
  { id: 'male', label: 'Male', icon: 'man-outline' },
  { id: 'female', label: 'Female', icon: 'woman-outline' },
  { id: 'other', label: 'Other', icon: 'person-outline' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    name: '', username: '', email: '',
    password: '', confirmPassword: '',
    branch: '', semester: '',
  });
  const [role, setRole] = useState('student');
  const [gender, setGender] = useState('female');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.includes(' ')) e.username = 'No spaces allowed in username';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!form.email.toLowerCase().endsWith('@bmsce.ac.in')) e.email = 'Only @bmsce.ac.in emails allowed';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.branch.trim()) e.branch = 'Branch is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ ...form, role, gender, college: 'BMSCE' });
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon, field, placeholder, secure, keyboard }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, errors[field] && styles.inputError]}>
        <Ionicons name={icon} size={17} color={errors[field] ? COLORS.danger : COLORS.textTertiary} style={styles.icon} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          value={form[field]}
          onChangeText={t => set(field, t)}
          secureTextEntry={secure && !showPwd}
          keyboardType={keyboard || 'default'}
          autoCapitalize={field === 'email' || field === 'username' ? 'none' : 'words'}
          autoCorrect={false}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
            <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={17} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <LinearGradient colors={['#0d0d2b', '#080818', '#0a0a1a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headline}>Create Account 🎓</Text>
            <Text style={styles.subtext}>Only for BMSCE students · @bmsce.ac.in only</Text>
          </Animated.View>

          {/* Role Selector */}
          <Animated.View style={[styles.roleRow, { opacity: fadeAnim }]}>
            {ROLES.map(r => (
              <TouchableOpacity key={r.id} style={[styles.roleCard, role === r.id && styles.roleCardActive]} onPress={() => setRole(r.id)} activeOpacity={0.8}>
                {role === r.id
                  ? <LinearGradient colors={COLORS.gradientPrimary} style={styles.roleIconWrap}><Ionicons name={r.icon} size={20} color="#fff" /></LinearGradient>
                  : <View style={[styles.roleIconWrap, { backgroundColor: COLORS.bgInput }]}><Ionicons name={r.icon} size={20} color={COLORS.textTertiary} /></View>
                }
                <Text style={[styles.roleLabel, role === r.id && { color: COLORS.textPrimary }]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <InputField label="Full Name *" icon="person-outline" field="name" placeholder="Aastha Sharma" />
            <InputField label="Username *" icon="at-outline" field="username" placeholder="aastha_bmsce" />
            <InputField label="BMSCE Email *" icon="mail-outline" field="email" placeholder="aastha@bmsce.ac.in" keyboard="email-address" />

            {/* Gender Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGender(g.id)}
                    style={[styles.genderChip, gender === g.id && styles.genderChipActive]}
                  >
                    <Ionicons name={g.icon} size={16} color={gender === g.id ? '#fff' : COLORS.textTertiary} />
                    <Text style={[styles.genderText, gender === g.id && { color: '#fff' }]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Branch + Semester */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Branch *</Text>
                <View style={[styles.inputWrap, errors.branch && styles.inputError]}>
                  <Ionicons name="git-branch-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                  <TextInput style={styles.input} placeholder="CSE" placeholderTextColor={COLORS.textTertiary} value={form.branch} onChangeText={t => set('branch', t)} autoCapitalize="characters" />
                </View>
                {errors.branch && <Text style={styles.errorText}>{errors.branch}</Text>}
              </View>
              <View style={{ width: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Semester</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="layers-outline" size={17} color={COLORS.textTertiary} style={styles.icon} />
                  <TextInput style={styles.input} placeholder="4" placeholderTextColor={COLORS.textTertiary} value={form.semester} onChangeText={t => set('semester', t)} keyboardType="number-pad" />
                </View>
              </View>
            </View>

            <InputField label="Password *" icon="lock-closed-outline" field="password" placeholder="Min. 6 characters" secure />
            <InputField label="Confirm Password *" icon="lock-closed-outline" field="confirmPassword" placeholder="Repeat password" secure />

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={styles.btnWrap}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
                {!loading && <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.loginWrap}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg },
  backBtn: { marginBottom: SPACING.lg, width: 40 },
  headline: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  subtext: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  roleRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  roleCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.md, alignItems: 'center', gap: 6 },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(139,92,246,0.12)' },
  roleIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  roleDesc: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'center' },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, padding: SPACING.lg, marginBottom: SPACING.lg },
  fieldGroup: { marginBottom: SPACING.md },
  row: { flexDirection: 'row', marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, height: 50 },
  inputError: { borderColor: COLORS.danger },
  icon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 4, marginLeft: 4 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: RADIUS.md, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  genderChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  genderText: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary },
  btnWrap: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btn: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});