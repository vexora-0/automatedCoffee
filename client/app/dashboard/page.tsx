"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  PieChart, Package, Coffee, CupSoda, 
  ArrowUpRight, ChevronRight, Sparkles, 
   Users
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
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
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
      
      document.querySelector('.dashboard-container')?.appendChild(particle);
      
      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 15000);
    };
    
    const particleInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        createParticle();
      }
    }, 800);
    
    return () => clearInterval(particleInterval);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="dashboard-container relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Background elements */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-blue-600/20 rounded-full filter blur-[120px] opacity-50" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-600/20 rounded-full filter blur-[120px] opacity-50" />
      <div className="absolute top-[50%] right-[30%] w-64 h-64 bg-purple-600/20 rounded-full filter blur-[100px] opacity-40" />
      
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
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-indigo-300">
              Dashboard
            </h1>
          </div>
          <p className="text-gray-400 max-w-lg">
            Welcome to your  business command center. Manage operations with our powerful tools.
          </p>
          
          {/* Decorative element */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mt-6"
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
            <div className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 group-hover:opacity-80 transition-all duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              
              <div className="relative z-10 p-8 grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
                  <p className="text-gray-300 max-w-md">
                    Get comprehensive insights into your coffee business performance with real-time analytics and customizable reports.
                  </p>
                  
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center mt-2 text-indigo-300 hover:text-indigo-200"
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
                          ease: "linear" 
                        }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30"
                      />
                      <div className="absolute inset-4 rounded-full border-2 border-indigo-400/40 flex items-center justify-center">
                        <PieChart className="h-16 w-16 text-indigo-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.7 }}
                transition={{ duration: 0.5 }}
                className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/30 rounded-full filter blur-[80px]" 
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
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-500 cursor-pointer bg-gradient-to-br from-indigo-950/50 to-slate-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-600/30 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Package className="h-7 w-7" />
                    </div>
                    <motion.div 
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-white/70" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">Recipe Management</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Create, edit, and manage coffee recipes with our intuitive interface and real-time preview.
                  </p>
                  
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
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
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-500 cursor-pointer bg-gradient-to-br from-blue-950/50 to-slate-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-600/20 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                      <CupSoda className="h-7 w-7" />
                    </div>
                    <motion.div 
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-white/70" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">Ingredient Management</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Create, edit, and manage ingredients for your recipes with detailed nutrition information.
                  </p>
                  
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
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
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-500 cursor-pointer bg-gradient-to-br from-amber-950/50 to-slate-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-600/20 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                      <Coffee className="h-7 w-7" />
                    </div>
                    <motion.div 
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-white/70" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-200 transition-colors">Machine Inventory</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Track and manage your coffee machine inventory with real-time monitoring and alerts.
                  </p>
                  
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
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
              <div className="group relative h-full p-6 overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-500 cursor-pointer bg-gradient-to-br from-green-950/50 to-slate-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-green-600/20 rounded-full filter blur-[50px] group-hover:blur-[40px] transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                      <Users className="h-7 w-7" />
                    </div>
                    <motion.div 
                      whileHover={{ x: 5, y: -5 }}
                      className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"
                    >
                      <ArrowUpRight className="h-5 w-5 text-white/70" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">Staff</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Manage your team and assignments.
                  </p>
                  
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
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
          background-color: rgba(255, 255, 255, 0.5);
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
