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

// Keep a small buffer of recent feedback messages to avoid missing fast ACKs.
type FeedbackEntry = { topic: string; message: string; ts: number };
const recentFeedback: FeedbackEntry[] = [];
const RECENT_FEEDBACK_MAX = 25;
const RECENT_FEEDBACK_TTL_MS = 15000;

const pushRecentFeedback = (topic: string, message: string) => {
  const now = Date.now();
  recentFeedback.push({ topic, message, ts: now });

  // Trim by TTL
  while (recentFeedback.length && now - recentFeedback[0]!.ts > RECENT_FEEDBACK_TTL_MS) {
    recentFeedback.shift();
  }
  // Trim by size
  while (recentFeedback.length > RECENT_FEEDBACK_MAX) {
    recentFeedback.shift();
  }
};

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
            // Global listener to populate recent feedback buffer.
            // (The React hook also attaches a listener; both are ok.)
            client.on('message', (topic, message) => {
              const t = topic.toString();
              if (t === getTopic(TOPICS.FEEDBACK)) {
                pushRecentFeedback(t, message.toString());
              }
            });
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

type AckMatcher = string | ((feedbackMessage: string) => boolean);

export type PublishWithAckOptions = {
  /**
   * String to match in feedback (case-insensitive), or a custom matcher.
   * Default for most commands is "got".
   */
  ack?: AckMatcher;
  /** Total attempts including the first try. Default: 3 */
  retries?: number;
  /**
   * How long to wait for ACK per attempt.
   * Requirement: retry with 3 seconds gap → default 3000ms.
   */
  timeoutMs?: number;
  /**
   * Gap between retries in ms.
   * Note: waiting for ACK already consumes this window; we still enforce a minimum gap if needed.
   */
  retryGapMs?: number;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const normalizeFeedback = (v: string) => v.trim().toLowerCase();

const feedbackMatches = (matcher: AckMatcher, msg: string) => {
  if (typeof matcher === 'function') return matcher(msg);
  return normalizeFeedback(msg).includes(normalizeFeedback(matcher));
};

const startWaitingForFeedbackAck = (matcher: AckMatcher, timeoutMs: number) => {
  const feedbackTopic = getTopic(TOPICS.FEEDBACK);

  // Check recent buffer first (handles ultra-fast ACK that may arrive immediately).
  const now = Date.now();
  for (let i = recentFeedback.length - 1; i >= 0; i--) {
    const entry = recentFeedback[i]!;
    if (now - entry.ts > timeoutMs) break;
    if (entry.topic === feedbackTopic && feedbackMatches(matcher, entry.message)) {
      return { promise: Promise.resolve(true), cancel: () => {} };
    }
  }

  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let handler: ((topic: string, message: Buffer) => void) | null = null;

  const promise = new Promise<boolean>((resolve) => {
    if (!mqttClient) return resolve(false);

    handler = (topic: string, message: Buffer) => {
      if (cancelled) return;
      if (topic !== feedbackTopic) return;
      const msg = message.toString();
      if (feedbackMatches(matcher, msg)) {
        cancel();
        resolve(true);
      }
    };

    timer = setTimeout(() => {
      cancel();
      resolve(false);
    }, timeoutMs);

    mqttClient.on('message', handler);
  });

  const cancel = () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
    if (handler) mqttClient?.off('message', handler);
  };

  return { promise, cancel };
};

/**
 * Publish a command and wait for an acknowledgement on the feedback topic.
 *
 * Policy:
 * - 3 attempts
 * - 3 seconds wait per attempt (acts as retry gap)
 */
export const publishWithAck = async (
  message: string | object,
  options: PublishWithAckOptions = {}
): Promise<boolean> => {
  const {
    ack = 'got',
    retries = 3,
    timeoutMs = 5000,
    retryGapMs = 5000,
  } = options;

  if (!mqttClient || !mqttClient.connected) return false;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const attemptStartedAt = Date.now();
    // Important: start listening before publish to avoid missing fast ACKs.
    const waiter = startWaitingForFeedbackAck(ack, timeoutMs);
    const published = sendMessage(message);
    if (!published) {
      waiter.cancel();
      return false;
    }

    const acked = await waiter.promise;
    if (acked) return true;

    if (attempt < retries) {
      // Ensure at least the requested gap between publish attempts.
      const elapsed = Date.now() - attemptStartedAt;
      if (elapsed < retryGapMs) {
        await sleep(retryGapMs - elapsed);
      }
    }
  }

  return false;
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

  const publishAwaitAck = useCallback(
    async (message: string | object, options: PublishWithAckOptions = {}) => {
      return publishWithAck(message, options);
    },
    []
  );
  
  return {
    isConnected,
    messages,
    error,
    publish,
    publishWithAck: publishAwaitAck,
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