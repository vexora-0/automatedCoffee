"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRecipeCategories } from "@/lib/api/hooks";
import { RecipeCategory } from "@/lib/api/types";
import { CategoryCard } from "./components/CategoryCard";
import { ChevronLeft, UserCircle, Coffee, LogOut } from "lucide-react";

export default function RecipeCategoriesPage() {
  const router = useRouter();
  const { categories, isLoading } = useRecipeCategories();
  const [userName, setUserName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Get user information from localStorage
    const storedUserName = localStorage.getItem("userName");
    const storedUserId = localStorage.getItem("userId");
    const storedMachineId = localStorage.getItem("machineId");

    // If no user or machine ID is stored, redirect to the appropriate page
    if (!storedUserId || !storedMachineId) {
      router.push(
        storedMachineId ? "/product/pages/login" : "/product/pages/auth"
      );
      return;
    }

    setUserName(storedUserName);
  }, [router]);

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/product/pages/recipes/${categoryId}`);
  };

  const handleBackToLogin = () => {
    // Go back to login page
    router.push("/product/pages/login");
  };

  // Mock categories if needed for development and API is not ready
  const mockCategories: RecipeCategory[] = [
    { category_id: "cat1", name: "Hot Coffee" },
    { category_id: "cat2", name: "Iced Coffee" },
    { category_id: "cat3", name: "Specialty" },
    { category_id: "cat4", name: "Seasonal" },
    { category_id: "cat5", name: "Extras" },
  ];

  // Use either API data or mock data
  const displayCategories = categories.length > 0 ? categories : mockCategories;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  // Early SSR return to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">
              COFFEE <span className="text-amber-500">MENU</span>
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden">
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

      {/* Header */}
      <header className="relative z-10 pt-8 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -3 }}
            onClick={handleBackToLogin}
            className="flex items-center text-gray-400 hover:text-amber-500 transition-colors bg-transparent border-0"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 text-sm">Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <Coffee size={24} className="text-amber-500 mr-2" />
            <span className="text-lg font-bold text-white tracking-tight">
              FROTH<span className="text-amber-500">FILTER</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-[#141414]/80 rounded-full py-2 px-3 border border-[#292929]"
          >
            <span className="text-sm font-medium text-amber-400">
              {userName ? userName : "Guest"}
            </span>
            <UserCircle className="h-5 w-5 text-amber-400" />
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <motion.main
        className="relative z-10 flex-1 px-6 lg:px-10 pb-16 pt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className="p-4 bg-gradient-to-br from-amber-600/20 to-amber-800/5 rounded-full">
                <Coffee className="h-10 w-10 text-amber-500" />
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              COFFEE <span className="text-amber-500">MENU</span>
            </motion.h1>

            <motion.p
              className="text-gray-400 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Select a beverage category to explore our premium coffee offerings
            </motion.p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[#141414]/50 h-64 rounded-xl animate-pulse border border-[#222]"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCategories.map((category) => (
                <CategoryCard
                  key={category.category_id}
                  category={category}
                  onClick={() => handleCategorySelect(category.category_id)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.main>

      {/* Animated accent at bottom */}
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

      {/* Logout button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        className="absolute bottom-8 right-8 z-10 text-gray-500 hover:text-amber-500 transition-colors"
        onClick={() => {
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          router.push("/product/pages/login");
        }}
      >
        <LogOut size={20} />
      </motion.button>
    </div>
  );
}
