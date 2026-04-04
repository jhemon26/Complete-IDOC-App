import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Input } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING } from '../../utils/theme';
import { authAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen({ navigation, route }) {
  const token = route?.params?.token || '';
  const uid = route?.params?.uid || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Fill in both fields' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password too short', text2: 'Minimum 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
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
      Toast.show({ type: 'error', text1: 'Reset failed', text2: msg });
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
        <Text style={{ fontSize: 48, textAlign: 'center' }}>🔐</Text>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Enter your new password below</Text>

        <Input
          label="New Password"
          placeholder="Minimum 6 characters"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <Input
          label="Confirm Password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <Button title="Reset Password" onPress={handleReset} loading={loading} />
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
