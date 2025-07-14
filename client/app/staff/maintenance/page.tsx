"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  Zap,
  Coffee,
  Droplets,
  Settings,
  Play,
  Thermometer,
  Wrench,
  AlertCircle,
} from "lucide-react";

interface Machine {
  machine_id: string;
  location: string;
  status: string;
}

interface StaffData {
  staff_id: string;
  name: string;
  assigned_machines: Machine[];
}

export default function StaffMaintenancePage() {
  const searchParams = useSearchParams();
  const initialMachineId = searchParams.get("machine");

  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [upLatch, setUpLatch] = useState(false);
  const [downLatch, setDownLatch] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);

  useEffect(() => {
    const storedStaffData = localStorage.getItem("staffData");
    if (storedStaffData) {
      const parsedData = JSON.parse(storedStaffData);
      setStaffData(parsedData);

      // Set initial machine if provided in URL
      if (
        initialMachineId &&
        parsedData.assigned_machines?.some(
          (m: Machine) => m.machine_id === initialMachineId
        )
      ) {
        setSelectedMachine(initialMachineId);
      } else if (parsedData.assigned_machines?.length > 0) {
        setSelectedMachine(parsedData.assigned_machines[0].machine_id);
      }
    }
  }, [initialMachineId]);

  // Simulate MQTT connection when machine is selected
  useEffect(() => {
    if (selectedMachine) {
      // Simulate connecting to machine-specific MQTT topic
      setMqttConnected(true);
      console.log(`Connected to MQTT topic for machine: ${selectedMachine}`);
    } else {
      setMqttConnected(false);
    }
  }, [selectedMachine]);

  const sendMqttMessage = async (message: string) => {
    if (!selectedMachine) {
      toast({
        title: "Error",
        description: "Please select a machine first",
        variant: "destructive",
      });
      return;
    }

    setProcessing(message);
    toast({
      title: "Processing",
      description: `Sending command to ${
        getSelectedMachineData()?.location
      }: ${message}`,
    });

    // Simulate MQTT communication with retry mechanism
    let gotResponse = false;
    let retries = 0;

    while (!gotResponse && retries < 3) {
      try {
        // Simulate sending MQTT message to machine-specific topic
        console.log(`Sending MQTT message to ${selectedMachine}/${message}`);

        // Simulate waiting for response
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Simulate response (in real implementation, this would be MQTT subscription)
        const success = Math.random() > 0.3;

        if (success) {
          console.log(`Received "got" feedback for: ${message}`);
          gotResponse = true;
          toast({
            title: "Success",
            description: `Command ${message} acknowledged by ${
              getSelectedMachineData()?.location
            }`,
          });

          // Wait for "done" message (simulated)
          await new Promise((resolve) => setTimeout(resolve, 2000));
          toast({
            title: "Completed",
            description: `Command ${message} completed on ${
              getSelectedMachineData()?.location
            }`,
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
      });
    }

    setProcessing(null);
  };

  const handleToggle = (type: "up" | "down", state: boolean) => {
    if (type === "up") {
      setUpLatch(state);
      sendMqttMessage(state ? "up_on" : "up_off");
    } else {
      setDownLatch(state);
      sendMqttMessage(state ? "down_on" : "down_off");
    }
  };

  const getSelectedMachineData = () => {
    return staffData?.assigned_machines?.find(
      (m) => m.machine_id === selectedMachine
    );
  };

  if (
    !staffData?.assigned_machines ||
    staffData.assigned_machines.length === 0
  ) {
    return (
      <div className="p-8">
        <Card className="bg-[#141414] border-gray-800">
          <CardContent className="p-8 text-center">
            <Wrench size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 mb-2">No machines assigned</p>
            <p className="text-sm text-gray-500">
              Contact your administrator to get machines assigned to you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-200 p-6">
      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#141414] p-6 rounded-xl shadow-2xl border border-gray-800 w-full max-w-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-[#1A1A1A] p-3 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  Processing Command
                </h3>
                <p className="text-gray-400">{processing}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Machine Maintenance
        </h1>
        <p className="text-gray-400">
          Control and maintain your assigned machines
        </p>
      </div>

      {/* Machine Selector */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-xs">
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="bg-[#141414] border-gray-800 text-white">
                <SelectValue placeholder="Select a machine" />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-gray-800">
                {staffData.assigned_machines.map((machine) => (
                  <SelectItem
                    key={machine.machine_id}
                    value={machine.machine_id}
                    className="text-white"
                  >
                    {machine.location} ({machine.machine_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMachine && (
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="border-blue-600/30 text-blue-400"
              >
                {getSelectedMachineData()?.location}
              </Badge>
              <Badge
                className={
                  mqttConnected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }
              >
                {mqttConnected ? "MQTT Connected" : "MQTT Disconnected"}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {selectedMachine ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Section 1 - Brewing Controls (Largest) */}
          <div className="col-span-12 md:col-span-6 bg-[#141414] rounded-xl p-6 border border-gray-800 shadow-lg">
            <h2 className="text-2xl font-semibold mb-5 text-white flex items-center">
              <Settings className="mr-2 h-5 w-5 text-emerald-400" />
              Brewing Controls
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
                onClick={() => sendMqttMessage("flushing")}
                disabled={processing !== null}
              >
                <Droplets className="h-5 w-5 text-emerald-400" />
                <span>Start Flush</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
                onClick={() => sendMqttMessage("main_brew-1")}
                disabled={processing !== null}
              >
                <Coffee className="h-5 w-5 text-emerald-400" />
                <span>Coffee Brew</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
                onClick={() => sendMqttMessage("main_brew-2")}
                disabled={processing !== null}
              >
                <Coffee className="h-5 w-5 text-amber-400" />
                <span>Tea Brew</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
                onClick={() => sendMqttMessage("intermideate_brew-1")}
                disabled={processing !== null}
              >
                <Coffee className="h-5 w-5 text-emerald-400 opacity-70" />
                <span className="text-xs text-center">Intermediate Coffee</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
                onClick={() => sendMqttMessage("Intermideate_brew-2")}
                disabled={processing !== null}
              >
                <Coffee className="h-5 w-5 text-amber-400 opacity-70" />
                <span className="text-xs text-center">Intermediate Tea</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 h-16 flex flex-col items-center justify-center gap-1 text-zinc-300"
                onClick={() => sendMqttMessage("Demo")}
                disabled={processing !== null}
              >
                <Play className="h-5 w-5 text-emerald-400" />
                <span>Demo</span>
              </Button>
            </div>
          </div>

          {/* Section 2 - Brew Types (Second largest) */}
          <div className="col-span-12 md:col-span-4 bg-[#141414] rounded-xl p-6 border border-gray-800 shadow-lg">
            <h2 className="text-2xl font-semibold mb-5 text-white flex items-center">
              <Coffee className="mr-2 h-5 w-5 text-emerald-400" />
              Brew Types
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
                onClick={() => sendMqttMessage("black_tea")}
                disabled={processing !== null}
              >
                Black Tea
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
                onClick={() => sendMqttMessage("strong_tea")}
                disabled={processing !== null}
              >
                Strong Tea
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
                onClick={() => sendMqttMessage("light_tea")}
                disabled={processing !== null}
              >
                Light Tea
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-amber-400 text-zinc-300"
                onClick={() => sendMqttMessage("hot_milk")}
                disabled={processing !== null}
              >
                Hot Milk
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
                onClick={() => sendMqttMessage("coffee_brew")}
                disabled={processing !== null}
              >
                Coffee Brew
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-blue-400 text-zinc-300"
                onClick={() => sendMqttMessage("hot_water")}
                disabled={processing !== null}
              >
                Hot Water
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
                onClick={() => sendMqttMessage("light_coffee")}
                disabled={processing !== null}
              >
                Light Coffee
              </Button>
              <Button
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
                onClick={() => sendMqttMessage("strong_coffee")}
                disabled={processing !== null}
              >
                Strong Coffee
              </Button>
            </div>
          </div>

          {/* Section 3 - Controls (Smallest) */}
          <div className="col-span-12 md:col-span-2 bg-[#141414] rounded-xl p-6 border border-gray-800 shadow-lg">
            <h2 className="text-2xl font-semibold mb-5 text-white flex items-center">
              <Zap className="mr-2 h-5 w-5 text-emerald-400" />
              Controls
            </h2>

            {/* Basic Controls */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
                onClick={() => sendMqttMessage("up")}
                disabled={processing !== null}
              >
                Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
                onClick={() => sendMqttMessage("down")}
                disabled={processing !== null}
              >
                Down
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
                onClick={() => sendMqttMessage("save")}
                disabled={processing !== null}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1A1A1A] border-gray-700 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300"
                onClick={() => sendMqttMessage("exit")}
                disabled={processing !== null}
              >
                Exit
              </Button>
            </div>

            {/* Toggle Controls */}
            <div className="space-y-4">
              <div className="bg-[#1A1A1A] rounded-lg p-3 flex items-center justify-between">
                <span className="text-zinc-300">Up Latch</span>
                <Button
                  size="sm"
                  className={`${
                    upLatch
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  } text-white min-w-[60px]`}
                  onClick={() => handleToggle("up", !upLatch)}
                  disabled={processing !== null}
                >
                  {upLatch ? "ON" : "OFF"}
                </Button>
              </div>
              <div className="bg-[#1A1A1A] rounded-lg p-3 flex items-center justify-between">
                <span className="text-zinc-300">Down Latch</span>
                <Button
                  size="sm"
                  className={`${
                    downLatch
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  } text-white min-w-[60px]`}
                  onClick={() => handleToggle("down", !downLatch)}
                  disabled={processing !== null}
                >
                  {downLatch ? "ON" : "OFF"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="bg-[#141414] border-gray-800">
          <CardContent className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 mb-2">
              Select a machine to begin maintenance
            </p>
            <p className="text-sm text-gray-500">
              Choose a machine from the dropdown above to access maintenance
              controls.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
