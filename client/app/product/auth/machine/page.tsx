"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { machineService } from "@/lib/api/services";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
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
  Database,
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
  const [errorShake, setErrorShake] = useState(false);

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

  const handleMachineAuth = async (
    values: z.infer<typeof machineFormSchema>
  ) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      // Check if the machine ID exists in the database
      const response = await machineService.getMachineById(values.machine_id);

      if (!response.success) {
        // Show error animation
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 500);

        // Show specific error message based on error type
        if (response.error === "not_found") {
          setStatusMessage({
            type: "error",
            message: "Machine ID not found. Please check and try again.",
          });
        } else {
          setStatusMessage({
            type: "error",
            message:
              response.message ||
              "Invalid machine ID. Please enter a valid machine ID.",
          });
        }
        return;
      }

      // Store machine ID in localStorage
      localStorage.setItem("machineId", values.machine_id);

      // Store machine info if available
      if (response.data) {
        localStorage.setItem(
          "machineLocation",
          response.data.location || "Unknown Location"
        );
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
    } catch (error: unknown) {
      console.error("Machine authentication error:", error);

      // Show error shake animation
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);

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
      <div className="min-h-screen bg-[#F4EBDE] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#5F3023]">
              MACHINE AUTHENTICATION
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        {/* Light effect elements */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#C28654]/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8A5738]/30 rounded-full blur-3xl"></div>

        {/* Coffee bean patterns */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="coffee-pattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0 L20 0 L20 20 L40 20 L40 40 L60 40 L60 60 L80 60 L80 80 L100 80"
              fill="none"
              stroke="rgba(95, 48, 35, 0.5)"
              strokeWidth="1"
            />
            <path
              d="M0 100 L20 100 L20 80 L40 80 L40 60 L60 60 L60 40 L80 40 L80 20 L100 20"
              fill="none"
              stroke="rgba(95, 48, 35, 0.5)"
              strokeWidth="1"
            />
          </pattern>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#coffee-pattern)"
          />
        </svg>

        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#8A5738]/20"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Header with logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-8 left-8 z-10 flex items-center"
      >
        <div className="relative p-3 bg-gradient-to-br from-[#C28654]/30 to-[#8A5738]/20 rounded-xl mr-3 backdrop-blur-lg border border-[#C28654]/30">
          <Coffee size={32} className="text-[#5F3023]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#5F3023] tracking-tight">
            FROTH<span className="text-[#C28654]">FILTER</span>
          </h2>
          <p className="text-[#8A5738] text-sm">Machine Authentication</p>
        </div>
      </motion.div>

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="absolute top-8 right-8 z-10 text-[#8A5738] hover:text-[#5F3023] hover:bg-[#C28654]/20"
      >
        <ChevronLeft size={18} className="mr-1" />
        <span className="text-sm">Back</span>
      </Button>

      {/* Main content with 3D card effect */}
      <div className="z-10 w-full max-w-md">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className={`bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-[#DAB49D]/50 shadow-2xl ${
            errorShake ? "animate-shake" : ""
          }`}
          style={{
            boxShadow: "0 25px 50px -12px rgba(194, 134, 84, 0.3)",
          }}
        >
          {/* Content header */}
          <div className="mb-8 text-center relative">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C28654] to-[#8A5738] rounded-xl opacity-20 blur-md"></div>
              <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-[#C28654]/20 to-[#8A5738]/10 rounded-xl backdrop-blur-lg border border-[#C28654]/20">
                <Coffee size={36} className="text-[#5F3023]" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-[#5F3023]">MACHINE SETUP</h2>
            <div className="mt-2 w-16 h-1 bg-gradient-to-r from-[#C28654]/50 to-[#8A5738]/50 rounded-full mx-auto"></div>
            <p className="text-[#8A5738] mt-3 text-sm">
              Enter your machine ID to connect
            </p>
          </div>

          {/* Status message */}
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert
                variant={
                  statusMessage.type === "error" ? "destructive" : "default"
                }
                className={`border ${
                  statusMessage.type === "success"
                    ? "bg-green-100 border-green-200 text-green-800"
                    : "bg-red-100 border-red-200 text-red-800"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                <AlertDescription>{statusMessage.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Machine ID Form */}
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
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Enter Machine ID"
                          className="h-14 px-5 py-3 text-lg bg-white/70 border-[#DAB49D] focus:border-[#C28654] focus:ring-[#8A5738]/30 text-[#5F3023] rounded-xl backdrop-blur-sm"
                          {...field}
                        />
                      </FormControl>
                      <Database
                        size={20}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C28654]"
                      />
                    </div>
                    <FormDescription className="text-xs text-[#8A5738]/70 mt-2 ml-2">
                      Enter the unique ID assigned to your coffee machine
                    </FormDescription>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-medium bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white rounded-xl shadow-lg relative overflow-hidden"
                >
                  {/* Button shine effect */}
                  <motion.div
                    className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["120%", "-120%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    style={{
                      maskImage:
                        "linear-gradient(to right, transparent, black, transparent)",
                    }}
                  />

                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      "Connect Machine"
                    )}
                  </div>
                </Button>
              </motion.div>
            </form>
          </Form>

          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-1 w-1 rounded-full bg-[#C28654]/40"
                ></div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-xs text-[#8A5738]/70"
        >
          © FrothFilter Coffee Systems • Secure Machine Authentication Portal
        </motion.p>
      </div>
    </div>
  );
}
