"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { machineService } from "@/lib/api/services";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Loader2,
  Coffee,
  ChevronLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define machine ID validation schema
const machineFormSchema = z.object({
  machine_id: z.string().min(1, {
    message: "Machine ID is required.",
  }),
});

export default function MachineAuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Check if machine ID is already stored
    const storedMachineId = localStorage.getItem("machineId");
    
    if (storedMachineId) {
      // Machine ID exists, redirect to screensaver
      router.push("/product/screensaver");
    }
  }, [router]);

  // Define machine form with validation
  const machineForm = useForm<z.infer<typeof machineFormSchema>>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      machine_id: "",
    },
  });

  const handleMachineAuth = async (values: z.infer<typeof machineFormSchema>) => {
    setIsLoading(true);
    setStatusMessage(null);
    
    try {
      // Check if the machine ID exists in the database
      const response = await machineService.getMachineById(values.machine_id);
      
      if (!response.success) {
        // Show specific error message based on error type
        if (response.error === 'not_found') {
          setStatusMessage({
            type: "error",
            message: "Machine ID not found. Please check and try again.",
          });
        } else {
          setStatusMessage({
            type: "error",
            message: response.message || "Invalid machine ID. Please enter a valid machine ID.",
          });
        }
        return;
      }
      
      // Store machine ID in localStorage
      localStorage.setItem("machineId", values.machine_id);
      
      // Store machine info if available
      if (response.data) {
        localStorage.setItem("machineLocation", response.data.location || "Unknown Location");
      }
      
      // Show success message
      setStatusMessage({
        type: "success",
        message: "Machine authenticated successfully!",
      });
      
      // Redirect to screensaver after a short delay
      setTimeout(() => {
        router.push("/product/screensaver");
      }, 1000);
    } catch (error: any) {
      console.error("Machine authentication error:", error);
      
      setStatusMessage({
        type: "error",
        message: "Connection error. Please check your network and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  // SSR safe rendering
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">MACHINE AUTHENTICATION</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] to-black opacity-80"></div>
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-900/5"
              style={{
                width: Math.random() * 4 + 2 + "px",
                height: Math.random() * 4 + 2 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
            ></div>
          ))}
        </div>
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-8 left-8 md:left-12 flex items-center z-20"
      >
        <motion.div
          initial={{ rotate: -20 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Coffee size={36} className="text-amber-500 mr-3" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          FROTH<span className="text-amber-500">FILTER</span>
        </h2>
      </motion.div>

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="absolute top-8 right-8 text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
      >
        <ChevronLeft size={24} />
      </Button>

      {/* Main content */}
      <div className="z-10 w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white">MACHINE SETUP</h2>
          <p className="text-gray-400 mt-2">Enter your machine ID to continue</p>
        </div>

        {statusMessage && (
          <Alert
            variant={statusMessage.type === "error" ? "destructive" : "default"}
            className={`mb-6 ${
              statusMessage.type === "success"
                ? "bg-green-900/20 border-green-800/50 text-green-400"
                : ""
            }`}
          >
            {statusMessage.type === "success" ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            <AlertDescription>{statusMessage.message}</AlertDescription>
          </Alert>
        )}

        <Form {...machineForm}>
          <form
            onSubmit={machineForm.handleSubmit(handleMachineAuth)}
            className="space-y-6"
          >
            <FormField
              control={machineForm.control}
              name="machine_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Machine ID"
                      className="text-lg py-6 bg-[#1A1A1A] border-[#333] focus:border-amber-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-6 text-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Authenticate Machine"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 