"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle, Coffee, Loader } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const recipeName = searchParams.get("recipe") || "Coffee";
  const price = searchParams.get("price") || "0";
  const [userName, setUserName] = useState<string>("Customer");
  const [preparationStep, setPreparationStep] = useState<number>(1);
  const [orderReady, setOrderReady] = useState<boolean>(false);
  const router = useRouter();

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol"
  }).format(parseFloat(price));

  // Get user name from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Simulate preparation steps with timeouts
  useEffect(() => {
    const stepTimeouts = [
      setTimeout(() => setPreparationStep(2), 3000),
      setTimeout(() => setPreparationStep(3), 6000),
      setTimeout(() => setPreparationStep(4), 9000),
      setTimeout(() => {
        setPreparationStep(5);
        setOrderReady(true);
        
        // Set timeout to redirect to login page and clear user data
        setTimeout(() => {
          // Clear all user data from localStorage
          localStorage.clear();
          // Redirect to login page
          router.push("/product/pages/screensaver");
        }, 5000);
      }, 12000)
    ];

    return () => stepTimeouts.forEach(timeout => clearTimeout(timeout));
  }, [router]);

  const preparationSteps = [
    { text: "Grinding fresh beans...", gif: "/coffee-grinding.gif" },
    { text: "Heating water to perfect temperature...", gif: "/water-heating.gif" },
    { text: "Brewing your perfect coffee...", gif: "/coffee-brewing.gif" },
    { text: "Adding final touches...", gif: "/coffee-final.gif" },
    { text: "Your coffee is ready!", gif: "/coffee-ready.gif" }
  ];

  // Use placeholder GIFs if actual ones not available
  const currentGif = preparationSteps[preparationStep - 1]?.gif || "/coffee-placeholder.gif";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-3xl p-8 border border-amber-500/20 shadow-[0_0_40px_rgba(251,191,36,0.15)]"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 10 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        >
          <CheckCircle className="h-12 w-12 text-green-500" />
        </motion.div>

        {/* Success message */}
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
          Payment Received!
        </h1>
        <h2 className="text-lg text-amber-500 text-center mb-6">
          Thank you, {userName}
        </h2>
        
        <div className="bg-white/5 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Order:</span>
            <span className="text-white font-medium">{recipeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount:</span>
            <span className="text-amber-500 font-bold">{formattedPrice}</span>
          </div>
        </div>

        {/* Preparation animation */}
        <div className="mb-6 relative overflow-hidden rounded-xl aspect-video border border-amber-900/20">
          {/* If no actual GIFs are available, show a placeholder */}
          <div className="w-full h-full bg-black/40 flex items-center justify-center">
            {orderReady ? (
              <div className="text-center p-4">
                <Coffee className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                <p className="text-white font-medium">Your coffee is ready!</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Loader className="h-10 w-10 text-amber-500 mx-auto mb-2 animate-spin" />
                <p className="text-white/70">{preparationSteps[preparationStep - 1]?.text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
          <motion.div 
            initial={{ width: "20%" }}
            animate={{ width: `${preparationStep * 20}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
          />
        </div>

        {/* Back button (enabled when ready) */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold border-none"
            disabled={!orderReady}
            onClick={() => {
              // Clear all user data from localStorage
              localStorage.clear();
              // Redirect to login page
              router.push("/product/pages/screensaver");
            }}
          >
            {orderReady ? "See you next time!" : "Preparing your order..."}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 