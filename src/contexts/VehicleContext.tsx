import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Vehicle {
  year: string;
  make: string;
  model: string;
}

interface VehicleContextType {
  vehicle: Vehicle | null;
  setVehicle: (v: Vehicle | null) => void;
  clearVehicle: () => void;
  vehicleLabel: string;
}

const VehicleContext = createContext<VehicleContextType>({
  vehicle: null,
  setVehicle: () => {},
  clearVehicle: () => {},
  vehicleLabel: "",
});

const STORAGE_KEY = "stehlen_vehicle";

export const VehicleProvider = ({ children }: { children: ReactNode }) => {
  const [vehicle, setVehicleState] = useState<Vehicle | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (vehicle) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [vehicle]);

  const setVehicle = (v: Vehicle | null) => setVehicleState(v);
  const clearVehicle = () => setVehicleState(null);
  const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "";

  return (
    <VehicleContext.Provider value={{ vehicle, setVehicle, clearVehicle, vehicleLabel }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => useContext(VehicleContext);
