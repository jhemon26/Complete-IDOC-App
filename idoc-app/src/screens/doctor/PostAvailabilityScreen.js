import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button, Card, Chip, Input, Badge } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { availabilityAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

const DATES = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return {
    full: date.toISOString().split('T')[0],
    day: date.toLocaleDateString('en', { weekday: 'short' }),
    date: date.getDate(),
    month: date.toLocaleDateString('en', { month: 'short' }),
  };
});

const CONSULT_TYPES = [
  { key: 'video', label: 'Video', icon: 'videocam-outline' },
  { key: 'chat', label: 'Chat', icon: 'chatbubble-outline' },
  { key: 'both', label: 'Both', icon: 'swap-horizontal-outline' },
];

export default function PostAvailabilityScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [consultType, setConsultType] = useState('video');
  const [maxBookings, setMaxBookings] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [mySlots, setMySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const loadMySlots = async () => {
    setSlotsLoading(true);
    try {
      const { data } = await availabilityAPI.getMySlots();
      const rows = Array.isArray(data) ? data : data?.results || [];
      setMySlots(rows);
    } catch {
      setMySlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadMySlots(); }, []));

  const handlePost = async () => {
    if (!startTime.trim() || !endTime.trim()) {
      Toast.show({ type: 'error', text1: 'Enter start and end times', text2: 'Format: HH:MM (e.g. 09:00)' });
      return;
    }
    const timeRegex = /^\d{1,2}:\d{2}$/;
    if (!timeRegex.test(startTime.trim()) || !timeRegex.test(endTime.trim())) {
      Toast.show({ type: 'error', text1: 'Invalid time format', text2: 'Use HH:MM format, e.g. 09:00 or 14:30' });
      return;
    }
    setLoading(true);
    try {
      await availabilityAPI.post({
        date: selectedDate,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        consultation_type: consultType,
        max_bookings: maxBookings ? parseInt(maxBookings, 10) : undefined,
        notes: notes.trim() || undefined,
      });
      Toast.show({ type: 'success', text1: 'Availability Posted!', text2: 'Patients can now see and book this slot' });
      setStartTime('');
      setEndTime('');
      setMaxBookings('');
      setNotes('');
      loadMySlots();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to post', text2: error.response?.data?.detail || 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await availabilityAPI.delete(id);
      setMySlots((prev) => prev.filter((s) => s.id !== id));
      Toast.show({ type: 'info', text1: 'Slot removed' });
    } catch {
      Toast.show({ type: 'error', text1: 'Could not remove slot' });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={{ ...FONTS.h2, color: COLORS.text }}>Post Availability</Text>
        <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 }}>
          Let patients know when you're available
        </Text>
      </View>

      {/* Date Selection */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.xl }}>
        {DATES.map((d) => (
          <TouchableOpacity
            key={d.full}
            style={[styles.dateCard, selectedDate === d.full && styles.dateCardActive]}
            onPress={() => setSelectedDate(d.full)}
          >
            <Text style={[styles.dateDay, selectedDate === d.full && { color: COLORS.textInverse }]}>{d.day}</Text>
            <Text style={[styles.dateNum, selectedDate === d.full && { color: COLORS.textInverse }]}>{d.date}</Text>
            <Text style={[styles.dateMonth, selectedDate === d.full && { color: COLORS.textInverse }]}>{d.month}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time */}
      <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.xl }}>
        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Start Time"
              placeholder="09:00"
              value={startTime}
              onChangeText={setStartTime}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="End Time"
              placeholder="17:00"
              value={endTime}
              onChangeText={setEndTime}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
      </View>

      {/* Consultation Type */}
      <Text style={styles.sectionTitle}>Consultation Type</Text>
      <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.sm }}>
        {CONSULT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.typeCard, consultType === type.key && styles.typeCardActive]}
            onPress={() => setConsultType(type.key)}
          >
            <Ionicons name={type.icon} size={18} color={consultType === type.key ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.typeLabel, consultType === type.key && { color: COLORS.primary }]}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Max Bookings & Notes */}
      <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.lg }}>
        <Input
          label="Max Bookings (optional)"
          placeholder="e.g. 5"
          value={maxBookings}
          onChangeText={setMaxBookings}
          keyboardType="number-pad"
        />
        <Input
          label="Notes (optional)"
          placeholder="e.g. In-person at Clinic B only"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl }}>
        <Button title="Post Availability" onPress={handlePost} loading={loading} />
      </View>

      {/* My Posted Slots */}
      <Text style={styles.sectionTitle}>My Posted Slots</Text>
      {slotsLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : mySlots.length === 0 ? (
        <Card style={{ marginHorizontal: SPACING.xl, marginBottom: SPACING.xl }}>
          <Text style={{ ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center' }}>
            No upcoming availability posted
          </Text>
        </Card>
      ) : (
        mySlots.map((slot) => (
          <Card key={slot.id} style={{ marginHorizontal: SPACING.xl, marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...FONTS.bodyBold, color: COLORS.text }}>
                  {slot.date || 'N/A'}
                </Text>
                <Text style={{ ...FONTS.caption, color: COLORS.primary, marginTop: 2 }}>
                  {slot.start_time} – {slot.end_time}
                </Text>
                <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: 6 }}>
                  <Badge text={slot.consultation_type || 'video'} color={COLORS.info} size="sm" />
                  {slot.max_bookings && (
                    <Badge text={`Max ${slot.max_bookings}`} color={COLORS.textSecondary} size="sm" />
                  )}
                </View>
                {slot.notes ? (
                  <Text style={{ ...FONTS.small, color: COLORS.textMuted, marginTop: 4 }}>{slot.notes}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(slot.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.lg },
  sectionTitle: { ...FONTS.h4, color: COLORS.text, paddingHorizontal: SPACING.xl, marginTop: SPACING.xl, marginBottom: SPACING.md },
  dateCard: {
    alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgCard,
    marginRight: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    minWidth: 64,
  },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDay: { ...FONTS.small, color: COLORS.textSecondary },
  dateNum: { ...FONTS.h3, color: COLORS.text, marginVertical: 2 },
  dateMonth: { ...FONTS.small, color: COLORS.textSecondary },
  typeCard: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, backgroundColor: COLORS.bgCard,
    borderWidth: 2, borderColor: COLORS.border,
  },
  typeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  typeLabel: { ...FONTS.captionBold, color: COLORS.textSecondary, marginTop: 4 },
  deleteBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.danger + '15',
    borderRadius: RADIUS.md,
    marginLeft: SPACING.md,
  },
});
