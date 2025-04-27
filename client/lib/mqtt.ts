"use client";

import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { useState, useEffect, useCallback } from 'react';

// MQTT Configuration
const MQTT_BROKER = 'd12d1bdb.ala.asia-southeast1.emqxsl.com';
const MQTT_USERNAME = 'froth_frontend';
const MQTT_PASSWORD = 'froth@2025';

// Topics
export const TOPICS = {
  INPUT: 'input',
  FEEDBACK: 'feedback',
};

// Function to get machine ID
const getMachineId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('machineId');
  }
  return null;
};

// Function to get topic with machine ID if available
export const getTopic = (baseTopic: string): string => {
  const machineId = getMachineId();
  if (machineId) {
    return `${machineId}/${baseTopic}`;
  }
  return baseTopic;
};

// MQTT Client singleton
let mqttClient: MqttClient | null = null;

// Initialize MQTT client
export const initMqtt = (): Promise<MqttClient> => {
  return new Promise((resolve, reject) => {
    if (mqttClient && mqttClient.connected) {
      resolve(mqttClient);
      return;
    }
    
    const clientId = `froth_frontend_${Math.random().toString(16).substring(2, 10)}`;
    const options: IClientOptions = {
      clientId,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      protocol: 'wss',
      port: 8084, // WebSocket over TLS/SSL port
      rejectUnauthorized: false, // Set to true in production with proper certificates
    };
    
    const connectUrl = `wss://${MQTT_BROKER}:8084/mqtt`;
    
    try {
      const client = mqtt.connect(connectUrl, options);
      
      client.on('connect', () => {
        console.log('MQTT client connected');
        mqttClient = client;
        
        // Subscribe to feedback topic
        client.subscribe(getTopic(TOPICS.FEEDBACK), (err) => {
          if (err) {
            console.error('Error subscribing to feedback topic:', err);
            reject(err);
          } else {
            console.log(`Subscribed to ${getTopic(TOPICS.FEEDBACK)} topic`);
            resolve(client);
          }
        });
      });
      
      client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        reject(err);
      });
      
      client.on('reconnect', () => {
        console.log('MQTT client reconnecting');
      });
      
      client.on('close', () => {
        console.log('MQTT client disconnected');
      });
      
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      reject(error);
    }
  });
};

// Send a message to the input topic
export const sendMessage = (message: string | object): boolean => {
  if (!mqttClient || !mqttClient.connected) {
    console.error('MQTT client not connected');
    return false;
  }
  
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  
  try {
    mqttClient.publish(getTopic(TOPICS.INPUT), payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
        return false;
      }
    });
    return true;
  } catch (error) {
    console.error('Error publishing message:', error);
    return false;
  }
};

// React hook for using MQTT
export const useMqtt = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ topic: string; message: string }[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let client: MqttClient;
    
    const connectToMqtt = async () => {
      try {
        client = await initMqtt();
        setIsConnected(true);
        
        client.on('message', (topic, message) => {
          const messageStr = message.toString();
          setMessages((prev) => [...prev, { topic, message: messageStr }]);
        });
        
      } catch (err) {
        setError(err as Error);
        setIsConnected(false);
      }
    };
    
    connectToMqtt();
    
    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);
  
  const publish = useCallback((message: string | object) => {
    return sendMessage(message);
  }, []);
  
  return {
    isConnected,
    messages,
    error,
    publish,
  };
};

// Close MQTT connection
export const closeMqttConnection = (): Promise<void> => {
  return new Promise((resolve) => {
    if (mqttClient) {
      mqttClient.end(false, {}, () => {
        mqttClient = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}; 