"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMqtt } from "../lib/mqtt";

// Define the context type
type MqttContextType = ReturnType<typeof useMqtt>;

// Create the context
const MqttContext = createContext<MqttContextType | undefined>(undefined);

// Props for the provider
interface MqttProviderProps {
  children: ReactNode;
}

export const MqttProvider: React.FC<MqttProviderProps> = ({ children }) => {
  const mqtt = useMqtt();

  return <MqttContext.Provider value={mqtt}>{children}</MqttContext.Provider>;
};

// Hook to use the MQTT context
export const useMqttContext = (): MqttContextType => {
  const context = useContext(MqttContext);

  if (context === undefined) {
    throw new Error("useMqttContext must be used within a MqttProvider");
  }

  return context;
};
