"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PieChart,
  Package,
  Coffee,
  CupSoda,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardCardProps {
  href: string;
  icon: React.ElementType;
  iconColor: "blue" | "green" | "amber" | "indigo" | "purple" | "pink" | string;
  title: string;
  description: string;
  featured?: boolean;
}

const MotionLink = motion(Link);

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Add particles effect
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      // Random position
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;

      // Random size
      const size = Math.random() * 5 + 1;

      // Apply styles
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.opacity = (Math.random() * 0.5 + 0.2).toString();

      document.querySelector(".dashboard-container")?.appendChild(particle);

      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 15000);
    };

    const particleInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        createParticle();
      }
    }, 800);

    return () => clearInterval(particleInterval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="dashboard-container relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] text-[#5F3023]">
      {/* Background elements */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-[#C28654]/10 rounded-full filter blur-[120px] opacity-50" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#8A5738]/10 rounded-full filter blur-[120px] opacity-50" />
      <div className="absolute top-[50%] right-[30%] w-64 h-64 bg-[#5F3023]/10 rounded-full filter blur-[100px] opacity-40" />

      {/* Coffee bean pattern */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#C28654]/20"
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1, 0.8],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
            style={{
              width: Math.random() * 60 + 20 + "px",
              height: Math.random() * 35 + 10 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
          ></motion.div>
        ))}
      </div>

      {/* Content container */}
      <div className="relative z-10 container px-6 py-12 mx-auto">
        {/* Header section with animated elements */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 relative"
        >
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5F3023] via-[#8A5738] to-[#C28654]">
              Dashboard
            </h1>
          </div>
          <p className="text-[#8A5738] max-w-lg">
            Welcome to your coffee business command center. Manage operations
            with our powerful tools.
          </p>

          {/* Decorative element */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-[#C28654]/50 to-transparent mt-6"
          />
        </motion.div>

        {/* Featured card - larger prominent card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <Link href="/dashboard/analytics">
            <div className="relative overflow-hidden rounded-2xl border border-[#C28654]/20 backdrop-blur-md group cursor-pointer bg-white/80">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C28654]/10 to-[#8A5738]/10 group-hover:opacity-90 transition-all duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C28654] via-[#8A5738] to-[#5F3023]" />

              <div className="relative z-10 p-8 grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#C28654]/20 border border-[#C28654]/30 text-[#5F3023] text-xs font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </div>

                  <h2 className="text-3xl font-bold text-[#5F3023]">
                    Analytics Dashboard
                  </h2>
                  <p className="text-[#8A5738] max-w-md">
                    Get comprehensive insights into your coffee business
                    performance with real-time analytics and customizable
                    reports.
                  </p>

                  <motion.button
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center mt-2 text-[#C28654] hover:text-[#8A5738] transition-colors"
                  >
                    Explore analytics <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.button>
                </div>
                <div className="md:col-span-2 flex items-center justify-center">
                  <div className="w-full h-full max-h-52 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 30,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-[#C28654]/30"
                      />
                      <div className="absolute inset-4 rounded-full border-2 border-[#8A5738]/40 flex items-center justify-center bg-[#F4EBDE]/50">
                        <PieChart className="h-16 w-16 text-[#5F3023]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.7 }}
                transition={{ duration: 0.5 }}
                className="absolute -top-20 -right-20 w-40 h-40 bg-[#C28654]/20 rounded-full filter blur-[80px]"
              />
            </div>
          </Link>
        </motion.div>

        {/* Main Card Grid with masonry-style layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Recipe Management - spans 3 columns */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard/recipes">
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-[#C28654]/20 backdrop-blur-md transition-all duration-500 cursor-pointer bg-white/80">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#C28654]/20 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-[#C28654]/20 text-[#5F3023]">
                      <Package className="h-7 w-7" />
                    </div>
                    <motion.div
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-[#F4EBDE]/50 group-hover:bg-[#F4EBDE]/80 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-[#8A5738]" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#5F3023] mb-3 group-hover:text-[#8A5738] transition-colors">
                    Recipe Management
                  </h3>
                  <p className="text-[#8A5738] group-hover:text-[#5F3023] transition-colors">
                    Create, edit, and manage coffee recipes with our intuitive
                    interface and real-time preview.
                  </p>

                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#C28654]/50 to-transparent"
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Ingredient Management - spans 3 columns */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard/ingredients">
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-[#8A5738]/20 backdrop-blur-md transition-all duration-500 cursor-pointer bg-white/80">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#8A5738]/15 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-[#8A5738]/20 text-[#5F3023]">
                      <CupSoda className="h-7 w-7" />
                    </div>
                    <motion.div
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-[#F4EBDE]/50 group-hover:bg-[#F4EBDE]/80 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-[#8A5738]" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#5F3023] mb-3 group-hover:text-[#8A5738] transition-colors">
                    Ingredient Management
                  </h3>
                  <p className="text-[#8A5738] group-hover:text-[#5F3023] transition-colors">
                    Create, edit, and manage ingredients for your recipes with
                    detailed nutrition information.
                  </p>

                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#8A5738]/50 to-transparent"
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Coffee Machine Inventory - spans 4 columns */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard/machine-inventory">
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-[#C28654]/20 backdrop-blur-md transition-all duration-500 cursor-pointer bg-white/80">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#C28654]/15 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-[#C28654]/20 text-[#5F3023]">
                      <Coffee className="h-7 w-7" />
                    </div>
                    <motion.div
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-[#F4EBDE]/50 group-hover:bg-[#F4EBDE]/80 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-[#8A5738]" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#5F3023] mb-3 group-hover:text-[#8A5738] transition-colors">
                    Machine Inventory
                  </h3>
                  <p className="text-[#8A5738] group-hover:text-[#5F3023] transition-colors">
                    Track and manage your coffee machine inventory with
                    real-time monitoring and alerts.
                  </p>

                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#C28654]/50 to-transparent"
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Staff Management - spans 2 columns */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard/staff">
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-[#8A5738]/20 backdrop-blur-md transition-all duration-500 cursor-pointer bg-white/80">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#8A5738]/15 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-[#8A5738]/20 text-[#5F3023]">
                      <Users className="h-7 w-7" />
                    </div>
                    <motion.div
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-[#F4EBDE]/50 group-hover:bg-[#F4EBDE]/80 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-[#8A5738]" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#5F3023] mb-3 group-hover:text-[#8A5738] transition-colors">
                    Staff Management
                  </h3>
                  <p className="text-[#8A5738] group-hover:text-[#5F3023] transition-colors">
                    Manage your team and machine assignments with ease.
                  </p>

                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#8A5738]/50 to-transparent"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* CSS for particles animation */}
      <style jsx global>{`
        .dashboard-container {
          position: relative;
        }

        .particle {
          position: absolute;
          background-color: rgba(194, 134, 84, 0.3);
          border-radius: 50%;
          pointer-events: none;
          animation: float 15s linear infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity);
          }
          90% {
            opacity: var(--opacity);
          }
          100% {
            transform: translateY(-100vh) translateX(var(--translateX)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
