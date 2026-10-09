import { useState, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { create } from 'zustand';
import { BASE_SHIP_FEE, VARIANT } from '@constants/student';

// Tọa độ cổng KTX IUH (Gò Vấp, TP.HCM)
export const KTX_GATE_COORDS = {
  latitude: 10.8222,
  longitude: 106.6875,
};

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function computeShipFee(km: number): number {
  if (VARIANT.shipFormula === 'A') {
    return BASE_SHIP_FEE + Math.round(km * 2000);
  } else {
    // Formula B cho số cuối 1, 3, 5, 7, 9
    return BASE_SHIP_FEE + Math.round(km * 1500) + 2000;
  }
}

export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'blocked';

interface LocationState {
  coords: { latitude: number; longitude: number } | null;
  distanceKm: number | null;
  shipFee: number | null;
  permissionStatus: PermissionStatus;
  setLocationData: (coords: { latitude: number; longitude: number }) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  distanceKm: null,
  shipFee: null,
  permissionStatus: 'undetermined',

  setLocationData: (coords) => {
    const km = calculateDistanceKm(
      coords.latitude,
      coords.longitude,
      KTX_GATE_COORDS.latitude,
      KTX_GATE_COORDS.longitude
    );
    const fee = computeShipFee(km);
    set({
      coords,
      distanceKm: km,
      shipFee: fee,
      permissionStatus: 'granted',
    });
  },

  setPermissionStatus: (status) => set({ permissionStatus: status }),
}));

export function useCampusLocation() {
  const [loading, setLoading] = useState(false);
  const {
    coords,
    distanceKm,
    shipFee,
    permissionStatus,
    setLocationData,
    setPermissionStatus,
  } = useLocationStore();

  const requestPermissionAndFetchLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status: initialStatus, canAskAgain } =
        await Location.getForegroundPermissionsAsync();

      let finalStatus = initialStatus;

      if (initialStatus !== 'granted') {
        if (!canAskAgain && initialStatus === 'denied') {
          setPermissionStatus('blocked');
          setLoading(false);
          return 'blocked';
        }

        const { status: askedStatus, canAskAgain: afterAskCanAgain } =
          await Location.requestForegroundPermissionsAsync();
        finalStatus = askedStatus;

        if (finalStatus !== 'granted' && !afterAskCanAgain) {
          setPermissionStatus('blocked');
          setLoading(false);
          return 'blocked';
        }
      }

      if (finalStatus === 'granted') {
        setPermissionStatus('granted');
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocationData({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch {
          // Fallback giả lập vị trí gần KTX nếu GPS máy ảo chưa có
          setLocationData({
            latitude: 10.8250,
            longitude: 106.6890,
          });
        }
        setLoading(false);
        return 'granted';
      } else {
        setPermissionStatus('denied');
        setLoading(false);
        return 'denied';
      }
    } catch {
      setPermissionStatus('denied');
      setLoading(false);
      return 'denied';
    }
  }, [setLocationData, setPermissionStatus]);

  const openAppSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    coords,
    distanceKm,
    shipFee,
    permissionStatus,
    loading,
    requestLocation: requestPermissionAndFetchLocation,
    openSettings: openAppSettings,
  };
}
