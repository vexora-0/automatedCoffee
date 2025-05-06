"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Coffee, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMqttContext } from "@/components/MqttProvider";
import Image from "next/image";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const recipeName = searchParams.get("recipe") || "Coffee";
  const price = searchParams.get("price") || "0";
  const [userName, setUserName] = useState<string>("Customer");
  const [preparationStep, setPreparationStep] = useState<number>(1);
  const [orderReady, setOrderReady] = useState<boolean>(false);
  const router = useRouter();
  const { isConnected, publish } = useMqttContext();
  const recipePublishedRef = useRef(false);

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
  }).format(parseFloat(price));

  // Get user name from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Send recipe name to MQTT input topic when connected
  useEffect(() => {
    if (isConnected && recipeName && !recipePublishedRef.current) {
      console.log(`Sending recipe "${recipeName}" to MQTT input topic`);
      publish(recipeName);
      recipePublishedRef.current = true;
    }
  }, [isConnected, recipeName, publish]);

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
          router.push("/product/screensaver");
        }, 5000);
      }, 12000),
    ];

    return () => stepTimeouts.forEach((timeout) => clearTimeout(timeout));
  }, [router]);

  const preparationSteps = [
    { text: "Grinding fresh beans...", gif: "/coffee-grinding.gif" },
    {
      text: "Heating water to perfect temperature...",
      gif: "/water-heating.gif",
    },
    { text: "Brewing your perfect coffee...", gif: "/coffee-brewing.gif" },
    { text: "Adding final touches...", gif: "/coffee-final.gif" },
    { text: "Your coffee is ready!", gif: "/coffee-ready.gif" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4EBDE] to-[#DAB49D]/30 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-[#C28654]/30 shadow-[0_0_40px_rgba(194,134,84,0.15)]"
      >
        {/* Logo at top */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-12">
            <Image
              src="/brownlogo.svg"
              alt="Froth Filter Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 10 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#8A5738]/20 to-[#8A5738]/10 rounded-full flex items-center justify-center border border-[#8A5738]/30 shadow-[0_0_20px_rgba(138,87,56,0.2)]"
        >
          <CheckCircle className="h-12 w-12 text-[#5F3023]" />
        </motion.div>

        {/* Success message */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#5F3023] text-center mb-2">
          Payment Received!
        </h1>
        <h2 className="text-lg text-[#8A5738] text-center mb-6">
          Thank you, {userName}
        </h2>

        <div className="bg-[#F4EBDE]/80 rounded-xl p-4 mb-6 backdrop-blur-sm border border-[#DAB49D]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#8A5738]">Order:</span>
            <span className="text-[#5F3023] font-medium">{recipeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8A5738]">Amount:</span>
            <span className="text-[#C28654] font-bold">{formattedPrice}</span>
          </div>
        </div>

        {/* Preparation animation */}
        <div className="mb-6 relative overflow-hidden rounded-xl aspect-video border border-[#C28654]/20">
          {/* If no actual GIFs are available, show a placeholder */}
          <div className="w-full h-full bg-[#F4EBDE]/70 flex items-center justify-center">
            {orderReady ? (
              <div className="text-center p-4">
                <Coffee className="h-12 w-12 text-[#8A5738] mx-auto mb-2" />
                <p className="text-[#5F3023] font-medium">
                  Your coffee is ready!
                </p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Loader className="h-10 w-10 text-[#8A5738] mx-auto mb-2 animate-spin" />
                <p className="text-[#5F3023]/70">
                  {preparationSteps[preparationStep - 1]?.text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#DAB49D]/50 rounded-full mb-6 overflow-hidden">
          <motion.div
            initial={{ width: "20%" }}
            animate={{ width: `${preparationStep * 20}%` }}
            className="h-full bg-gradient-to-r from-[#C28654] to-[#8A5738] rounded-full"
          />
        </div>

        {/* Back button (enabled when ready) */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full py-4 bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white font-bold border-none"
            disabled={!orderReady}
            onClick={() => {
              // Clear all user data from localStorage
              localStorage.clear();
              // Redirect to login page
              router.push("/product/screensaver");
            }}
          >
            {orderReady ? "See you next time!" : "Preparing your order..."}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
