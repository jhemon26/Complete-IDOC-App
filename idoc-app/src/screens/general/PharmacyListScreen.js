import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, Avatar, Badge, SearchBar, Button } from '../../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { pharmacyAPI } from '../../services/api';

export default function PharmacyListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPharmacies = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await pharmacyAPI.list();
      const rows = Array.isArray(data) ? data : data?.results || [];
      const mapped = rows.map((entry) => {
        const profile = entry.user ? entry : entry.pharmacy_profile || entry;
        const user = profile.user || {};
        return {
          id: profile.id,
          ownerId: user.id,
          name: profile.pharmacy_name || user.name || 'Pharmacy',
          rating: Number(profile.rating || 0),
          deliveryTime: profile.delivery_time || '30 min',
          medicines: Number(profile.medicine_count || 0),
          open: profile.is_open !== false,
          address: profile.address,
        };
      });
      setPharmacies(mapped);
    } catch (err) {
      setPharmacies([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  const filtered = useMemo(() => pharmacies.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [pharmacies, search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ ...FONTS.h2, color: COLORS.text }}>Pharmacies</Text>
        <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 }}>
          Order medicines & get them delivered
        </Text>
      </View>

      <View style={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search pharmacies..." />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 100 }}
        ListEmptyComponent={
          error ? (
            <Card style={{ marginTop: SPACING.lg }}>
              <View style={{ alignItems: 'center', paddingVertical: SPACING.md }}>
                <Ionicons name="alert-circle-outline" size={36} color={COLORS.danger} />
                <Text style={{ ...FONTS.bodyBold, color: COLORS.text, marginTop: SPACING.md }}>Could not load pharmacies</Text>
                <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' }}>Check your connection and try again</Text>
                <Button title="Retry" onPress={loadPharmacies} style={{ marginTop: SPACING.md }} />
              </View>
            </Card>
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="storefront-outline" size={40} color={COLORS.textMuted} />
              <Text style={{ ...FONTS.h4, color: COLORS.text, marginTop: SPACING.md }}>No pharmacies found</Text>
              <Text style={{ ...FONTS.caption, color: COLORS.textSecondary }}>Try a different search</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('MedicineList', { pharmacy: item })}
            style={{ marginBottom: SPACING.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar name={item.name} size={56} color={COLORS.pharmacy} />
              <View style={{ flex: 1, marginLeft: SPACING.lg }}>
                <Text style={{ ...FONTS.bodyBold, color: COLORS.text }}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="star" size={12} color={COLORS.warning} />
                  <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginLeft: 4 }}>{item.rating}</Text>
                  <Text style={{ ...FONTS.caption, color: COLORS.textMuted, marginHorizontal: 8 }}>•</Text>
                  <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                  <Text style={{ ...FONTS.caption, color: COLORS.textSecondary, marginLeft: 4 }}>{item.deliveryTime}</Text>
                </View>
                <Text style={{ ...FONTS.small, color: COLORS.textMuted, marginTop: 2 }}>
                  {item.medicines} medicines available
                </Text>
              </View>
              <Badge
                text={item.open ? 'Open' : 'Closed'}
                color={item.open ? COLORS.success : COLORS.danger}
                size="sm"
              />
            </View>
          </Card>
        )}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.lg },
});
