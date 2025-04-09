"use client";

import { motion } from "framer-motion";
import { RecipeCategory } from "@/lib/api/types";
import {
  CoffeeIcon,
  ChevronRight,
  Droplets,
  Sparkles,
  Leaf,
  Gift,
} from "lucide-react";

interface CategoryCardProps {
  category: RecipeCategory;
  onClick: () => void;
}

// Category icons mapping
const categoryIcons: Record<string, any> = {
  "Hot Coffee": CoffeeIcon,
  "Iced Coffee": Droplets,
  Specialty: Sparkles,
  Seasonal: Leaf,
  Extras: Gift,
};

// Category background gradients
const categoryGradients: Record<string, string> = {
  "Hot Coffee": "from-amber-800/30 via-amber-700/20 to-[#141414]",
  "Iced Coffee": "from-blue-900/30 via-amber-800/20 to-[#141414]",
  Specialty: "from-purple-900/30 via-amber-800/20 to-[#141414]",
  Seasonal: "from-green-900/30 via-amber-800/20 to-[#141414]",
  Extras: "from-pink-900/30 via-amber-800/20 to-[#141414]",
};

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  // Get the appropriate icon component for this category
  const IconComponent = categoryIcons[category.name] || CoffeeIcon;
  const gradientClass =
    categoryGradients[category.name] ||
    "from-amber-900/30 via-amber-800/20 to-[#141414]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={onClick}
      className={`rounded-xl overflow-hidden border border-[#292929] bg-[#141414] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] cursor-pointer group relative`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${gradientClass} opacity-80`}
      ></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-500/10"
            initial={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              opacity: 0.1 + Math.random() * 0.3,
              scale: 0.1 + Math.random() * 0.4,
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              opacity: [0.1 + Math.random() * 0.3, 0.3 + Math.random() * 0.2],
              scale: [0.1 + Math.random() * 0.4, 0.2 + Math.random() * 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: 20 + Math.random() * 40 + "px",
              height: 20 + Math.random() * 40 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      {/* Overlay for hover effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60"></div>

      <div className="relative p-6 z-10 h-full flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-700/10 flex items-center justify-center mb-4"
            >
              <IconComponent className="h-7 w-7 text-amber-500" />
            </motion.div>

            <motion.div
              whileHover={{ x: 5 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="h-5 w-5 text-amber-500" />
            </motion.div>
          </div>

          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300 mt-2"
          >
            {category.name}
          </motion.h3>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mt-4"
        >
          Explore our premium {category.name.toLowerCase()} selection
        </motion.p>
      </div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
      />
    </motion.div>
  );
}
