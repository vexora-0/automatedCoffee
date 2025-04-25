"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRecipeCategories } from "@/lib/api/hooks";
import { RecipeCategory, Recipe } from "@/lib/api/types";
import { ChevronLeft, UserCircle, Coffee, LogOut } from "lucide-react";
import { RecipeCard } from "./[categoryId]/components/RecipeCard";
import useRecipeStore from "@/app/product/stores/useRecipeStore";
import useRecipeAvailabilityStore from "@/app/product/stores/useRecipeAvailabilityStore";
import { useRecipes } from "@/app/product/stores/useRecipeStore";
import useWebSocketStore from "@/app/product/stores/useWebSocketStore";

export default function RecipesPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [machineId, setMachineId] = useState<string | null>(null);

  // Get categories from API
  const { categories, isLoading: isLoadingCategories } = useRecipeCategories();
  
  // Get recipes from store with WebSocket integration
  const { recipes, isLoading: isLoadingRecipes } = useRecipes();
  const getRecipesByCategory = useRecipeStore(state => state.getRecipesByCategory);
  
  // Get availability information
  const recipeAvailabilityStore = useRecipeAvailabilityStore();
  const isRecipeAvailable = recipeAvailabilityStore.isRecipeAvailable;
  
  // Initialize WebSocket connection and handlers
  const webSocketStore = useWebSocketStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize WebSocket connection
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
    setMachineId(storedMachineId);
    
    // Initialize WebSocket connection
    webSocketStore.initSocket();
  }, [router]);

  // Join machine room and request data when machineId is available
  useEffect(() => {
    if (machineId) {
      console.log(`[Recipes] Connecting to machine: ${machineId}`);
      // Join machine room for real-time updates
      webSocketStore.joinMachineRoom(machineId);
      
      // Make explicit request for data
      webSocketStore.requestData(machineId);
      
      // Cleanup on unmount
      return () => {
        console.log(`[Recipes] Disconnecting from machine: ${machineId}`);
        webSocketStore.leaveMachineRoom(machineId);
      };
    }
  }, [machineId]);

  // Compute recipe availability when we receive data updates
  useEffect(() => {
    if (machineId && recipes.length > 0) {
      // Directly call recipeAvailabilityStore's computeAvailability
      // This is safe now because we've added debouncing to prevent infinite loops
      console.log(`[Recipes] Computing availability for ${recipes.length} recipes`);
      recipeAvailabilityStore.computeAvailability(machineId);
    }
  }, [machineId, recipes]);

  const handleBackToLogin = () => {
    router.push("/product/pages/login");
  };

  const handleRecipeSelect = (recipeId: string) => {
    router.push(`/product/pages/recipe-details/${recipeId}`);
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
          <motion.h1
            className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tight text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            COFFEE <span className="text-amber-500">MENU</span>
          </motion.h1>

          <div className="space-y-16">
            {isLoadingCategories ? (
              // Loading skeleton for categories
              <div className="space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-6">
                    <div className="h-8 bg-gray-800 rounded w-48 animate-pulse"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div 
                          key={j} 
                          className="bg-[#141414]/50 aspect-square rounded-xl animate-pulse border border-[#222]"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Display categories and their recipes
              <>
                {categories.map((category) => {
                  const categoryRecipes = getRecipesByCategory(category.category_id);
                  if (!categoryRecipes.length) return null;
                  
                  return (
                    <motion.div 
                      key={category.category_id}
                      variants={itemVariants}
                      className="scroll-mt-8"
                      id={`category-${category.category_id}`}
                    >
                      <motion.h2 
                        className="text-2xl font-bold text-white mb-6"
                      >
                        {category.name}
                      </motion.h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryRecipes.map((recipe: Recipe) => (
                          <RecipeCard
                            key={recipe.recipe_id}
                            recipe={recipe}
                            isAvailable={isRecipeAvailable(recipe.recipe_id)}
                            onClick={() => handleRecipeSelect(recipe.recipe_id)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </motion.main>

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
