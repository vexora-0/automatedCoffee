"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Coffee, ChevronRight } from "lucide-react";

export default function Home() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setIsMounted(true);

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only render animations after component has mounted on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <h1 className="text-6xl font-extrabold text-white mb-4 tracking-tight">
          FROTH <span className="text-amber-500">FILTER</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          Premium Automated Coffee Experience
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background particles */}
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

      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              background: `radial-gradient(circle, rgba(217,119,6,0.03) 0%, rgba(217,119,6,0.01) 70%, rgba(217,119,6,0) 100%)`,
              border: "1px solid rgba(217,119,6,0.05)",
            }}
            initial={{
              x: Math.random() * windowSize.width,
              y: Math.random() * windowSize.height,
              opacity: 0.1 + Math.random() * 0.2,
            }}
            animate={{
              x: [
                Math.random() * windowSize.width,
                Math.random() * windowSize.width,
              ],
              y: [
                Math.random() * windowSize.height,
                Math.random() * windowSize.height,
              ],
              opacity: [0.1 + Math.random() * 0.2, 0.2 + Math.random() * 0.1],
            }}
            transition={{
              duration: Math.random() * 60 + 40,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
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

      {/* Main content */}
      <div className="z-10 relative flex flex-col md:flex-row items-center gap-12 md:gap-24 px-6">
        {/* Left side - Title */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center md:text-left"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="block"
            >
              PERFECT
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="block text-amber-500"
            >
              COFFEE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="block"
            >
              EVERY TIME
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-gray-300 max-w-md leading-relaxed"
          >
            Premium automated coffee systems designed for exceptional taste and
            unparalleled convenience.
          </motion.p>
        </motion.div>

        {/* Right side - Access Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#141414] backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-[#292929]">
            <div className="bg-gradient-to-r from-amber-600/20 to-amber-700/5 px-8 py-6 border-b border-[#292929]">
              <h3 className="text-2xl font-bold text-white">Access Portal</h3>
              <p className="text-gray-400 mt-1">Select your entry point</p>
            </div>

            <div className="px-8 py-6 space-y-4">
              <Link href="/admin/login">
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center justify-between w-full py-5 px-6 bg-[#1A1A1A] hover:bg-gradient-to-r hover:from-amber-900/20 hover:to-[#1A1A1A] text-white rounded-xl transition-all duration-300"
                >
                  <div>
                    <h4 className="font-semibold text-xl group-hover:text-amber-500 transition-colors">
                      Login
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Admin Dashboard Access
                    </p>
                  </div>
                  <ChevronRight className="text-amber-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </motion.div>
              </Link>

              <Link href="/admin/signup">
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center justify-between w-full py-5 px-6 bg-[#1A1A1A] hover:bg-gradient-to-r hover:from-amber-900/20 hover:to-[#1A1A1A] text-white rounded-xl transition-all duration-300"
                >
                  <div>
                    <h4 className="font-semibold text-xl group-hover:text-amber-500 transition-colors">
                      Sign Up
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Create Admin Account
                    </p>
                  </div>
                  <ChevronRight className="text-amber-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </motion.div>
              </Link>

              <Link href="/product/pages/auth">
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center justify-between w-full py-5 px-6 bg-gradient-to-r from-amber-900/30 to-[#1A1A1A] hover:from-amber-800/40 hover:to-[#1A1A1A] text-white rounded-xl transition-all duration-300"
                >
                  <div>
                    <h4 className="font-semibold text-xl text-amber-500">
                      Machine Access
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Connect to Coffee System
                    </p>
                  </div>
                  <ChevronRight className="text-amber-500 opacity-80 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated coffee bean */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="text-xs text-gray-500 tracking-widest text-center"
        >
          PREMIUM COFFEE EXPERIENCE
        </motion.div>
      </motion.div>
    </div>
  );
}
