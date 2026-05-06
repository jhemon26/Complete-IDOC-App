import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { BrandMark, Button, Card, Input } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS, ROLE_CONFIG } from '../../utils/theme';
import Toast from 'react-native-toast-message';

const ROLES = ['general', 'doctor', 'pharmacy'];
const ROLE_ICONS = {
  general: 'person-outline',
  doctor: 'medkit-outline',
  pharmacy: 'medical-outline',
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const [step, setStep] = useState(1); // 1: role, 2: info, 3: role-specific
  const [role, setRole] = useState('general');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    // Doctor fields
    specialty: '', experience: '', fee: '', license: '',
    // Pharmacy fields
    pharmacyName: '', pharmacyLicense: '', address: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const totalSteps = role === 'general' ? 2 : 3;
  const progress = (step / totalSteps) * 100;

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
    if (formError) setFormError('');
  };

  const validateBasic = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 6) nextErrors.password = 'Use at least 6 characters.';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.';
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    setErrors(nextErrors);
    setFormError(Object.keys(nextErrors).length ? 'Please complete the highlighted details.' : '');
    return nextErrors;
  };

  const validateRoleDetails = () => {
    const nextErrors = {};
    if (role === 'doctor') {
      if (!form.specialty.trim()) nextErrors.specialty = 'Specialty is required.';
      if (!form.experience.trim()) nextErrors.experience = 'Experience is required.';
      if (!form.fee.trim()) nextErrors.fee = 'Consultation fee is required.';
      if (!form.license.trim()) nextErrors.license = 'Medical license number is required.';
    }
    if (role === 'pharmacy') {
      if (!form.pharmacyName.trim()) nextErrors.pharmacyName = 'Pharmacy name is required.';
      if (!form.pharmacyLicense.trim()) nextErrors.pharmacyLicense = 'License number is required.';
      if (!form.address.trim()) nextErrors.address = 'Address is required.';
    }
    setErrors(nextErrors);
    setFormError(Object.keys(nextErrors).length ? 'Please complete the highlighted details.' : '');
    return nextErrors;
  };

  const goToDetailsOrSubmit = () => {
    const nextErrors = validateBasic();
    if (Object.keys(nextErrors).length) return;
    if (role === 'general') {
      handleRegister();
      return;
    }
    setFormError('');
    setStep(3);
  };

  const handleRegister = async () => {
    const basicErrors = validateBasic();
    const roleErrors = role === 'general' ? {} : validateRoleDetails();
    if (Object.keys(basicErrors).length || Object.keys(roleErrors).length) {
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role,
      };

      if (role === 'doctor') {
        payload.specialty = form.specialty;
        payload.experience = form.experience;
        payload.fee = form.fee;
        payload.license_number = form.license;
      }

      if (role === 'pharmacy') {
        payload.pharmacy_name = form.pharmacyName;
        payload.pharmacy_license = form.pharmacyLicense;
        payload.address = form.address;
      }

      const result = await register(payload);
      if (result.needsApproval) {
        Toast.show({ type: 'info', text1: 'Registration Successful', text2: 'Awaiting approval. You will be notified once approved.' });
        navigation.navigate('Login');
      } else {
        Toast.show({ type: 'success', text1: 'Welcome to I Doc!' });
      }
    } catch (error) {
      const message = error.message || 'Registration failed. Please try again.';
      setFormError(message);
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: message });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <BrandMark size={52} />
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Step {step} of {totalSteps}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        {!!formError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorBannerText}>{formError}</Text>
          </View>
        )}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <Card padding={SPACING.xl}>
            <Text style={styles.stepTitle}>I am a...</Text>
            {ROLES.map((r) => {
              const config = ROLE_CONFIG[r];
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.roleCard,
                    role === r && { borderColor: config.color, backgroundColor: config.color + '10' },
                  ]}
                >
                  <View style={[styles.roleIcon, { backgroundColor: config.color + '20' }]}>
                    <Ionicons name={ROLE_ICONS[r]} size={24} color={config.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleName, role === r && { color: config.color }]}>
                      {config.label}
                    </Text>
                    <Text style={styles.roleDesc}>{config.description}</Text>
                  </View>
                  <View style={[styles.radioOuter, role === r && { borderColor: config.color, backgroundColor: config.color }]}>
                    {role === r ? (
                      <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
            <Button
              title="Continue"
              onPress={() => setStep(2)}
              style={{ marginTop: SPACING.xl }}
              icon={<Ionicons name="arrow-forward" size={18} color={COLORS.white} />}
            />
          </Card>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <Card padding={SPACING.xl}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Input label="Full Name" placeholder="Enter your full name" value={form.name} onChangeText={(v) => updateForm('name', v)} autoCapitalize="words" error={errors.name} autoComplete="off" textContentType="none" icon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Email" placeholder="Enter your email" value={form.email} onChangeText={(v) => updateForm('email', v)} keyboardType="email-address" error={errors.email} autoComplete="off" textContentType="none" icon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Phone" placeholder="Enter phone number" value={form.phone} onChangeText={(v) => updateForm('phone', v)} keyboardType="phone-pad" error={errors.phone} autoComplete="off" textContentType="none" icon={<Ionicons name="call-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Password" placeholder="Min 6 characters" value={form.password} onChangeText={(v) => updateForm('password', v)} secureTextEntry error={errors.password} autoComplete="new-password" textContentType="none" helperText="Use at least 6 characters." icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Confirm Password" placeholder="Re-enter password" value={form.confirmPassword} onChangeText={(v) => updateForm('confirmPassword', v)} secureTextEntry error={errors.confirmPassword} autoComplete="new-password" textContentType="none" icon={<Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} />} />

            <View style={styles.btnRow}>
              <Button title="Back" onPress={() => setStep(1)} variant="outline" style={{ flex: 1, marginRight: 8 }} />
              <Button
                title={role === 'general' ? 'Sign Up' : 'Continue'}
                onPress={goToDetailsOrSubmit}
                loading={role === 'general' && loading}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </Card>
        )}

        {/* Step 3: Role-specific (Doctor/Pharmacy) */}
        {step === 3 && role === 'doctor' && (
          <Card padding={SPACING.xl}>
            <Text style={styles.stepTitle}>Professional Details</Text>
            <Input label="Specialty" placeholder="e.g. General Medicine, Cardiology" value={form.specialty} onChangeText={(v) => updateForm('specialty', v)} error={errors.specialty} autoComplete="off" textContentType="none" icon={<Ionicons name="medkit-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Experience" placeholder="e.g. 5 years" value={form.experience} onChangeText={(v) => updateForm('experience', v)} error={errors.experience} autoComplete="off" textContentType="none" icon={<Ionicons name="briefcase-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Consultation Fee (THB)" placeholder="e.g. 500" value={form.fee} onChangeText={(v) => updateForm('fee', v)} keyboardType="numeric" error={errors.fee} autoComplete="off" textContentType="none" icon={<Ionicons name="cash-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Medical License Number" placeholder="Enter license number" value={form.license} onChangeText={(v) => updateForm('license', v)} error={errors.license} autoComplete="off" textContentType="none" icon={<Ionicons name="id-card-outline" size={18} color={COLORS.textMuted} />} />

            <View style={styles.btnRow}>
              <Button title="Back" onPress={() => setStep(2)} variant="outline" style={{ flex: 1, marginRight: 8 }} />
              <Button title="Submit" onPress={handleRegister} loading={loading} style={{ flex: 1, marginLeft: 8 }} />
            </View>
            <Text style={styles.noteText}>
              Your registration will be reviewed before activation.
            </Text>
          </Card>
        )}

        {step === 3 && role === 'pharmacy' && (
          <Card padding={SPACING.xl}>
            <Text style={styles.stepTitle}>Pharmacy Details</Text>
            <Input label="Pharmacy Name" placeholder="Enter pharmacy name" value={form.pharmacyName} onChangeText={(v) => updateForm('pharmacyName', v)} error={errors.pharmacyName} autoComplete="off" textContentType="none" icon={<Ionicons name="medical-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="License Number" placeholder="Enter pharmacy license" value={form.pharmacyLicense} onChangeText={(v) => updateForm('pharmacyLicense', v)} error={errors.pharmacyLicense} autoComplete="off" textContentType="none" icon={<Ionicons name="id-card-outline" size={18} color={COLORS.textMuted} />} />
            <Input label="Address" placeholder="Full address" value={form.address} onChangeText={(v) => updateForm('address', v)} multiline numberOfLines={3} error={errors.address} autoComplete="off" textContentType="none" icon={<Ionicons name="location-outline" size={18} color={COLORS.textMuted} />} />

            <View style={styles.btnRow}>
              <Button title="Back" onPress={() => setStep(2)} variant="outline" style={{ flex: 1, marginRight: 8 }} />
              <Button title="Submit" onPress={handleRegister} loading={loading} style={{ flex: 1, marginLeft: 8 }} />
            </View>
            <Text style={styles.noteText}>
              Your pharmacy registration will be reviewed before activation.
            </Text>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl, maxWidth: 620, width: '100%', alignSelf: 'center' },
  header: { marginTop: 50, marginBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.md,
  },
  title: { ...FONTS.h2, color: COLORS.text },
  subtitle: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: SPACING.xs },
  progressTrack: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgElevated,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  progressFill: { height: '100%', borderRadius: RADIUS.full, backgroundColor: COLORS.primary },
  stepTitle: { ...FONTS.h3, color: COLORS.text, marginBottom: SPACING.lg },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  roleName: { ...FONTS.h4, color: COLORS.text },
  roleDesc: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '10',
    borderWidth: 1,
    borderColor: COLORS.danger + '24',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorBannerText: { ...FONTS.captionBold, color: COLORS.danger, marginLeft: SPACING.sm, flex: 1 },
  btnRow: { flexDirection: 'row', marginTop: SPACING.xl },
  noteText: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
