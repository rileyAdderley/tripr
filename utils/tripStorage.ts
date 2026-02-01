import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types/Trip';

const TRIPS_STORAGE_KEY = '@tripr_trips';

export const loadTrips = async (): Promise<Trip[]> => {
  try {
    const tripsJson = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
    if (tripsJson === null) {
      return [];
    }
    return JSON.parse(tripsJson);
  } catch (error) {
    console.error('Error loading trips:', error);
    return [];
  }
};

export const saveTrips = async (trips: Trip[]): Promise<void> => {
  try {
    const tripsJson = JSON.stringify(trips);
    await AsyncStorage.setItem(TRIPS_STORAGE_KEY, tripsJson);
  } catch (error) {
    console.error('Error saving trips:', error);
  }
};

export const addTrip = async (trip: Trip): Promise<void> => {
  try {
    const existingTrips = await loadTrips();
    const updatedTrips = [...existingTrips, trip];
    await saveTrips(updatedTrips);
  } catch (error) {
    console.error('Error adding trip:', error);
  }
};
