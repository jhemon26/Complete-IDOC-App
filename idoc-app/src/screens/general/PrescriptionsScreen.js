import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, Avatar, Badge, Button, EmptyState } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { prescriptionAPI } from '../../services/api';

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await prescriptionAPI.list();
      const rows = Array.isArray(data) ? data : data?.results || [];
      const mapped = rows.map((p) => ({
        id: p.id,
        diagnosis: p.diagnosis || 'No diagnosis recorded',
        doctorName: p.doctor?.name || p.doctor_name || 'Doctor',
        doctorSpecialty: p.doctor?.doctor_profile?.specialty || p.specialty || 'Specialist',
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
        medicines: Array.isArray(p.medicines) ? p.medicines : [],
        followUpDays: p.follow_up_days,
        notes: p.notes,
      }));
      setPrescriptions(mapped);
    } catch (err) {
      setError(err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadPrescriptions(); }, []));

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    return (
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={item.doctorName} size={48} color={COLORS.doctor} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={{ ...FONTS.bodyBold, color: COLORS.text }}>{item.doctorName}</Text>
              <Text style={{ ...FONTS.caption, color: COLORS.primary }}>{item.doctorSpecialty}</Text>
              <Text style={{ ...FONTS.small, color: COLORS.textMuted, marginTop: 2 }}>{item.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Badge text={`${item.medicines.length} meds`} color={COLORS.info} size="sm" />
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.textMuted}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>

          <View style={styles.diagnosisRow}>
            <Ionicons name="medkit-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.diagnosisText} numberOfLines={isExpanded ? undefined : 1}>
              {item.diagnosis}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />

            {/* Medicines */}
            <Text style={styles.sectionLabel}>Prescribed Medicines</Text>
            {item.medicines.length === 0 ? (
              <Text style={{ ...FONTS.caption, color: COLORS.textMuted }}>No medicines listed</Text>
            ) : (
              item.medicines.map((med, i) => (
                <View key={i} style={styles.medCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="medical-outline" size={14} color={COLORS.pharmacy} />
                    <Text style={{ ...FONTS.captionBold, color: COLORS.text, marginLeft: 6 }}>
                      {med.name || med.medicine_name || `Medicine ${i + 1}`}
                    </Text>
                  </View>
                  {med.dosage && (
                    <Text style={styles.medDetail}>Dosage: {med.dosage}</Text>
                  )}
                  {med.duration && (
                    <Text style={styles.medDetail}>Duration: {med.duration}</Text>
                  )}
                  {med.instructions && (
                    <Text style={styles.medDetail}>Instructions: {med.instructions}</Text>
                  )}
                </View>
              ))
            )}

            {/* Notes */}
            {item.notes ? (
              <>
                <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>Doctor's Notes</Text>
                <Text style={{ ...FONTS.caption, color: COLORS.textSecondary }}>{item.notes}</Text>
              </>
            ) : null}

            {/* Follow Up */}
            {item.followUpDays ? (
              <View style={styles.followUp}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.warning} />
                <Text style={{ ...FONTS.caption, color: COLORS.warning, marginLeft: 6 }}>
                  Follow up in {item.followUpDays} day{item.followUpDays !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ ...FONTS.h2, color: COLORS.text }}>My Prescriptions</Text>
        <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 }}>
          {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          error ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="alert-circle-outline" size={40} color={COLORS.danger} />
              <Text style={{ ...FONTS.h4, color: COLORS.text, marginTop: SPACING.md }}>Could not load prescriptions</Text>
              <Button title="Retry" onPress={loadPrescriptions} style={{ marginTop: SPACING.lg }} />
            </View>
          ) : (
            <EmptyState
              title="No prescriptions yet"
              message="Prescriptions from your doctors will appear here"
              icon={<Ionicons name="document-text-outline" size={46} color={COLORS.textMuted} />}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.lg },
  card: { marginBottom: SPACING.md },
  diagnosisRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: SPACING.sm },
  diagnosisText: { ...FONTS.caption, color: COLORS.textSecondary, flex: 1, marginLeft: 6 },
  expandedSection: { marginTop: SPACING.md },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  sectionLabel: { ...FONTS.captionBold, color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  medCard: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.pharmacy,
  },
  medDetail: { ...FONTS.small, color: COLORS.textSecondary, marginTop: 2 },
  followUp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
});
