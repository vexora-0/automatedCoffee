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
    title: "Finalizing",
    description: "Adding the finishing touches",
    icon: Sparkles,
    color: "#C28654",
    animation: "sparkle",
  },
  {
    id: 5,
    title: "Ready!",
    description: "Your perfect brew awaits",
    icon: ThumbsUp,
    color: "#5F3023",
    animation: "scale",
  },
];

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const recipeName = searchParams.get("recipe") || "Coffee";
  const price = searchParams.get("price") || "0";
  const [userName, setUserName] = useState<string>("Coffee Lover");
  const [preparationStep, setPreparationStep] = useState<number>(1);
  const [orderReady, setOrderReady] = useState<boolean>(false);
  const router = useRouter();
  const { isConnected, publish } = useMqttContext();
  const recipePublishedRef = useRef(false);
  const [randomQuote, setRandomQuote] = useState<string>("");
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
  }).format(parseFloat(price));

  // Get user name from sessionStorage and set random quote
  useEffect(() => {
    const storedUserName = sessionStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // Set random quote
    const quoteIndex = Math.floor(Math.random() * SUCCESS_QUOTES.length);
    setRandomQuote(SUCCESS_QUOTES[quoteIndex]);
  }, []);

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
      setTimeout(() => setPreparationStep(4), 9000),
      setTimeout(() => {
        setPreparationStep(5);
        setShowConfetti(true);
        setOrderReady(true);

        // Set timeout to redirect to login page and clear user data
        setTimeout(() => {
          // Clear all user data from localStorage and sessionStorage
          sessionStorage.clear();
          // Redirect to login page
          router.push("/product/screensaver");
        }, 5000);
      }, 12000),
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D]/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated coffee color gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#C28654]/20 opacity-70"></div>

        {/* Coffee bean shape outlines */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`bean-${i}`}
            className="absolute border border-[#8A5738]/10 rounded-full"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 300 + 100,
              borderRadius: "40% 60% 55% 45% / 60% 40% 60% 40%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.02, 0.98, 1],
              x: [0, Math.random() * 20 - 10],
              y: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Subtle light flares */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`flare-${i}`}
            className="absolute rounded-full bg-white/10 blur-3xl"
            style={{
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.1,
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Confetti effect when order is ready */}
      {showConfetti && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(30)].map((_, i) => (
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
                ][Math.floor(Math.random() * 5)],
                top: "-5%",
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                rotate: Math.random() * 360,
              }}
              animate={{
                y: ["0vh", "100vh"],
                x: [0, Math.random() * 100 - 50],
                rotate: [0, Math.random() * 720 - 360],
              }}
              transition={{
                duration: 2.5 + Math.random() * 3,
                ease: "easeIn",
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Logo at top with frosted glass effect */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="bg-white/30 backdrop-blur-xl px-8 py-3 rounded-full border border-white/20 shadow-lg">
          <div className="relative w-32 h-10">
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
      <div className="relative z-20 w-full max-w-lg">
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
          <div className="relative px-8 pt-10 pb-8">
            {/* 3D floating success icon */}
            <div className="relative flex justify-center mb-10">
              <div className="absolute -inset-10 bg-gradient-to-r from-[#C28654]/10 via-[#F4EBDE]/5 to-[#5F3023]/10 rounded-full blur-xl opacity-70"></div>
              <motion.div
                className="relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-[#C28654] to-[#8A5738] shadow-[0_10px_30px_rgba(194,134,84,0.4)]"
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
                  className="h-12 w-12 text-white"
                  strokeWidth={2.5}
                />
              </motion.div>
            </div>

            {/* Success headings with animation */}
            <div className="text-center space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl md:text-4xl font-bold text-[#5F3023]"
              >
                Payment Confirmed!
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl text-[#8A5738] font-medium"
              >
                Thank you, {userName}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-[#8A5738]/70 italic font-light px-6 text-sm mt-2"
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
                className="w-6 h-6 rounded-full border-2 border-[#C28654]/30 flex items-center justify-center"
              >
                <div className="w-2 h-3 bg-[#C28654]/30 rounded-full"></div>
              </motion.div>
            </div>
          </div>

          {/* Order details with glass card effect */}
          <div className="px-8 pt-8 pb-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-inner"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-xs text-[#8A5738]/70 font-medium">
                    YOUR ORDER
                  </p>
                  <p className="text-lg font-semibold text-[#5F3023]">
                    {recipeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8A5738]/70 font-medium">PRICE</p>
                  <p className="text-lg font-bold text-[#C28654]">
                    {formattedPrice}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-[#8A5738]">
                <Clock size={12} />
                <span>Time elapsed: {formatTime(timeElapsed)}</span>
              </div>
            </motion.div>
          </div>

          {/* Preparation steps with modern timeline */}
          <div className="px-8 pb-8 pt-3">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-7 bottom-7 w-px bg-gradient-to-b from-[#C28654] via-[#8A5738] to-[#5F3023]/30"></div>

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
                    className={`flex items-start mb-5 ${
                      isActive ? "" : "opacity-40"
                    }`}
                  >
                    {/* Step icon */}
                    <motion.div
                      animate={
                        isCurrent
                          ? {
                              scale: [1, 1.2, 1],
                              rotate:
                                step.animation === "rotate" ? [0, 180, 360] : 0,
                              y: step.animation === "bounce" ? [0, -5, 0] : 0,
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: isCurrent ? Infinity : 0,
                        repeatType: "reverse",
                      }}
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        isActive ? `bg-[${step.color}]` : "bg-[#DAB49D]/30"
                      } ${isCurrent ? "ring-4 ring-[#C28654]/20" : ""}`}
                    >
                      {React.createElement(step.icon, {
                        className: `h-5 w-5 ${
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
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <CheckCircle className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Step content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-medium text-base ${
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
                        className={`text-sm ${
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
          <div className="px-8 pb-8">
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
                onClick={() => {
                  sessionStorage.clear();
                  router.push("/product/screensaver");
                }}
                className={`w-full py-6 ${
                  orderReady
                    ? "bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738]"
                    : "bg-[#DAB49D]/50"
                } text-white rounded-xl font-semibold text-lg relative overflow-hidden`}
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
              className="mt-4 text-center text-sm text-[#8A5738]/60"
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
            [...Array(8)].map((_, i) => (
              <motion.div
                key={`steam-${i}`}
                className="absolute bottom-0 w-2 h-10 bg-white/10 blur-md rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -100 - Math.random() * 100],
                  opacity: [0, 0.3, 0],
                  scale: [0.5, 1 + Math.random() * 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))
          : // Coffee bean particles while brewing
            [...Array(10)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-3 h-5 bg-[#5F3023]/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: "rotate(30deg)",
                }}
                animate={{
                  y: [0, Math.random() * 20 - 10],
                  x: [0, Math.random() * 20 - 10],
                  rotate: [30, 30 + Math.random() * 60],
                  opacity: [0.3, 0.1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: Math.random() * 2,
                }}
              />
            ))}
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
