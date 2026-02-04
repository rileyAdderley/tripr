import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrips } from "../contexts/TripsContext";
import { useEffect, useState } from "react";
import { Trip } from "../types/Trip";

export default function TripDetailScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const { trips } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const foundTrip = trips.find((t) => t.id === tripId);
    setTrip(foundTrip || null);
  }, [tripId, trips]);

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.backButton}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>trip details</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>trip not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDates = () => {
    if (trip.endDate) {
      return `${trip.startDate} → ${trip.endDate}`;
    }
    return trip.startDate;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>trip details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trip Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>trip name</Text>
          <Text style={styles.tripName}>{trip.name}</Text>
        </View>

        {/* Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>destinations</Text>
          {trip.destinations.map((dest) => (
            <View key={dest.id} style={styles.destinationChip}>
              <Text style={styles.destinationText}>
                {dest.name}, {dest.country}
              </Text>
            </View>
          ))}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>dates</Text>
          <Text style={styles.detailText}>{formatDates()}</Text>
        </View>

        {/* Summary */}
        {trip.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>summary</Text>
            <Text style={styles.detailText}>{trip.summary}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 28,
    color: "#111111",
    fontWeight: 300,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "#111111",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tripName: {
    fontSize: 28,
    fontWeight: 600,
    color: "#111111",
  },
  destinationChip: {
    backgroundColor: "#C5D89D",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  destinationText: {
    fontSize: 15,
    fontWeight: 500,
    color: "#111111",
  },
  detailText: {
    fontSize: 17,
    color: "#111111",
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 600,
    color: "#111111",
  },
});
