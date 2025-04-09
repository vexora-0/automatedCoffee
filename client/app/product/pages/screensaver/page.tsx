"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ScreensaverPage() {
  const router = useRouter();

  useEffect(() => {
    // Get machine ID from localStorage
    const storedMachineId = localStorage.getItem("machineId");

    if (!storedMachineId) {
      router.push("/product/pages/auth");
      return;
    }
  }, [router]);

  const handleTap = () => {
    router.push("/product/pages/login");
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden relative cursor-pointer"
      onClick={handleTap}
    >
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

      {/* Centered logo with pulsing animation */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <Image
            src="/blacklogo.svg"
            alt="Froth Filter Logo"
            fill
            className="object-contain"
            style={{ filter: "invert(1)" }} // Invert black to white
          />
        </div>

        <motion.p
          className="mt-10 text-xl font-medium text-white/80 tracking-wider"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          TAP TO CONTINUE
        </motion.p>
      </motion.div>

      {/* Gold line accent at bottom */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
        animate={{
          width: ["4rem", "8rem", "4rem"],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    </div>
  );
}
