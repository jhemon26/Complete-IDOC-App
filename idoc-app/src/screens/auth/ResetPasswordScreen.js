import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BrandMark, Button, Card, Input } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { authAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen({ navigation, route }) {
  const token = route?.params?.token || '';
  const uid = route?.params?.uid || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleReset = async () => {
    const nextErrors = {};
    setFormError('');
    if (!newPassword || !confirmPassword) {
      if (!newPassword) nextErrors.newPassword = 'New password is required.';
      if (!confirmPassword) nextErrors.confirmPassword = 'Confirm your password.';
    }
    if (newPassword && newPassword.length < 6) {
      nextErrors.newPassword = 'Use at least 6 characters.';
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError('Please fix the highlighted fields.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, uid, new_password: newPassword });
      Toast.show({ type: 'success', text1: 'Password reset successfully', text2: 'You can now log in' });
      navigation.navigate('Login');
    } catch (error) {
      const msg = error.response?.data?.detail
        || error.response?.data?.token?.[0]
        || error.response?.data?.new_password?.[0]
        || 'Reset failed. The link may have expired.';
      setFormError(msg);
      Toast.show({ type: 'error', text1: 'Reset failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
      </TouchableOpacity>

      <Card style={styles.content} padding={SPACING.xl}>
        <BrandMark size={64} style={{ alignSelf: 'center' }} />
        <Text style={styles.kicker}>Secure update</Text>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Enter your new password below</Text>
        {!!formError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorBannerText}>{formError}</Text>
          </View>
        )}

        <Input
          label="New Password"
          placeholder="Minimum 6 characters"
          value={newPassword}
          onChangeText={(value) => {
            setNewPassword(value);
            if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
            if (formError) setFormError('');
          }}
          secureTextEntry
          error={errors.newPassword}
          helperText="Use at least 6 characters."
          autoComplete="new-password"
          textContentType="none"
          icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
        />
        <Input
          label="Confirm Password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            if (formError) setFormError('');
          }}
          secureTextEntry
          error={errors.confirmPassword}
          autoComplete="new-password"
          textContentType="none"
          icon={<Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} />}
        />
        <Button
          title="Reset Password"
          onPress={handleReset}
          loading={loading}
          icon={<Ionicons name="key-outline" size={18} color={COLORS.white} />}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    top: 54,
    left: SPACING.xl,
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  content: { width: '100%', maxWidth: 430, alignSelf: 'center' },
  kicker: {
    ...FONTS.captionBold,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    textTransform: 'uppercase',
  },
  title: { ...FONTS.h2, color: COLORS.text, textAlign: 'center', marginTop: SPACING.xs },
  subtitle: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginVertical: SPACING.xl },
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
});
