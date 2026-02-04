import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip } from '../types/Trip';
import * as tripStorage from '../utils/tripStorage';

type TripsContextType = {
  trips: Trip[];
  addTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  loadTrips: () => Promise<void>;
};

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const TripsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadTrips = async () => {
    const loadedTrips = await tripStorage.loadTrips();
    setTrips(loadedTrips);
  };

  const addTrip = async (trip: Trip) => {
    await tripStorage.addTrip(trip);
    await loadTrips();
  };

  const deleteTrip = async (id: string) => {
    await tripStorage.deleteTrip(id);
    await loadTrips();
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <TripsContext.Provider value={{ trips, addTrip, deleteTrip, loadTrips }}>
      {children}
    </TripsContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
