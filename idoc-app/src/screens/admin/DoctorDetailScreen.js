import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar, Badge, Button, Card, Divider } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { adminAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function AdminDoctorDetailScreen({ navigation, route }) {
  const { item } = route.params;
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const approvalType = item?.type || item?.role || 'doctor';
  const typeColor = approvalType === 'doctor' ? COLORS.doctor : COLORS.pharmacy;
  const typeLabel = approvalType.charAt(0).toUpperCase() + approvalType.slice(1);

  const infoRows = [
    { label: 'Email', value: item?.email },
    { label: 'Phone', value: item?.phone || 'Not provided' },
    { label: 'Role', value: typeLabel },
    { label: 'License Number', value: item?.license || item?.license_number || 'Not provided' },
    ...(approvalType === 'doctor' ? [
      { label: 'Specialty', value: item?.specialty || 'Not specified' },
      { label: 'Experience', value: item?.experience || 'Not specified' },
      { label: 'Consultation Fee', value: item?.fee ? `฿${item.fee}` : 'Not specified' },
      { label: 'Bio', value: item?.bio || 'No bio provided' },
    ] : [
      { label: 'Pharmacy Name', value: item?.pharmacy_name || item?.name },
      { label: 'Address', value: item?.address || 'Not provided' },
      { label: 'Delivery Time', value: item?.delivery_time || 'Not specified' },
    ]),
    { label: 'Submitted', value: item?.submitted ? new Date(item.submitted).toLocaleDateString() : 'N/A' },
  ];

  const handleApprove = () => {
    Alert.alert(
      'Approve Application',
      `Approve ${item?.name}? They will be notified and gain full access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setApproving(true);
            try {
              if (approvalType === 'doctor') {
                await adminAPI.approveDoctor(item.id);
              } else {
                await adminAPI.approvePharmacy(item.id);
              }
              Toast.show({ type: 'success', text1: 'Approved', text2: `${item?.name} has been approved and notified` });
              navigation.goBack();
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Approval failed', text2: error.response?.data?.error || 'Please try again' });
            } finally {
              setApproving(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Application',
      `Reject ${item?.name}? This action will notify them of the rejection.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setRejecting(true);
            try {
              await adminAPI.rejectUser(item.id, { reason: 'Application rejected after admin review.' });
              Toast.show({ type: 'error', text1: 'Rejected', text2: `${item?.name}'s application has been rejected` });
              navigation.goBack();
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Rejection failed', text2: error.response?.data?.error || 'Please try again' });
            } finally {
              setRejecting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar name={item?.name} size={80} color={typeColor} />
        <Text style={{ ...FONTS.h2, color: COLORS.text, marginTop: SPACING.md, textAlign: 'center' }}>
          {item?.name}
        </Text>
        <Badge text={typeLabel} color={typeColor} style={{ marginTop: SPACING.sm }} />
        <Badge
          text="Pending Review"
          color={COLORS.warning}
          style={{ marginTop: 6 }}
        />
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Text style={{ ...FONTS.h4, color: COLORS.text, marginBottom: SPACING.md }}>Application Details</Text>
        {infoRows.map((row, i) => (
          <View key={i}>
            {i > 0 && <Divider />}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue} numberOfLines={row.label === 'Bio' || row.label === 'Address' ? 4 : 1}>
                {row.value || '—'}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Documents */}
      {item?.documents?.length > 0 && (
        <Card style={styles.infoCard}>
          <Text style={{ ...FONTS.h4, color: COLORS.text, marginBottom: SPACING.md }}>
            Uploaded Documents ({item.documents.length})
          </Text>
          {item.documents.map((doc, i) => (
            <TouchableOpacity
              key={i}
              style={styles.docItem}
              onPress={() => {
                const url = typeof doc === 'string' ? doc : doc.url || doc.file;
                if (url) Linking.openURL(url);
              }}
            >
              <Ionicons name="document-outline" size={20} color={COLORS.primary} />
              <Text style={styles.docName} numberOfLines={1}>
                {typeof doc === 'string' ? `Document ${i + 1}` : doc.name || `Document ${i + 1}`}
              </Text>
              <Ionicons name="open-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* No documents */}
      {(!item?.documents || item.documents.length === 0) && (
        <Card style={styles.infoCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="document-outline" size={20} color={COLORS.textMuted} style={{ marginRight: SPACING.sm }} />
            <Text style={{ ...FONTS.body, color: COLORS.textSecondary }}>No documents uploaded</Text>
          </View>
        </Card>
      )}

      {/* Admin Note */}
      <Card style={[styles.infoCard, { backgroundColor: COLORS.warning + '10', borderColor: COLORS.warning + '40', borderWidth: 1 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} style={{ marginRight: SPACING.sm, marginTop: 2 }} />
          <Text style={{ ...FONTS.caption, color: COLORS.warning, flex: 1 }}>
            Approving will send an immediate notification to the applicant and activate their account. Rejection will also notify them with the reason.
          </Text>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Approve"
          onPress={handleApprove}
          loading={approving}
          style={{ flex: 1 }}
        />
        <Button
          title="Reject"
          variant="outline"
          color={COLORS.danger}
          onPress={handleReject}
          loading={rejecting}
          style={{ flex: 1 }}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  profileHeader: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  infoCard: { marginHorizontal: SPACING.xl, marginBottom: SPACING.md },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  infoLabel: { ...FONTS.caption, color: COLORS.textSecondary, flex: 1 },
  infoValue: { ...FONTS.captionBold, color: COLORS.text, flex: 2, textAlign: 'right' },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  docName: { ...FONTS.body, color: COLORS.primary, flex: 1, marginLeft: SPACING.sm },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
