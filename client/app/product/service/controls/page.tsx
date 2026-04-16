"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMqttContext } from "@/components/MqttProvider";
import {
  Loader2,
  Zap,
  Coffee,
  Droplets,
  Settings,
  Play,
  Thermometer,
  Milk,
} from "lucide-react";

const FLUSH_WAIT_SECONDS = 12;

const FLUSH_OPTIONS = [
  { label: "Coffee", command: "black_coffee", icon: Coffee, color: "text-emerald-400" },
  { label: "Milk",   command: "hot_milk",       icon: Milk,   color: "text-blue-400"    },
  { label: "Tea",    command: "black_tea",      icon: Coffee, color: "text-amber-400"   },
] as const;

export default function ControlsPage() {
  const [processing, setProcessing] = useState<string | null>(null);
  const [upLatch, setUpLatch] = useState(false);
  const [downLatch, setDownLatch] = useState(false);
  const { isConnected, publishWithAck } = useMqttContext();

  // Flush flow state
  const [flushCountdown, setFlushCountdown] = useState<number | null>(null);
  const [showFlushConfirm, setShowFlushConfirm] = useState(false);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendMqttMessage = async (message: string) => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "MQTT client is not connected. Please wait and try again.",
        variant: "destructive",
        className: "bg-zinc-900 border-zinc-800 text-red-400",
      });
      return;
    }

    setProcessing(message);
    try {
      const acked = await publishWithAck(message, {
        ack: "got",
        retries: 3,
        timeoutMs: 5000,
        retryGapMs: 5000,
      });

      if (acked) {
        toast({
          title: "Acknowledged",
          description: `Command ${message} acknowledged by machine`,
          className: "bg-zinc-900 border-zinc-800 text-emerald-400",
        });
      } else {
        toast({
          title: "Failed",
          description: "Network issue. Please retry after sometime.",
          variant: "destructive",
          className: "bg-zinc-900 border-zinc-800 text-red-400",
        });
      }
    } finally {
      setProcessing(null);
    }
  };

  // Start Flush flow
  const handleStartFlush = async () => {
    if (flushTimerRef.current) return; // already running
    await sendMqttMessage("flushing");
    setFlushCountdown(FLUSH_WAIT_SECONDS);

    let remaining = FLUSH_WAIT_SECONDS;
    flushTimerRef.current = setInterval(() => {
      remaining -= 1;
      setFlushCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(flushTimerRef.current!);
        flushTimerRef.current = null;
        setFlushCountdown(null);
        setShowFlushConfirm(true);
      }
    }, 1000);
  };

  const handleFlushSelect = async (command: string) => {
    setShowFlushConfirm(false);
    await sendMqttMessage(command);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, []);

  // Handle toggle switches
  const handleToggle = (type: "up" | "down", state: boolean) => {
    if (type === "up") {
      setUpLatch(state);
      sendMqttMessage(state ? "up_on" : "up_off");
    } else {
      setDownLatch(state);
      sendMqttMessage(state ? "down_on" : "down_off");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6">
      <h1 className="text-3xl font-bold mb-8 text-white tracking-tight">
        Machine Controls
      </h1>

      {/* Flush countdown overlay */}
      {flushCountdown !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl border border-zinc-800 w-full max-w-sm text-center">
            <Droplets className="h-10 w-10 text-emerald-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-white text-xl font-bold mb-2">Flushing…</h3>
            <p className="text-zinc-400 mb-6">Please wait before selecting your drink</p>
            <div className="text-5xl font-mono font-bold text-emerald-400">{flushCountdown}</div>
            <p className="text-zinc-500 mt-2 text-sm">seconds remaining</p>
          </div>
        </div>
      )}

      {/* Flush drink selection dialog */}
      {showFlushConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl border border-zinc-800 w-full max-w-sm">
            <h3 className="text-white text-xl font-bold mb-2 text-center">Select Drink</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">What would you like to brew after flushing?</p>
            <div className="grid grid-cols-3 gap-3">
              {FLUSH_OPTIONS.map(({ label, command, icon: Icon, color }) => (
                <Button
                  key={command}
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 h-20 flex flex-col items-center justify-center gap-2 text-zinc-300"
                  onClick={() => handleFlushSelect(command)}
                >
                  <Icon className={`h-6 w-6 ${color}`} />
                  <span className={`text-sm font-medium ${color}`}>{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl shadow-2xl border border-zinc-800 w-full max-w-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-zinc-800 p-3 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  Processing Command
                </h3>
                <p className="text-zinc-400">{processing}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Section 1 (Largest) */}
        <div className="col-span-12 md:col-span-6 bg-zinc-900 rounded-xl p-6 border border-zinc-800 shadow-lg">
          <h2 className="text-2xl font-semibold mb-5 text-white flex items-center">
            <Settings className="mr-2 h-5 w-5 text-emerald-400" />
            Brewing Controls
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={handleStartFlush}
              disabled={flushCountdown !== null}
            >
              <Droplets className="h-5 w-5 text-emerald-400" />
              <span>Start Flush</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("main_brew-1")}
            >
              <Coffee className="h-5 w-5 text-emerald-400" />
              <span>Coffee Brew</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("main_brew-2")}
            >
              <Coffee className="h-5 w-5 text-amber-400" />
              <span>Tea Brew</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("intermideate_brew-1")}
            >
              <Coffee className="h-5 w-5 text-emerald-400 opacity-70" />
              <span className="text-xs text-center">Intermediate Coffee</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("intermideate_brew-2")}
            >
              <Coffee className="h-5 w-5 text-amber-400 opacity-70" />
              <span className="text-xs text-center">Intermediate Tea</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("subtank_fill-1")}
            >
              <Droplets className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-center">Subtank Fill Coffee</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("subtank_fill-2")}
            >
              <Droplets className="h-5 w-5 text-amber-400" />
              <span className="text-xs text-center">Subtank Fill Tea</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("count_display")}
            >
              <Thermometer className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-center">Display Temperature</span>
            </Button>
          </div>
        </div>

        {/* Section 2 (Second largest) */}
        <div className="col-span-12 md:col-span-4 bg-zinc-900 rounded-xl p-6 border border-zinc-800 shadow-lg">
          <h2 className="text-2xl font-semibold mb-5 text-white flex items-center">
            <Coffee className="mr-2 h-5 w-5 text-emerald-400" />
        Machine Buttons
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
              onClick={() => sendMqttMessage("black_tea")}
            >
              Black Tea
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
              onClick={() => sendMqttMessage("strong_tea")}
            >
              Strong Tea
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
              onClick={() => sendMqttMessage("light_tea")}
            >
              Light Tea
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
              onClick={() => sendMqttMessage("hot_milk")}
            >
              Hot Milk
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
              onClick={() => sendMqttMessage("tea_bag_tea")}
            >
              Tea Bag Tea
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
              onClick={() => sendMqttMessage("tea_brew")}
            >
              Tea Brew
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
              onClick={() => sendMqttMessage("flush")}
            >
              Flushing
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
              onClick={() => sendMqttMessage("coffee_brew")}
            >
              Coffee Brew
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-blue-400 text-zinc-300"
              onClick={() => sendMqttMessage("hot_water")}
            >
              Hot Water
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
              onClick={() => sendMqttMessage("light_coffee")}
            >
              Light Coffee
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
              onClick={() => sendMqttMessage("strong_coffee")}
            >
              Strong Coffee
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
              onClick={() => sendMqttMessage("black_coffee")}
            >
              Black Coffee
            </Button>
          </div>
        </div>

        {/* Section 3 (Smallest) */}
        <div className="col-span-12 md:col-span-2 bg-zinc-900 rounded-xl p-6 border border-zinc-800 shadow-lg">
          <h2 className="text-2xl font-semibold mb-5 text-white flex items-center">
            <Zap className="mr-2 h-5 w-5 text-emerald-400" />
            Controls
          </h2>

          <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-20 mb-4 w-full flex flex-col items-center justify-center gap-1.5 text-zinc-300 text-base"
              onClick={() => sendMqttMessage("programming")}
            >
              <Settings className="h-6 w-6 text-emerald-400" />
              <span>Program</span>
            </Button>

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300 h-12 min-h-12 text-base"
              onClick={() => sendMqttMessage("up")}
            >
              Up
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300 h-12 min-h-12 text-base"
              onClick={() => sendMqttMessage("down")}
            >
              Down
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300 h-12 min-h-12 text-base"
              onClick={() => sendMqttMessage("save")}
            >
              Save
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300 h-12 min-h-12 text-base"
              onClick={() => sendMqttMessage("exit")}
            >
              Exit
            </Button>
          </div>

          {/* Row 2 */}
          <div className="space-y-4">
            <div className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
              <span className="text-zinc-300">Up Latch</span>
              <Button
                size="sm"
                className={`${
                  upLatch
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-zinc-700 hover:bg-zinc-600"
                } text-white min-w-[60px]`}
                onClick={() => handleToggle("up", !upLatch)}
              >
                {upLatch ? "ON" : "OFF"}
              </Button>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
              <span className="text-zinc-300">Down Latch</span>
              <Button
                size="sm"
                className={`${
                  downLatch
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-zinc-700 hover:bg-zinc-600"
                } text-white min-w-[60px]`}
                onClick={() => handleToggle("down", !downLatch)}
              >
                {downLatch ? "ON" : "OFF"}
              </Button>
              
            </div>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("Demo")}
            >
              <Play className="h-5 w-5 text-emerald-400" />
              <span>Demo</span>
            </Button>
            
          </div>
        </div>
      </div>
    </div>
  );
}
