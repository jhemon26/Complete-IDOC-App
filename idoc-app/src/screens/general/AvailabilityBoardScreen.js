import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar, Badge, Button, Card, Chip, SearchBar, EmptyState } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { availabilityAPI } from '../../services/api';

const DATES = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return {
    full: date.toISOString().split('T')[0],
    day: date.toLocaleDateString('en', { weekday: 'short' }),
    date: date.getDate(),
    month: date.toLocaleDateString('en', { month: 'short' }),
    isToday: i === 0,
  };
});

export default function AvailabilityBoardScreen({ navigation }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [search, setSearch] = useState('');

  const loadSlots = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const params = { date: date || selectedDate };
      const { data } = await availabilityAPI.list(params);
      const rows = Array.isArray(data) ? data : data?.results || [];
      setSlots(rows.map((s) => ({
        id: s.id,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        consultationType: s.consultation_type || 'video',
        maxBookings: s.max_bookings,
        notes: s.notes,
        doctor: {
          id: s.doctor?.id || s.doctor_id,
          name: s.doctor?.name || s.doctor_name || 'Doctor',
          specialty: s.doctor?.specialty || s.doctor?.doctor_profile?.specialty || 'Specialist',
          rating: Number(s.doctor?.rating || 0),
          fee: Number(s.doctor?.fee || 0),
        },
      })));
    } catch (err) {
      setError(err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadSlots(selectedDate); }, [selectedDate]));

  const specialties = useMemo(() => {
    const unique = [...new Set(slots.map((s) => s.doctor.specialty).filter(Boolean))];
    return unique.length ? ['All', ...unique] : ['All'];
  }, [slots]);

  const filtered = useMemo(() => slots.filter((s) => {
    const matchSearch = !search.trim() ||
      s.doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      s.doctor.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = selectedSpecialty === 'All' || s.doctor.specialty === selectedSpecialty;
    return matchSearch && matchSpecialty;
  }), [slots, search, selectedSpecialty]);

  const handleBook = (slot) => {
    navigation.navigate('Booking', {
      doctor: slot.doctor,
      selectedSlot: slot.startTime,
    });
  };

  const typeIcon = (type) => {
    if (type === 'chat') return 'chatbubble-outline';
    if (type === 'both') return 'swap-horizontal-outline';
    return 'videocam-outline';
  };

  const typeColor = (type) => {
    if (type === 'chat') return COLORS.info;
    if (type === 'both') return COLORS.success;
    return COLORS.primary;
  };

  const renderSlot = ({ item }) => (
    <Card style={styles.slotCard}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Avatar name={item.doctor.name} size={52} color={COLORS.doctor} />
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={{ ...FONTS.bodyBold, color: COLORS.text }}>{item.doctor.name}</Text>
          <Text style={{ ...FONTS.caption, color: COLORS.primary }}>{item.doctor.specialty}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: SPACING.sm, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
              <Text style={{ ...FONTS.small, color: COLORS.textSecondary, marginLeft: 3 }}>
                {item.startTime} – {item.endTime}
              </Text>
            </View>
            <Badge
              text={item.consultationType}
              color={typeColor(item.consultationType)}
              size="sm"
            />
            {item.doctor.rating > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={12} color={COLORS.warning} />
                <Text style={{ ...FONTS.small, color: COLORS.textSecondary, marginLeft: 3 }}>{item.doctor.rating}</Text>
              </View>
            )}
          </View>
          {item.notes ? (
            <Text style={{ ...FONTS.small, color: COLORS.textMuted, marginTop: 4 }} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {item.doctor.fee > 0 && (
            <Text style={{ ...FONTS.bodyBold, color: COLORS.primary }}>฿{item.doctor.fee}</Text>
          )}
          {item.maxBookings && (
            <Text style={{ ...FONTS.small, color: COLORS.textMuted, marginTop: 2 }}>
              Max {item.maxBookings}
            </Text>
          )}
        </View>
      </View>
      <Button
        title="Book This Slot"
        onPress={() => handleBook(item)}
        style={{ marginTop: SPACING.md }}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ ...FONTS.h2, color: COLORS.text }}>Doctor Availability</Text>
        <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 }}>
          Browse available slots and book directly
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.md }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search doctors, specialties..." />
      </View>

      {/* Date Scroller */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.md }}>
        {DATES.map((d) => (
          <TouchableOpacity
            key={d.full}
            style={[styles.dateCard, selectedDate === d.full && styles.dateCardActive]}
            onPress={() => setSelectedDate(d.full)}
          >
            <Text style={[styles.dateDayText, selectedDate === d.full && { color: COLORS.textInverse }]}>
              {d.isToday ? 'Today' : d.day}
            </Text>
            <Text style={[styles.dateNumText, selectedDate === d.full && { color: COLORS.textInverse }]}>{d.date}</Text>
            <Text style={[styles.dateMonthText, selectedDate === d.full && { color: COLORS.textInverse }]}>{d.month}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Specialty Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.md }}>
        {specialties.map((s) => (
          <Chip key={s} label={s} active={selectedSpecialty === s} onPress={() => setSelectedSpecialty(s)} />
        ))}
      </ScrollView>

      {/* Slot List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginTop: 8 }}>Loading available slots...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSlot}
          contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            error ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Ionicons name="alert-circle-outline" size={40} color={COLORS.danger} />
                <Text style={{ ...FONTS.h4, color: COLORS.text, marginTop: SPACING.md }}>Could not load slots</Text>
                <Button title="Retry" onPress={() => loadSlots(selectedDate)} style={{ marginTop: SPACING.lg }} />
              </View>
            ) : (
              <EmptyState
                title="No slots available"
                message="No doctors have posted availability for this date. Try another day or use Find a Doctor."
                icon={<Ionicons name="calendar-outline" size={46} color={COLORS.textMuted} />}
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.lg },
  slotCard: { marginBottom: SPACING.md },
  dateCard: {
    alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgCard,
    marginRight: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    minWidth: 60,
  },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDayText: { ...FONTS.small, color: COLORS.textSecondary, fontSize: 10 },
  dateNumText: { ...FONTS.h4, color: COLORS.text, marginVertical: 2 },
  dateMonthText: { ...FONTS.small, color: COLORS.textSecondary, fontSize: 10 },
});
