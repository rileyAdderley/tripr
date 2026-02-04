import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrips } from "../contexts/TripsContext";
import { Trip } from "../types/Trip";

export default function MyTripsScreen({ navigation }: any) {
  const { trips, deleteTrip } = useTrips();

  const sortedTrips = [...trips].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleTripPress = (trip: Trip) => {
    navigation.navigate("TripDetail", { tripId: trip.id });
  };

  const handleDeleteTrip = (trip: Trip) => {
    Alert.alert(
      "Delete trip",
      `Are you sure you want to delete "${trip.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTrip(trip.id);
          },
        },
      ]
    );
  };

  const formatDestinations = (trip: Trip) => {
    return trip.destinations.map((d) => d.name).join(", ");
  };

  const formatDates = (trip: Trip) => {
    if (trip.endDate) {
      return `${trip.startDate} → ${trip.endDate}`;
    }
    return trip.startDate;
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <Pressable
      style={({ pressed }) => [styles.tripCard, pressed && styles.pressed]}
      onPress={() => handleTripPress(item)}
      onLongPress={() => handleDeleteTrip(item)}
    >
      <Text style={styles.tripName}>{item.name}</Text>
      <Text style={styles.tripDestinations}>{formatDestinations(item)}</Text>
      <Text style={styles.tripDates}>{formatDates(item)}</Text>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>no trips yet</Text>
      <Text style={styles.emptySubtext}>
        create your first trip to start planning
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>my trips</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={sortedTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  tripCard: {
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
  pressed: {
    opacity: 0.7,
  },
  tripName: {
    fontSize: 22,
    fontWeight: 600,
    color: "#111111",
    marginBottom: 8,
  },
  tripDestinations: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 6,
  },
  tripDates: {
    fontSize: 14,
    color: "#999999",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 600,
    color: "#111111",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#999999",
    textAlign: "center",
  },
});
