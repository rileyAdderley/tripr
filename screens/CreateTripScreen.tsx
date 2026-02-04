import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  findNodeHandle,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTrips } from '../contexts/TripsContext';
import { Destination } from '../types/Trip';

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

const CTA_HEIGHT = 58;
const CTA_PADDING_Y = 20;
const CTA_SAFE_GAP = 16;

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

type PickerMode = 'start' | 'end';

export default function CreateTripScreen({ navigation }: any) {
  const { addTrip } = useTrips();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const [tripName, setTripName] = useState('');
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [summary, setSummary] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const searchRef = useRef<TextInput>(null);
  const tripNameRef = useRef<TextInput>(null);
  const summaryRef = useRef<TextInput>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Modal date picker state
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [activePicker, setActivePicker] = useState<PickerMode>('start');
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomFixedArea = CTA_HEIGHT + CTA_PADDING_Y * 2 + CTA_SAFE_GAP + insets.bottom;

  // keep your working keyboard runway
  const contentBottomPadding = bottomFixedArea + keyboardHeight + 150;

  const scrollToInput = (inputRef: React.RefObject<TextInput>, bias = 0) => {
    const node = findNodeHandle(inputRef.current);
    if (!node) return;

    const baseFudge = Platform.OS === 'ios' ? 60 : 80;
    const keyboardBoost = keyboardHeight > 0 ? Math.min(180, keyboardHeight * 0.35) : 0;
    const extraOffset = bottomFixedArea + baseFudge + keyboardBoost + bias;

    const responder = scrollRef.current?.getScrollResponder?.();
    responder?.scrollResponderScrollNativeHandleToKeyboard?.(node, extraOffset, true);
  };

  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return MOCK_DESTINATIONS.filter(
      (dest) =>
        (dest.name.toLowerCase().includes(q) || dest.country.toLowerCase().includes(q)) &&
        !selectedDestinations.find((selected) => selected.id === dest.id)
    );
  }, [searchQuery, selectedDestinations]);

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestinations((prev) => [...prev, destination]);
    setSearchQuery('');
    setShowSearchResults(false);
    Keyboard.dismiss();
    setTimeout(() => tripNameRef.current?.focus(), 50);
  };

  const handleRemoveDestination = (id: string) => {
    setSelectedDestinations((prev) => prev.filter((dest) => dest.id !== id));
  };

  const isFormValid =
    selectedDestinations.length > 0 && tripName.trim() !== '' && startDateObj !== null;

  const handleCreateTrip = async () => {
    if (!isFormValid || !startDateObj) return;

    Keyboard.dismiss();

    const newTrip = {
      id: Date.now().toString(),
      name: tripName.trim(),
      destinations: selectedDestinations,
      startDate: formatDate(startDateObj),
      endDate: endDateObj ? formatDate(endDateObj) : undefined,
      summary: summary.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await addTrip(newTrip);
    navigation.goBack();
  };

  const summaryBias = keyboardHeight > 0 ? Math.max(220, keyboardHeight * 0.35) : 10;

  const openDateModal = (mode: PickerMode) => {
    Keyboard.dismiss();
    setShowSearchResults(false);

    setActivePicker(mode);

    if (mode === 'start') {
      setTempDate(startDateObj ?? new Date());
    } else {
      setTempDate(endDateObj ?? startDateObj ?? new Date());
    }

    setDateModalVisible(true);
  };

  const closeDateModal = () => {
    setDateModalVisible(false);
  };

  const commitDate = () => {
    if (activePicker === 'start') {
      setStartDateObj(tempDate);

      if (endDateObj && endDateObj < tempDate) {
        setEndDateObj(null);
      }
    } else {
      if (startDateObj && tempDate < startDateObj) {
        setEndDateObj(startDateObj);
      } else {
        setEndDateObj(tempDate);
      }
    }

    setDateModalVisible(false);
  };

  const minEndDate = startDateObj ?? undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation?.goBack()} hitSlop={8}>
          <Text style={styles.cancelButton}>cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>new trip</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.keyboardView}
      >
        <View style={styles.flex}>
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: contentBottomPadding },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
            onScrollBeginDrag={() => Keyboard.dismiss()}
            showsVerticalScrollIndicator={false}
          >
            {/* Destination Search Card */}
            <View style={styles.card} pointerEvents="box-none">
              <Text style={styles.cardTitle}>where are you going?</Text>
              <TextInput
                ref={searchRef}
                style={styles.searchInput}
                placeholder="search for destinations"
                placeholderTextColor="#999999"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setShowSearchResults(text.trim().length > 0);
                }}
                onFocus={() => {
                  setShowSearchResults(searchQuery.trim().length > 0);
                  setTimeout(() => scrollToInput(searchRef, 20), 50);
                }}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              {showSearchResults && filteredDestinations.length > 0 && (
                <View style={styles.searchResults}>
                  {filteredDestinations.slice(0, 5).map((destination, idx, arr) => (
                    <Pressable
                      key={destination.id}
                      style={[
                        styles.searchResultItem,
                        idx === arr.length - 1 && styles.searchResultItemLast,
                      ]}
                      onPress={() => handleSelectDestination(destination)}
                    >
                      <Text style={styles.searchResultText}>
                        {destination.name}, {destination.country}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {selectedDestinations.length > 0 && (
                <View style={styles.chipsContainer}>
                  {selectedDestinations.map((destination) => (
                    <View key={destination.id} style={styles.chip}>
                      <Text style={styles.chipText}>{destination.name}</Text>
                      <Pressable onPress={() => handleRemoveDestination(destination.id)} hitSlop={6}>
                        <Text style={styles.chipRemove}>×</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Trip Name Card */}
            <View style={styles.card} pointerEvents="box-none">
              <Text style={styles.cardTitle}>name your trip</Text>
              <TextInput
                ref={tripNameRef}
                style={styles.textInput}
                placeholder="e.g., spring in europe"
                placeholderTextColor="#999999"
                value={tripName}
                onChangeText={setTripName}
                onFocus={() => setTimeout(() => scrollToInput(tripNameRef, 20), 50)}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>

            {/* Trip Dates Card */}
            <View style={styles.card} pointerEvents="box-none">
              <Text style={styles.cardTitle}>trip dates</Text>
              <View style={styles.datesRow}>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>start date</Text>
                  <Pressable style={styles.dateButton} onPress={() => openDateModal('start')}>
                    <Text
                      style={[
                        styles.dateButtonText,
                        !startDateObj && styles.dateButtonTextPlaceholder,
                      ]}
                    >
                      {startDateObj ? formatDate(startDateObj) : 'set date'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.dateArrow}>→</Text>

                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>end date</Text>
                  <Pressable
                    style={[styles.dateButton, !startDateObj && styles.dateButtonDisabled]}
                    onPress={() => (startDateObj ? openDateModal('end') : null)}
                  >
                    <Text
                      style={[
                        styles.dateButtonText,
                        !endDateObj && styles.dateButtonTextPlaceholder,
                      ]}
                    >
                      {endDateObj ? formatDate(endDateObj) : 'optional'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Trip Summary Card */}
            <View style={styles.card} pointerEvents="box-none">
              <Text style={styles.cardTitle}>add a short summary</Text>
              <TextInput
                ref={summaryRef}
                style={[styles.textInput, styles.multilineInput]}
                placeholder="optional"
                placeholderTextColor="#999999"
                value={summary}
                onChangeText={setSummary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onFocus={() => setTimeout(() => scrollToInput(summaryRef, summaryBias), 50)}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
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
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDateModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeDateModal}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={closeDateModal} hitSlop={10}>
                <Text style={styles.sheetCancel}>cancel</Text>
              </Pressable>

              <Text style={styles.sheetTitle}>
                {activePicker === 'start' ? 'start date' : 'end date'}
              </Text>

              <Pressable onPress={commitDate} hitSlop={10}>
                <Text style={styles.sheetDone}>done</Text>
              </Pressable>
            </View>

            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={activePicker === 'end' ? minEndDate : undefined}
                onChange={(_event, date) => {
                  if (date) setTempDate(date);
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

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
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
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
    fontWeight: '600',
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
    overflow: 'hidden',
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
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
    fontWeight: '500',
    color: '#111111',
  },
  chipRemove: {
    fontSize: 20,
    fontWeight: '400',
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
    minHeight: 140,
    paddingTop: 12,
  },

  datesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dateButtonDisabled: {
    opacity: 0.5,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111111',
  },
  dateButtonTextPlaceholder: {
    color: '#999999',
  },
  dateArrow: {
    fontSize: 20,
    color: '#CCCCCC',
    marginHorizontal: 12,
    marginTop: 28,
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
    fontWeight: '600',
  },
  ctaButtonTextDisabled: {
    color: '#999999',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  sheetHeader: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetCancel: {
    fontSize: 17,
    color: '#4A90E2',
    fontWeight: '400',
  },
  sheetDone: {
    fontSize: 17,
    color: '#4A90E2',
    fontWeight: '600',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  pickerWrap: {
    backgroundColor: '#FAF9F6',
    paddingBottom: 6,
  },
});
