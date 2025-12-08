"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Coffee,
  ThumbsUp,
  Droplet,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMqttContext } from "@/components/MqttProvider";
import Image from "next/image";
import { machineService } from "@/lib/api/services";

// Success quotes to display randomly
const SUCCESS_QUOTES = [
  "Brewing happiness, one cup at a time.",
  "Life begins after coffee.",
  "Coffee: a liquid hug for your brain.",
  "Behind every successful person is a substantial amount of coffee.",
  "Take life one sip at a time.",
  "Coffee is the best medicine.",
];

// Order preparation steps
const PREPARATION_STEPS = [
  {
    id: 1,
    title: "Grinding",
    description: "Precision grinding fresh beans to perfection",
    icon: Coffee,
    color: "#C28654",
    animation: "rotate",
  },
  {
    id: 2,
    title: "Heating",
    description: "Water heated to the optimal temperature",
    icon: Droplet,
    color: "#8A5738",
    animation: "pulse",
  },
  {
    id: 3,
    title: "Brewing",
    description: "Creating your perfect blend",
    icon: Coffee,
    color: "#5F3023",
    animation: "bounce",
  },
  {
    id: 4,
    title: "Ready!",
    description: "Your perfect brew awaits",
    icon: ThumbsUp,
    color: "#5F3023",
    animation: "scale",
  },
];

// Deterministic pseudo-random generator to keep server and client renders in sync
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Helper function to round values consistently for SSR/CSR matching
const roundValue = (value: number, decimals: number = 4): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Helper to format percentage values consistently
const formatPercent = (value: number): string => {
  return `${roundValue(value, 4)}%`;
};

// Helper to format pixel values consistently
const formatPx = (value: number): string => {
  return `${roundValue(value, 2)}px`;
};

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [recipeName, setRecipeName] = useState<string>("Coffee");
  const [price, setPrice] = useState<string>("0");
  const [userName, setUserName] = useState<string>("Coffee Lover");
  const [preparationStep, setPreparationStep] = useState<number>(1);
  const [orderReady, setOrderReady] = useState<boolean>(false);
  const router = useRouter();
  const { isConnected, publish } = useMqttContext();
  const recipePublishedRef = useRef(false);
  const [randomQuote, setRandomQuote] = useState<string>("");
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  // Format price - will update when price state changes
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
  }).format(parseFloat(price));

  // Get order data from localStorage and user name from sessionStorage
  useEffect(() => {
    // Set window size for client-side rendering
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }

    // Fetch order data - prioritize localStorage, fallback to URL params
    try {
      const urlRecipe = searchParams.get("recipe");
      const urlPrice = searchParams.get("price");
      
      // Check localStorage first
      const orderDataStr = localStorage.getItem("orderData");
      if (orderDataStr) {
        const orderData = JSON.parse(orderDataStr);
        if (orderData.recipe) {
          setRecipeName(orderData.recipe);
        }
        if (orderData.price) {
          setPrice(orderData.price);
        }
        console.log("[Success] Loaded order data from localStorage:", orderData);
      } else if (urlRecipe || urlPrice) {
        // If no localStorage but URL params exist (actual payment flow)
        // Set localStorage from URL params for consistency
        const orderData = {
          recipe: urlRecipe || 'Coffee',
          price: urlPrice || '0',
          orderId: '',
          recipeId: '',
          machineId: localStorage.getItem('machineId') || '',
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('orderData', JSON.stringify(orderData));
        
        if (urlRecipe) setRecipeName(urlRecipe);
        if (urlPrice) setPrice(urlPrice);
        console.log("[Success] Set order data in localStorage from URL parameters:", orderData);
      }
    } catch (error) {
      console.error("[Success] Failed to load order data:", error);
      // Final fallback to URL parameters
      const urlRecipe = searchParams.get("recipe");
      const urlPrice = searchParams.get("price");
      if (urlRecipe) setRecipeName(urlRecipe);
      if (urlPrice) setPrice(urlPrice);
    }

    // Get user name from sessionStorage
    const storedUserName = sessionStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // Set random quote using deterministic seed
    const quoteIndex = Math.floor(seededRandom(42) * SUCCESS_QUOTES.length);
    setRandomQuote(SUCCESS_QUOTES[quoteIndex]);

    // Prevent scrolling on tablets - fixed for tablet 1340x800
    const preventTouchScroll = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    const preventWheelScroll = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    // Disable scrolling - fixed for tablet 1340x800
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '800px';
      document.body.style.width = '1340px';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      
      // Prevent touch and wheel scrolling
      document.addEventListener('touchmove', preventTouchScroll, { passive: false });
      document.addEventListener('wheel', preventWheelScroll, { passive: false });
    }

    return () => {
      // Re-enable scrolling on unmount
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.width = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.removeEventListener('touchmove', preventTouchScroll);
        document.removeEventListener('wheel', preventWheelScroll);
      }
    };
  }, [searchParams]);

  // Time counter effect
  useEffect(() => {
    if (!orderReady) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [orderReady]);

  // Send recipe name to MQTT input topic when connected
  useEffect(() => {
    if (isConnected && recipeName && !recipePublishedRef.current) {
      console.log(`Sending recipe "${recipeName}" to MQTT input topic`);
      const success = publish(recipeName);
      if (success) {
        console.log(`Recipe "${recipeName}" published successfully`);
        recipePublishedRef.current = true;
      } else {
        console.error(
          `Failed to publish recipe "${recipeName}" - MQTT client may not be connected`
        );
        // Retry after a short delay
        setTimeout(() => {
          if (isConnected && !recipePublishedRef.current) {
            const retrySuccess = publish(recipeName);
            if (retrySuccess) {
              recipePublishedRef.current = true;
            }
          }
        }, 1000);
      }
    }
  }, [isConnected, recipeName, publish]);

  // Simulate preparation steps with timeouts
  useEffect(() => {
    const stepTimeouts = [
      setTimeout(() => setPreparationStep(2), 3000),
      setTimeout(() => setPreparationStep(3), 6000),
      setTimeout(async () => {
        setPreparationStep(4);
        setShowConfetti(true);
        setOrderReady(true);

        // Update dispensers (machine inventory) after order completion
        try {
          const machineId = localStorage.getItem("machineId");
          if (machineId) {
            // Refresh machine inventory to update dispensers
            await machineService.getMachineInventory(machineId);
            console.log("[Success] Machine inventory refreshed after order");
          }
        } catch (error) {
          console.error("[Success] Failed to refresh machine inventory:", error);
        }

        // Set timeout to redirect to screensaver and clear user data
        setTimeout(() => {
          // Clear user login details from sessionStorage
          sessionStorage.removeItem("userId");
          sessionStorage.removeItem("userName");
          // Redirect to screensaver
          router.push("/product/screensaver");
        }, 5000);
      }, 9000),
    ];

    return () => stepTimeouts.forEach((timeout) => clearTimeout(timeout));
  }, [router]);

  // Format time elapsed
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D]/50 flex flex-col items-center justify-center relative overflow-hidden" style={{ width: '1340px', height: '800px', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated coffee color gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#C28654]/20 opacity-70"></div>

        {/* Coffee bean shape outlines */}
        {[...Array(15)].map((_, i) => {
          const seed = i * 7 + 13;
          const width = roundValue(seededRandom(seed) * 200 + 50, 2);
          const height = roundValue(seededRandom(seed + 1) * 300 + 100, 2);
          const left = roundValue(seededRandom(seed + 2) * 100, 4);
          const top = roundValue(seededRandom(seed + 3) * 100, 4);
          return (
            <motion.div
              key={`bean-${i}`}
              className="absolute border border-[#8A5738]/10 rounded-full"
              style={{
                width: formatPx(width),
                height: formatPx(height),
                borderRadius: "40% 60% 55% 45% / 60% 40% 60% 40%",
                left: formatPercent(left),
                top: formatPercent(top),
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.02, 0.98, 1],
                x: [0, roundValue(seededRandom(seed + 4) * 20 - 10, 2)],
                y: [0, roundValue(seededRandom(seed + 5) * 20 - 10, 2)],
              }}
              transition={{
                duration: roundValue(20 + seededRandom(seed + 6) * 10, 2),
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}

        {/* Subtle light flares */}
        {[...Array(5)].map((_, i) => {
          const seed = i * 11 + 23;
          const width = roundValue(seededRandom(seed) * 300 + 200, 2);
          const height = roundValue(seededRandom(seed + 1) * 300 + 200, 2);
          // Use fixed default window size for SSR consistency
          const defaultWidth = 1920;
          const defaultHeight = 1080;
          const xPos = roundValue(seededRandom(seed + 2) * defaultWidth, 2);
          const yPos = roundValue(seededRandom(seed + 3) * defaultHeight, 2);
          return (
            <motion.div
              key={`flare-${i}`}
              className="absolute rounded-full bg-white/10 blur-3xl"
              style={{
                width: formatPx(width),
                height: formatPx(height),
              }}
              initial={{
                x: formatPx(xPos),
                y: formatPx(yPos),
                opacity: 0.1,
              }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: roundValue(8 + seededRandom(seed + 4) * 5, 2),
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Confetti effect when order is ready */}
      {showConfetti && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(30)].map((_, i) => {
            const seed = i * 17 + 37;
            const leftPercent = roundValue(seededRandom(seed + 1) * 100, 4);
            const opacity = roundValue(seededRandom(seed + 2) * 0.8 + 0.2, 4);
            const rotate = roundValue(seededRandom(seed + 3) * 360, 2);
            return (
              <motion.div
                key={`confetti-${i}`}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: [
                    "#C28654",
                    "#8A5738",
                    "#5F3023",
                    "#F4EBDE",
                    "#DAB49D",
                  ][Math.floor(seededRandom(seed) * 5)],
                  top: "-5%",
                  left: formatPercent(leftPercent),
                  opacity: opacity,
                  rotate: `${rotate}deg`,
                }}
                animate={{
                  y: ["0vh", "100vh"],
                  x: [0, roundValue(seededRandom(seed + 4) * 100 - 50, 2)],
                  rotate: [0, roundValue(seededRandom(seed + 5) * 720 - 360, 2)],
                }}
                transition={{
                  duration: roundValue(2.5 + seededRandom(seed + 6) * 3, 2),
                  ease: "easeIn",
                  delay: roundValue(seededRandom(seed + 7) * 0.5, 2),
                }}
              />
            );
          })}
        </div>
      )}

      {/* Logo at top with frosted glass effect */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30"
      >
        <div className="bg-white/30 backdrop-blur-xl px-6 py-2 rounded-full border border-white/20 shadow-lg">
          <div className="relative w-28 h-8">
            <Image
              src="/brownlogo.svg"
              alt="Froth Filter Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Main content with 3D card effect */}
      <div className="relative z-20 w-full max-w-2xl" style={{ maxHeight: '720px', overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: -10 }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: { duration: 0.8, ease: "easeOut" },
          }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_20px_80px_-15px_rgba(194,134,84,0.4)] border border-white/40"
        >
          {/* Top section with success message */}
          <div className="relative px-6 pt-5 pb-4">
            {/* 3D floating success icon */}
            <div className="relative flex justify-center mb-4">
              <div className="absolute -inset-8 bg-gradient-to-r from-[#C28654]/10 via-[#F4EBDE]/5 to-[#5F3023]/10 rounded-full blur-xl opacity-70"></div>
              <motion.div
                className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#C28654] to-[#8A5738] shadow-[0_10px_30px_rgba(194,134,84,0.4)]"
                animate={{
                  y: [0, -8, 0],
                  boxShadow: [
                    "0 10px 30px rgba(194,134,84,0.4)",
                    "0 15px 40px rgba(194,134,84,0.6)",
                    "0 10px 30px rgba(194,134,84,0.4)",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <CheckCircle
                  className="h-10 w-10 text-white"
                  strokeWidth={2.5}
                />
              </motion.div>
            </div>

            {/* Success headings with animation */}
            <div className="text-center space-y-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-2xl font-bold text-[#5F3023]"
              >
                Payment Confirmed!
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg text-[#8A5738] font-medium"
              >
                Thank you, {userName}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-[#8A5738]/70 italic font-light px-4 text-xs mt-1"
              >
                &ldquo;{randomQuote}&rdquo;
              </motion.div>
            </div>
          </div>

          {/* Divider with coffee bean motif */}
          <div className="relative h-px w-full bg-gradient-to-r from-transparent via-[#C28654]/30 to-transparent">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-[#C28654]/30 flex items-center justify-center"
              >
                <div className="w-1.5 h-2.5 bg-[#C28654]/30 rounded-full"></div>
              </motion.div>
            </div>
          </div>

          {/* Order details with glass card effect */}
          <div className="px-6 pt-3 pb-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-inner"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-[10px] text-[#8A5738]/70 font-medium">
                    YOUR ORDER
                  </p>
                  <p className="text-base font-semibold text-[#5F3023]">
                    {recipeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#8A5738]/70 font-medium">PRICE</p>
                  <p className="text-base font-bold text-[#C28654]">
                    {formattedPrice}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-[#8A5738]">
                <Clock size={10} />
                <span>Time elapsed: {formatTime(timeElapsed)}</span>
              </div>
            </motion.div>
          </div>

          {/* Preparation steps with modern timeline */}
          <div className="px-6 pb-4 pt-1">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-[#C28654] via-[#8A5738] to-[#5F3023]/30"></div>

              {/* Timeline steps */}
              {PREPARATION_STEPS.map((step, index) => {
                const isActive = preparationStep >= step.id;
                const isCurrent = preparationStep === step.id;
                const isPast = preparationStep > step.id;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
                    transition={{
                      delay: index * 0.2,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className={`flex items-start mb-3 ${
                      isActive ? "" : "opacity-40"
                    }`}
                  >
                    {/* Step icon */}
                    <motion.div
                      animate={
                        isCurrent
                          ? {
                              scale: [1, 1.2, 1],
                              y: step.animation === "bounce" ? [0, -5, 0] : 0,
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: isCurrent ? Infinity : 0,
                        repeatType: "reverse",
                      }}
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        isActive ? `bg-[${step.color}]` : "bg-[#DAB49D]/30"
                      } ${isCurrent ? "ring-3 ring-[#C28654]/20" : ""}`}
                    >
                      {React.createElement(step.icon, {
                        className: `h-4 w-4 ${
                          isActive ? "text-white" : "text-[#8A5738]/50"
                        }`,
                        strokeWidth: 2.5,
                      })}

                      {/* Pulsing effect for current step */}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#C28654]/30"
                          animate={{
                            scale: [1, 1.6],
                            opacity: [0.7, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        />
                      )}

                      {/* Checkmark for completed steps */}
                      {isPast && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <CheckCircle className="h-2.5 w-2.5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Step content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-medium text-sm ${
                            isActive ? "text-[#5F3023]" : "text-[#8A5738]/50"
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isCurrent && !orderReady && (
                          <div className="ml-2 flex space-x-1">
                            <motion.div
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                repeatDelay: 0.1,
                              }}
                              className="w-1 h-1 rounded-full bg-[#C28654]"
                            />
                            <motion.div
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{
                                duration: 1.4,
                                delay: 0.2,
                                repeat: Infinity,
                                repeatDelay: 0.1,
                              }}
                              className="w-1 h-1 rounded-full bg-[#C28654]"
                            />
                            <motion.div
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{
                                duration: 1.4,
                                delay: 0.4,
                                repeat: Infinity,
                                repeatDelay: 0.1,
                              }}
                              className="w-1 h-1 rounded-full bg-[#C28654]"
                            />
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          isActive ? "text-[#8A5738]/80" : "text-[#8A5738]/40"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Completion button with custom animation */}
          <div className="px-6 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: orderReady ? 1 : 0,
                y: orderReady ? 0 : 20,
              }}
              transition={{ duration: 0.5 }}
            >
              <Button
                disabled={!orderReady}
                onClick={async () => {
                  // Update dispensers before clearing user data
                  try {
                    const machineId = localStorage.getItem("machineId");
                    if (machineId) {
                      await machineService.getMachineInventory(machineId);
                      console.log("[Success] Machine inventory refreshed on button click");
                    }
                  } catch (error) {
                    console.error("[Success] Failed to refresh machine inventory:", error);
                  }
                  // Clear user login details
                  sessionStorage.removeItem("userId");
                  sessionStorage.removeItem("userName");
                  router.push("/product/screensaver");
                }}
                className={`w-full py-4 ${
                  orderReady
                    ? "bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738]"
                    : "bg-[#DAB49D]/50"
                } text-white rounded-xl font-semibold text-base relative overflow-hidden`}
              >
                <motion.div
                  className={`absolute inset-0 ${
                    orderReady ? "bg-[#C28654]/30" : "bg-transparent"
                  }`}
                  animate={{ x: orderReady ? ["100%", "-100%"] : "0%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <div className="relative flex items-center justify-center">
                  <span className="mr-2">See you next time!</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: !orderReady ? 0.7 : 0,
                y: !orderReady ? 0 : -10,
              }}
              className="mt-2 text-center text-xs text-[#8A5738]/60"
            >
              Preparing your perfect brew...
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating coffee elements */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {orderReady
          ? // Steam effect when coffee is ready
            [...Array(8)].map((_, i) => {
              const seed = i * 19 + 47;
              const leftPercent = roundValue(10 + seededRandom(seed) * 80, 4);
              return (
                <motion.div
                  key={`steam-${i}`}
                  className="absolute bottom-0 w-2 h-10 bg-white/10 blur-md rounded-full"
                  style={{
                    left: formatPercent(leftPercent),
                  }}
                  animate={{
                    y: [0, -100 - roundValue(seededRandom(seed + 1) * 100, 2)],
                    opacity: [0, 0.3, 0],
                    scale: [0.5, roundValue(1 + seededRandom(seed + 2) * 1, 4)],
                  }}
                  transition={{
                    duration: roundValue(2 + seededRandom(seed + 3) * 3, 2),
                    repeat: Infinity,
                    delay: roundValue(seededRandom(seed + 4) * 2, 2),
                  }}
                />
              );
            })
          : // Coffee bean particles while brewing
            [...Array(10)].map((_, i) => {
              const seed = i * 13 + 53;
              const left = roundValue(seededRandom(seed) * 100, 4);
              const top = roundValue(seededRandom(seed + 1) * 100, 4);
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-3 h-5 bg-[#5F3023]/30 rounded-full"
                  style={{
                    left: formatPercent(left),
                    top: formatPercent(top),
                    transform: "rotate(30deg)",
                  }}
                  animate={{
                    y: [0, roundValue(seededRandom(seed + 2) * 20 - 10, 2)],
                    x: [0, roundValue(seededRandom(seed + 3) * 20 - 10, 2)],
                    rotate: [30, roundValue(30 + seededRandom(seed + 4) * 60, 2)],
                    opacity: [0.3, 0.1],
                  }}
                  transition={{
                    duration: roundValue(2 + seededRandom(seed + 5) * 3, 2),
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: roundValue(seededRandom(seed + 6) * 2, 2),
                  }}
                />
              );
            })}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D]/50 flex flex-col items-center justify-center p-4">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 mb-4"></div>
            <div className="h-6 w-48 bg-amber-500/20 rounded mb-2"></div>
            <div className="h-4 w-32 bg-amber-500/20 rounded"></div>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
