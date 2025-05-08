"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import { Coffee, CupSoda, Sparkles, Wind } from "lucide-react";

export default function ScreensaverPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(new Date());
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const logoControls = useAnimation();
  const [isHovering, setIsHovering] = useState(false);

  // Coffee quotes for rotating display
  const coffeeQuotes = [
    "Life begins after coffee",
    "Coffee: a hug in a mug",
    "But first, coffee",
    "May your coffee be strong and your Monday be short",
    "Today's good mood is sponsored by coffee",
    "Coffee: because adulting is hard",
    "Coffee & confidence",
    "Follow your heart, but take coffee with you",
  ];

  const [currentQuote, setCurrentQuote] = useState(coffeeQuotes[0]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cycle through coffee quotes
    const quoteTimer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * coffeeQuotes.length);
      setCurrentQuote(coffeeQuotes[randomIndex]);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  useEffect(() => {
    // Get machine ID from localStorage
    const storedMachineId = localStorage.getItem("machineId");

    if (!storedMachineId) {
      // If no machine ID, redirect to machine auth
      router.push("/product/auth/machine");
      return;
    }

    // Animate logo on load
    logoControls.start({
      scale: [0.9, 1.1, 1],
      rotate: [0, 5, -5, 0],
      opacity: [0, 1],
      transition: { duration: 2, ease: "easeOut" },
    });

    // Add mousemove event listener for the whole document
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const { width, height, left, top } =
        containerRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      mouseX.set(x - width / 2);
      mouseY.set(y - height / 2);

      setCoordinates({
        x: (e.clientX - left) / width,
        y: (e.clientY - top) / height,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [router, logoControls, mouseX, mouseY]);

  const handleTap = () => {
    // Redirect to user authentication
    router.push("/product/auth");
  };

  // Format time as HH:MM AM/PM
  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Format date as Weekday, Month Day
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[#432818] via-[#5F3023] to-[#2C1006] flex flex-col items-center justify-center overflow-hidden relative cursor-pointer"
      onClick={handleTap}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated coffee steam particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Coffee steam effect */}
        <div className="absolute top-[30%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`steam-${i}`}
              className="absolute rounded-full bg-white/50 backdrop-blur-sm"
              style={{
                width: Math.random() * 15 + 5,
                height: Math.random() * 15 + 5,
                x: Math.random() * 100 - 50,
                borderRadius: "50%",
              }}
              animate={{
                y: [-20, -180],
                x: [0, Math.random() * 100 - 50],
                opacity: [0, 0.6, 0],
                scale: [0.5, Math.random() * 2 + 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Coffee bean floating elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`bean-${i}`}
            className="absolute bg-[#C28654]/30 rounded-full"
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 20 + 5,
              borderRadius: "40% 60% 60% 40% / 60% 30% 70% 40%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              rotate: Math.random() * 360,
            }}
            animate={{
              rotate: [0, 360],
              y: [0, Math.random() * 20 - 10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Light rays from behind the cup */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-1/2 bottom-[35%] w-[500px] h-[500px] -translate-x-1/2 rounded-[40%] bg-gradient-to-tr from-[#F4EBDE]/5 via-[#C28654]/10 to-transparent"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Background gradient overlay */}
        <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-[#2C1006] to-transparent opacity-80"></div>
        <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-[#2C1006] to-transparent opacity-80"></div>
      </div>

      {/* Time and date display */}
      <motion.div
        className="absolute top-10 text-center text-[#F4EBDE]/90"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <h2 className="text-5xl font-light tracking-widest">{formattedTime}</h2>
        <p className="text-lg font-light mt-2 tracking-wide text-[#F4EBDE]/70">
          {formattedDate}
        </p>
      </motion.div>

      {/* 3D floating logo with interactive movement */}
      <motion.div
        className="relative z-20 mb-16 mt-8"
        style={{
          perspective: 1000,
          rotateX,
          rotateY,
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Glowing effect behind logo */}
        <motion.div
          className="absolute -inset-20 z-0 opacity-20 blur-3xl rounded-full"
          style={{
            background: `radial-gradient(circle, #F4EBDE 5%, #C28654 30%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Steam effect */}
        <motion.div
          className="absolute -top-20 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [-5, -15, -5],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Wind className="text-[#F4EBDE]/40 h-16 w-16" />
        </motion.div>

        {/* Logo with hover effect */}
        <motion.div
          className="flex flex-col items-center justify-center"
          animate={logoControls}
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src="/brownlogo.svg"
            alt="Froth Filter Logo"
            width={320}
            height={320}
            className="object-contain"
            style={{
              filter:
                "brightness(0) invert(1) sepia(0.3) saturate(1.2) hue-rotate(350deg) brightness(1.1)",
            }}
          />

          {/* Interactive light effect on hover/move */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-0"
            animate={{ opacity: isHovering ? 0.2 : 0 }}
            style={{
              background: `radial-gradient(circle at ${coordinates.x * 100}% ${
                coordinates.y * 100
              }%, rgba(255, 255, 255, 0.8), transparent 70%)`,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Coffee quote display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote}
          className="relative z-10 text-center max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xl text-[#F4EBDE]/80 italic font-light tracking-wide">
            &ldquo;{currentQuote}&rdquo;
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Tap instruction with coffee icon */}
      <motion.div
        className="absolute bottom-12 z-10 flex flex-col items-center"
        animate={{
          y: [0, -8, 0],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="flex items-center space-x-3 bg-[#F4EBDE]/10 backdrop-blur-md rounded-full px-6 py-3 border border-[#F4EBDE]/20">
          <Coffee className="text-[#F4EBDE]/80 h-5 w-5" />
          <p className="text-[#F4EBDE]/90 font-medium">TAP TO START</p>
          <Sparkles className="text-[#F4EBDE]/80 h-5 w-5" />
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F4EBDE]/30 to-transparent" />

      {/* Coffee bean icon in corner */}
      <motion.div
        className="absolute bottom-6 right-6"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <CupSoda className="text-[#F4EBDE]/40 h-8 w-8" />
      </motion.div>
    </div>
  );
}
