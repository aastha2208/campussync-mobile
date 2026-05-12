import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Animated, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { checkPasswordStrength } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme';

const GENDERS = [
  { id: 'male', label: 'Male', icon: 'man-outline' },
  { id: 'female', label: 'Female', icon: 'woman-outline' },
  { id: 'other', label: 'Other', icon: 'person-outline' },
];

// BMSCE Branches
const BRANCHES = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ISE', name: 'Information Science & Engineering' },
  { code: 'AIML', name: 'AI & Machine Learning' },
  { code: 'ECE', name: 'Electronics & Communication' },
  { code: 'EEE', name: 'Electrical & Electronics' },
  { code: 'ETE', name: 'Electronics & Telecommunication' },
  { code: 'EIE', name: 'Electronics & Instrumentation' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'CV', name: 'Civil Engineering' },
  { code: 'CH', name: 'Chemical Engineering' },
  { code: 'IEM', name: 'Industrial Engineering & Management' },
  { code: 'BT', name: 'Biotechnology' },
  { code: 'MD', name: 'Medical Electronics' },
  { code: 'AS', name: 'Aerospace Engineering' },
];

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    name: '', username: '', email: '',
    password: '', confirmPassword: '',
    branch: '', semester: '',
  });
  const [gender, setGender] = useState('female');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [branchPickerVisible, setBranchPickerVisible] = useState(false);
  const [semPickerVisible, setSemPickerVisible] = useState(false);
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

  const passwordStrength = checkPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.includes(' ')) e.username = 'No spaces allowed';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!form.email.toLowerCase().endsWith('@bmsce.ac.in')) e.email = 'Only @bmsce.ac.in emails allowed';
    else if (form.email.toLowerCase().includes('admin')) e.email = 'Admin accounts are pre-registered. Use Login.';
    if (!form.password) e.password = 'Password required';
    else if (!passwordStrength.isStrong) e.password = 'Password is too weak';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.branch.trim()) e.branch = 'Branch is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ ...form, gender, role: 'student', college: 'BMSCE' });
      // Success — navigate back to login with a confirmation message
      Alert.alert(
        '✅ Account Created!',
        `Welcome to CampusSync, ${form.name.split(' ')[0]}! Please log in with your email and password to continue.`,
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0d0d2b', '#080818', '#0a0a1a']} style={styles.container}>
      {/* Branch Picker Modal */}
      <Modal visible={branchPickerVisible} transparent animationType="fade" onRequestClose={() => setBranchPickerVisible(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setBranchPickerVisible(false)}>
          <Pressable style={styles.pickerCard} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Your Branch</Text>
              <TouchableOpacity onPress={() => setBranchPickerVisible(false)} style={styles.pickerClose}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {BRANCHES.map(b => {
                const selected = form.branch === b.code;
                return (
                  <TouchableOpacity
                    key={b.code}
                    activeOpacity={0.7}
                    onPress={() => { set('branch', b.code); setBranchPickerVisible(false); }}
                    style={[styles.pickerRow, selected && styles.pickerRowSelected]}
                  >
                    <View style={[styles.pickerCode, selected && { backgroundColor: COLORS.primary }]}>
                      <Text style={[styles.pickerCodeText, selected && { color: '#fff' }]}>{b.code}</Text>
                    </View>
                    <Text style={[styles.pickerRowText, selected && { color: COLORS.primary, fontWeight: '700' }]}>{b.name}</Text>
                    {selected && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Semester Picker Modal */}
      <Modal visible={semPickerVisible} transparent animationType="fade" onRequestClose={() => setSemPickerVisible(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setSemPickerVisible(false)}>
          <Pressable style={[styles.pickerCard, { maxWidth: 320 }]} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Semester</Text>
              <TouchableOpacity onPress={() => setSemPickerVisible(false)} style={styles.pickerClose}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.semGrid}>
              {SEMESTERS.map(s => {
                const selected = form.semester === s;
                return (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.8}
                    onPress={() => { set('semester', s); setSemPickerVisible(false); }}
                    style={[styles.semChip, selected && styles.semChipSelected]}
                  >
                    <Text style={[styles.semChipText, selected && { color: '#fff', fontWeight: '800' }]}>Sem {s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headline}>Create Student Account 🎓</Text>
            <Text style={styles.subtext}>Only @bmsce.ac.in emails allowed · Admins are pre-registered</Text>
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[styles.inputWrap, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={17} color={errors.name ? COLORS.danger : COLORS.textTertiary} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Aastha Sharma"
                  placeholderTextColor={COLORS.textTertiary}
                  value={form.name}
                  onChangeText={t => set('name', t)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username *</Text>
              <View style={[styles.inputWrap, errors.username && styles.inputError]}>
                <Ionicons name="at-outline" size={17} color={errors.username ? COLORS.danger : COLORS.textTertiary} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="aastha_bmsce"
                  placeholderTextColor={COLORS.textTertiary}
                  value={form.username}
                  onChangeText={t => set('username', t)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>BMSCE Email *</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={17} color={errors.email ? COLORS.danger : COLORS.textTertiary} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="aastha@bmsce.ac.in"
                  placeholderTextColor={COLORS.textTertiary}
                  value={form.email}
                  onChangeText={t => set('email', t)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Gender */}
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

            {/* Branch + Semester — both dropdowns */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Branch *</Text>
                <TouchableOpacity
                  onPress={() => setBranchPickerVisible(true)}
                  activeOpacity={0.85}
                  style={[styles.inputWrap, errors.branch && styles.inputError]}
                >
                  <Ionicons name="git-branch-outline" size={17} color={form.branch ? COLORS.primary : COLORS.textTertiary} style={styles.icon} />
                  <Text style={[styles.input, { paddingVertical: 0 }, !form.branch && { color: COLORS.textTertiary }]}>
                    {form.branch || 'Select branch'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
                {errors.branch && <Text style={styles.errorText}>{errors.branch}</Text>}
              </View>
              <View style={{ width: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Semester</Text>
                <TouchableOpacity
                  onPress={() => setSemPickerVisible(true)}
                  activeOpacity={0.85}
                  style={styles.inputWrap}
                >
                  <Ionicons name="layers-outline" size={17} color={form.semester ? COLORS.primary : COLORS.textTertiary} style={styles.icon} />
                  <Text style={[styles.input, { paddingVertical: 0 }, !form.semester && { color: COLORS.textTertiary }]}>
                    {form.semester ? `Sem ${form.semester}` : 'Select'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={17} color={errors.password ? COLORS.danger : COLORS.textTertiary} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 8 chars, mixed case, number, symbol"
                  placeholderTextColor={COLORS.textTertiary}
                  value={form.password}
                  onChangeText={t => set('password', t)}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPwd(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={17} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Password strength meter */}
            {form.password.length > 0 && (
              <View style={styles.strengthBlock}>
                <View style={styles.strengthBarRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSeg,
                        { backgroundColor: i <= passwordStrength.score ? passwordStrength.color : COLORS.bgInput }
                      ]}
                    />
                  ))}
                  <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
                </View>
                <View style={styles.strengthChecks}>
                  {[
                    { key: 'length', label: '8+ characters' },
                    { key: 'uppercase', label: 'Uppercase' },
                    { key: 'lowercase', label: 'Lowercase' },
                    { key: 'number', label: 'Number' },
                    { key: 'special', label: 'Special char' },
                  ].map(c => (
                    <View key={c.key} style={styles.strengthCheckItem}>
                      <Ionicons
                        name={passwordStrength.checks[c.key] ? 'checkmark-circle' : 'ellipse-outline'}
                        size={11}
                        color={passwordStrength.checks[c.key] ? COLORS.accent : COLORS.textTertiary}
                      />
                      <Text style={[styles.strengthCheckText, passwordStrength.checks[c.key] && { color: COLORS.accent }]}>{c.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={[styles.inputWrap, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={17} color={errors.confirmPassword ? COLORS.danger : COLORS.textTertiary} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Repeat password"
                  placeholderTextColor={COLORS.textTertiary}
                  value={form.confirmPassword}
                  onChangeText={t => set('confirmPassword', t)}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={styles.btnWrap}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
                {!loading && <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.loginWrap}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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

  // Branch & Semester picker modals
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(8,8,24,0.97)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  pickerCard: { width: '100%', maxWidth: 480, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.bgCardBorder, overflow: 'hidden' },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.bgCardBorder },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  pickerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.lg, paddingVertical: 12 },
  pickerRowSelected: { backgroundColor: COLORS.primary + '11' },
  pickerCode: { minWidth: 52, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.bgCardBorder },
  pickerCodeText: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5 },
  pickerRowText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },

  // Semester grid
  semGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: SPACING.lg },
  semChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: RADIUS.full, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.bgCardBorder, minWidth: 80, alignItems: 'center' },
  semChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  semChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  headline: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  subtext: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg },
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

  // Password strength
  strengthBlock: { marginTop: -SPACING.sm, marginBottom: SPACING.md, padding: 10, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  strengthBarRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  strengthSeg: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', marginLeft: 6, minWidth: 50 },
  strengthChecks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  strengthCheckItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  strengthCheckText: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '500' },

  btnWrap: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btn: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});