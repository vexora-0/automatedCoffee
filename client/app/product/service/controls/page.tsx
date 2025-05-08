"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  Zap,
  Coffee,
  Droplets,
  Settings,
  Play,
  Thermometer,
} from "lucide-react";

export default function ControlsPage() {
  const [processing, setProcessing] = useState<string | null>(null);
  const [upLatch, setUpLatch] = useState(false);
  const [downLatch, setDownLatch] = useState(false);

  // MQTT connection would be initialized here in a real implementation
  // For demo purposes, we'll simulate the MQTT communication

  const sendMqttMessage = async (message: string) => {
    setProcessing(message);
    toast({
      title: "Processing",
      description: `Sending command: ${message}`,
      className: "bg-zinc-900 border-zinc-800 text-white",
    });

    // Retry mechanism
    let gotResponse = false;
    let retries = 0;

    while (!gotResponse && retries < 3) {
      try {
        // Simulate sending MQTT message
        console.log(`Sending MQTT message: ${message}`);

        // Simulate waiting for response
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Simulate response (in a real implementation, this would be an MQTT subscription)
        // For demo purposes, randomly succeed or fail
        const success = Math.random() > 0.3;

        if (success) {
          console.log(`Received "got" feedback for: ${message}`);
          gotResponse = true;
          toast({
            title: "Success",
            description: `Command ${message} acknowledged`,
            className: "bg-zinc-900 border-zinc-800 text-emerald-400",
          });

          // Wait for "done" message (simulated)
          await new Promise((resolve) => setTimeout(resolve, 2000));
          toast({
            title: "Completed",
            description: `Command ${message} completed`,
            className: "bg-zinc-900 border-zinc-800 text-emerald-400",
          });
        } else {
          console.log(`No response for: ${message}, retry ${retries + 1}/3`);
          retries++;
        }
      } catch (error) {
        console.error(`Error sending MQTT message: ${error}`);
        retries++;
      }
    }

    if (!gotResponse) {
      toast({
        title: "Failed",
        description: `Command ${message} failed after 3 retries`,
        variant: "destructive",
        className: "bg-zinc-900 border-zinc-800 text-red-400",
      });
    }

    setProcessing(null);
  };

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
              onClick={() => sendMqttMessage("flushing")}
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
              onClick={() => sendMqttMessage("Intermideate_brew-2")}
            >
              <Coffee className="h-5 w-5 text-amber-400 opacity-70" />
              <span className="text-xs text-center">Intermediate Tea</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("Subtank_fill-1")}
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
              onClick={() => sendMqttMessage("Demo")}
            >
              <Play className="h-5 w-5 text-emerald-400" />
              <span>Demo</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("Count_display")}
            >
              <Thermometer className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-center">Display Temperature</span>
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
              onClick={() => sendMqttMessage("programming")}
            >
              <Settings className="h-5 w-5 text-emerald-400" />
              <span>Program</span>
            </Button>
          </div>
        </div>

        {/* Section 2 (Second largest) */}
        <div className="col-span-12 md:col-span-4 bg-zinc-900 rounded-xl p-6 border border-zinc-800 shadow-lg">
          <h2 className="text-2xl font-semibold mb-5 text-white flex items-center">
            <Coffee className="mr-2 h-5 w-5 text-emerald-400" />
            Brew Types
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
              onClick={() => sendMqttMessage("flushing")}
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

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button
              size="sm"
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
              onClick={() => sendMqttMessage("up")}
            >
              Up
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
              onClick={() => sendMqttMessage("down")}
            >
              Down
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
              onClick={() => sendMqttMessage("save")}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
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
          </div>
        </div>
      </div>
    </div>
  );
}
