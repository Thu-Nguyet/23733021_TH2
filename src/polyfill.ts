// Polyfill for Expo Modules in React Native CLI bare architecture
if (!(globalThis as any).expo) {
  class EventEmitter {
    private listeners: Record<string, Function[]> = {};

    addListener(event: string, listener: Function) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(listener);
      return {
        remove: () => {
          this.removeListener(event, listener);
        },
      };
    }

    removeListener(event: string, listener: Function) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
    }

    emit(event: string, ...args: any[]) {
      (this.listeners[event] || []).forEach((l) => l(...args));
    }

    removeAllListeners(event?: string) {
      if (event) delete this.listeners[event];
      else this.listeners = {};
    }
  }

  class SharedObject {}
  class SharedRef extends SharedObject {}
  class NativeModule extends EventEmitter {}

  let permissionGranted = false;

  const ExpoLocation = {
    async getForegroundPermissionsAsync() {
      return {
        status: permissionGranted ? 'granted' : 'undetermined',
        granted: permissionGranted,
        canAskAgain: true,
        expires: 'never',
      };
    },
    async requestForegroundPermissionsAsync() {
      permissionGranted = true;
      return {
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      };
    },
    async getCurrentPositionAsync() {
      return {
        coords: {
          latitude: 10.8250,
          longitude: 106.6890,
          altitude: 0,
          accuracy: 5,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0,
        },
        timestamp: Date.now(),
      };
    },
    async getLastKnownPositionAsync() {
      return this.getCurrentPositionAsync();
    },
    async getProviderStatusAsync() {
      return {
        locationServicesEnabled: true,
        gpsAvailable: true,
        networkAvailable: true,
        passiveAvailable: true,
      };
    },
    async enableNetworkProviderAsync() {},
    async watchPositionImplAsync() {},
    async stopLocationUpdatesAsync() {},
  };

  const ExpoHaptics = {
    async notificationAsync() {},
    async impactAsync() {},
    async selectionAsync() {},
  };

  const mockModules: Record<string, any> = {
    ExpoLocation,
    ExpoHaptics,
    ExpoFetchModule: {},
  };

  const modulesProxy = new Proxy(mockModules, {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      return {};
    },
  });

  (globalThis as any).expo = {
    modules: modulesProxy,
    EventEmitter,
    SharedObject,
    SharedRef,
    NativeModule,
    uuidv4: () => '00000000-0000-4000-8000-000000000000',
    uuidv5: () => '00000000-0000-4000-8000-000000000000',
    getViewConfig: () => null,
    reloadAppAsync: async () => {},
  };
}
