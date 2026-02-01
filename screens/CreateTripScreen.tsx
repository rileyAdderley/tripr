import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrips } from '../contexts/TripsContext';
import { Destination } from '../types/Trip';

// Mock destination data for search
const MOCK_DESTINATIONS = [
  { id: '1', name: 'Tokyo', country: 'Japan' },
  { id: '2', name: 'Paris', country: 'France' },
  { id: '3', name: 'Barcelona', country: 'Spain' },
  { id: '4', name: 'Kyoto', country: 'Japan' },
  { id: '5', name: 'London', country: 'United Kingdom' },
  { id: '6', name: 'Rome', country: 'Italy' },
  { id: '7', name: 'Lisbon', country: 'Portugal' },
  { id: '8', name: 'Amsterdam', country: 'Netherlands' },
];

export default function CreateTripScreen({ navigation }: any) {
  const { addTrip } = useTrips();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Filter destinations based on search query
  const filteredDestinations = MOCK_DESTINATIONS.filter(
    (dest) =>
      (dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedDestinations.find((selected) => selected.id === dest.id)
  );

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestinations([...selectedDestinations, destination]);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleRemoveDestination = (id: string) => {
    setSelectedDestinations(selectedDestinations.filter((dest) => dest.id !== id));
  };

  // Validate form - CTA enabled when: 1+ destination, trip name, start date
  const isFormValid =
    selectedDestinations.length > 0 && tripName.trim() !== '' && startDate !== '';

  const handleCreateTrip = async () => {
    if (!isFormValid) return;

    const newTrip = {
      id: Date.now().toString(),
      name: tripName,
      destinations: selectedDestinations,
      startDate,
      endDate: endDate || undefined,
      summary: summary || undefined,
      createdAt: new Date().toISOString(),
    };

    await addTrip(newTrip);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation?.goBack()} hitSlop={8}>
          <Text style={styles.cancelButton}>cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>new trip</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Destination Search Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>where are you going?</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="search for destinations"
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowSearchResults(text.length > 0);
              }}
              onFocus={() => setShowSearchResults(searchQuery.length > 0)}
            />

            {/* Search Results Dropdown */}
            {showSearchResults && filteredDestinations.length > 0 && (
              <View style={styles.searchResults}>
                {filteredDestinations.slice(0, 5).map((destination) => (
                  <Pressable
                    key={destination.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectDestination(destination)}
                  >
                    <Text style={styles.searchResultText}>
                      {destination.name}, {destination.country}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Selected Destinations Chips */}
            {selectedDestinations.length > 0 && (
              <View style={styles.chipsContainer}>
                {selectedDestinations.map((destination) => (
                  <View key={destination.id} style={styles.chip}>
                    <Text style={styles.chipText}>{destination.name}</Text>
                    <Pressable
                      onPress={() => handleRemoveDestination(destination.id)}
                      hitSlop={4}
                    >
                      <Text style={styles.chipRemove}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Trip Name Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>name your trip</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., spring in europe"
              placeholderTextColor="#999999"
              value={tripName}
              onChangeText={setTripName}
            />
          </View>

          {/* Trip Dates Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>trip dates</Text>
            <View style={styles.datesRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>start date</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="set date"
                  placeholderTextColor="#4A90E2"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <Text style={styles.dateArrow}>→</Text>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>end date</Text>
                <TextInput
                  style={[styles.dateInput, styles.dateInputOptional]}
                  placeholder="optional"
                  placeholderTextColor="#4A90E2"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>
          </View>

          {/* Trip Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>add a short summary</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="optional"
              placeholderTextColor="#999999"
              value={summary}
              onChangeText={setSummary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Bottom spacing for fixed button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <View style={styles.ctaContainer}>
          <Pressable
            style={[styles.ctaButton, !isFormValid && styles.ctaButtonDisabled]}
            onPress={handleCreateTrip}
            disabled={!isFormValid}
          >
            <Text style={[styles.ctaButtonText, !isFormValid && styles.ctaButtonTextDisabled]}>
              create trip
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButton: {
    fontSize: 17,
    color: '#4A90E2',
    fontWeight: 400,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#111111',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#111111',
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    color: '#111111',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchResultText: {
    fontSize: 15,
    color: '#111111',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginRight: -8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C5D89D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111111',
  },
  chipRemove: {
    fontSize: 20,
    fontWeight: 400,
    color: '#111111',
    lineHeight: 20,
    marginLeft: 6,
  },
  textInput: {
    fontSize: 16,
    color: '#111111',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  dateInput: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 500,
  },
  dateInputOptional: {
    color: '#4A90E2',
  },
  dateArrow: {
    fontSize: 20,
    color: '#CCCCCC',
    marginHorizontal: 12,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  ctaButton: {
    backgroundColor: '#89986D',
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: '#D5D5D5',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 600,
  },
  ctaButtonTextDisabled: {
    color: '#999999',
  },
});
