import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Input } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING } from '../../utils/theme';
import { authAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Enter your email address' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setSent(true);
      Toast.show({ type: 'success', text1: 'Reset Link Sent', text2: 'Check your email for instructions' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Request failed', text2: error.response?.data?.detail || error.response?.data?.email?.[0] || 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 60 }}>
        <Text style={{ color: COLORS.text, fontSize: 18 }}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={{ fontSize: 48, textAlign: 'center' }}>{sent ? '✉️' : '🔒'}</Text>
        <Text style={styles.title}>{sent ? 'Check Your Email' : 'Reset Password'}</Text>
        <Text style={styles.subtitle}>
          {sent
            ? `We've sent a password reset link to ${email}`
            : 'Enter your email address and we\'ll send you a reset link'}
        </Text>

        {!sent ? (
          <>
            <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />
          </>
        ) : (
          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.xl },
  content: { flex: 1, justifyContent: 'center', marginTop: -60 },
  title: { ...FONTS.h2, color: COLORS.text, textAlign: 'center', marginTop: SPACING.lg },
  subtitle: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginVertical: SPACING.xl },
});
