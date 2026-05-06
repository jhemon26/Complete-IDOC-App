import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { BrandMark, Button, Card, Input } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DASHBOARD_NOTES = [
  { label: 'Today', value: 'Video consult 09:30', icon: 'videocam-outline', color: COLORS.doctor },
  { label: 'Pharmacy', value: 'Prescription ready', icon: 'medical-outline', color: COLORS.pharmacy },
  { label: 'Care', value: 'All health records synced', icon: 'shield-checkmark-outline', color: COLORS.success },
];

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleLogin = async () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();
    setFormError('');

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password.trim()) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError('Please fix the highlighted fields.');
      return;
    }

    try {
      await login(trimmedEmail, password);
      Toast.show({ type: 'success', text1: 'Welcome back!' });
    } catch (error) {
      const message = error?.message || 'Login failed';
      const normalized = message.toLowerCase();

      if (normalized.includes('pending') && normalized.includes('approval')) {
        Toast.show({
          type: 'info',
          text1: 'Approval Pending',
          text2: 'Your pharmacy/doctor account is waiting for approval.',
        });
        setFormError('Your account is waiting for approval.');
        return;
      }

      if (normalized.includes('blocked')) {
        Toast.show({ type: 'error', text1: 'Account Blocked', text2: message });
        setFormError(message);
        return;
      }

      Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
      setFormError(message);
    }
  };

  const updateEmail = (value) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    if (formError) setFormError('');
  };

  const updatePassword = (value) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
    if (formError) setFormError('');
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
        <View style={[styles.authShell, wide && styles.authShellWide]}>
          <View style={[styles.brandPanel, wide && styles.brandPanelWide]}>
            <BrandMark size={72} />
            <Text style={styles.appName}>I Doc</Text>
            <Text style={styles.tagline}>A calmer care workspace for patients, doctors, and pharmacies.</Text>
            <View style={styles.dashboardPreview}>
              {DASHBOARD_NOTES.map((item) => (
                <View key={item.label} style={styles.previewRow}>
                  <View style={[styles.previewIcon, { backgroundColor: item.color + '14' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewLabel}>{item.label}</Text>
                    <Text style={styles.previewValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Card style={[styles.formCard, wide && styles.formCardWide]} padding={SPACING.xl}>
            <View style={styles.formHeaderRow}>
              <View>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Sign in to continue to your role dashboard.</Text>
              </View>
              <View style={styles.formIcon}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
              </View>
            </View>
            {!!formError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
                <Text style={styles.errorBannerText}>{formError}</Text>
              </View>
            )}
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={updateEmail}
              keyboardType="email-address"
              error={errors.email}
              autoComplete="off"
              textContentType="none"
              returnKeyType="next"
              icon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={updatePassword}
              secureTextEntry
              error={errors.password}
              autoComplete="new-password"
              textContentType="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              icon={<Ionicons name="log-in-outline" size={18} color={COLORS.white} />}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl, justifyContent: 'center' },
  authShell: { width: '100%', maxWidth: 980, alignSelf: 'center', paddingTop: SPACING.xxxl },
  authShellWide: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl },
  brandPanel: { alignItems: 'center', marginBottom: SPACING.xl },
  brandPanelWide: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  appName: {
    ...FONTS.h1,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  tagline: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    maxWidth: 440,
  },
  dashboardPreview: {
    width: '100%',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  previewIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  previewLabel: { ...FONTS.small, color: COLORS.textMuted },
  previewValue: { ...FONTS.captionBold, color: COLORS.text, marginTop: 2 },
  formCard: { width: '100%', maxWidth: 450, alignSelf: 'center' },
  formCardWide: { flex: 1, maxWidth: 460 },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  formIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    marginLeft: SPACING.md,
  },
  formTitle: { ...FONTS.h2, color: COLORS.text },
  formSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.xl, marginTop: -SPACING.sm },
  forgotText: { ...FONTS.captionBold, color: COLORS.primary },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  registerText: { ...FONTS.body, color: COLORS.textSecondary },
  registerLink: { ...FONTS.bodyBold, color: COLORS.primary },
});
