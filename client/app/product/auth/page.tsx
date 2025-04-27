"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { machineService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Coffee, Loader2, Lock, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MachineAuthPage() {
  const router = useRouter();
  const [machineIdInput, setMachineIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMachineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Attempt to fetch machine by ID to verify it exists
      const response = await machineService.getMachineById(machineIdInput);

      if (!response.success || !response.data) {
        setError("Machine not found. Please check the ID and try again.");
        setIsLoading(false);
        return;
      }

      // Store the authenticated machine ID in localStorage
      localStorage.setItem("machineId", machineIdInput);

      // Navigate to the screensaver page
      router.push("/product/screensaver");
    } catch (err) {
      setError(
        "Authentication failed. Please check your connection and try again."
      );
      console.error("Machine auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Only render animations after component has mounted on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">
              MACHINE <span className="text-amber-500">AUTHENTICATION</span>
            </h2>
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

      {/* Header - Back Link */}
      <Link href="/" className="absolute top-8 left-8 z-10">
        <motion.div
          whileHover={{ x: -3 }}
          className="flex items-center text-gray-400 hover:text-amber-500 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="ml-1 text-sm">Back to Home</span>
        </motion.div>
      </Link>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title Section */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              className="inline-flex mb-6 p-3 bg-gradient-to-br from-amber-600/30 to-amber-800/10 rounded-full"
            >
              <Lock size={32} className="text-amber-500" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              MACHINE <span className="text-amber-500">AUTHENTICATION</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-gray-400"
            >
              Enter your machine identifier to continue
            </motion.p>
          </div>

          {/* Card Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="bg-[#141414] backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-[#292929]">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-b border-red-900/30"
                >
                  <Alert
                    variant="destructive"
                    className="rounded-none bg-red-900/20 border-0 text-red-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="p-8">
                <form onSubmit={handleMachineAuth} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Machine ID
                    </label>
                    <div className="relative">
                      <Input
                        id="machineId"
                        type="text"
                        placeholder="Enter your machine ID"
                        value={machineIdInput}
                        onChange={(e) => setMachineIdInput(e.target.value)}
                        className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                        required
                        disabled={isLoading}
                      />
                      <Coffee
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      The unique identifier assigned to your coffee machine
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className={`w-full h-12 text-base font-medium ${
                        isLoading
                          ? "bg-amber-800/20 text-amber-300/80"
                          : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white"
                      }`}
                      disabled={isLoading || !machineIdInput}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-300/80" />
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <span>Authenticate Machine</span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>

              <div className="py-4 px-8 border-t border-[#292929] flex justify-center">
                <p className="text-xs text-gray-500">
                  Contact{" "}
                  <span className="text-amber-500 hover:underline cursor-pointer">
                    support@frothfilter.com
                  </span>{" "}
                  for assistance
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Coffee bean animation at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="flex items-center text-xs text-gray-500 tracking-widest"
        >
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-gray-800 mr-4"></span>
          SECURE CONNECTION
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-gray-800 ml-4"></span>
        </motion.div>
      </motion.div>
    </div>
  );
}
