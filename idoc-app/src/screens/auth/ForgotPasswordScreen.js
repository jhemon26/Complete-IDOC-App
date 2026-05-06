import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BrandMark, Button, Card, Input } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { authAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    setEmailError('');
    setFormError('');
    if (!trimmedEmail) {
      setEmailError('Email is required.');
      setFormError('Enter the email connected to your account.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      setFormError('Please check the email format.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(trimmedEmail);
      setSent(true);
      Toast.show({ type: 'success', text1: 'Reset Link Sent', text2: 'Check your email for instructions' });
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.email?.[0] || 'Please try again';
      setFormError(message);
      Toast.show({ type: 'error', text1: 'Request failed', text2: message });
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
        <BrandMark
          size={64}
          color={sent ? COLORS.success : COLORS.primary}
          style={{ alignSelf: 'center' }}
        />
        <Text style={styles.kicker}>{sent ? 'Reset email sent' : 'Account recovery'}</Text>
        <Text style={styles.title}>{sent ? 'Check Your Email' : 'Reset Password'}</Text>
        <Text style={styles.subtitle}>
          {sent
            ? `We've sent a password reset link to ${email}`
            : 'Enter your email address and we\'ll send you a reset link'}
        </Text>
        {!!formError && !sent && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorBannerText}>{formError}</Text>
          </View>
        )}

        {!sent ? (
          <>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError('');
                if (formError) setFormError('');
              }}
              keyboardType="email-address"
              error={emailError}
              autoComplete="off"
              textContentType="none"
              icon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
            />
            <Button
              title="Send Reset Link"
              onPress={handleSubmit}
              loading={loading}
              icon={<Ionicons name="send-outline" size={17} color={COLORS.white} />}
            />
          </>
        ) : (
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            icon={<Ionicons name="log-in-outline" size={18} color={COLORS.white} />}
          />
        )}
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
