"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRecipeCategories } from "@/lib/api/hooks";
import { ChevronLeft, UserCircle, Coffee, LogOut } from "lucide-react";
import useRecipeStore from "@/app/product/stores/useRecipeStore";
import useRecipeAvailabilityStore from "@/app/product/stores/useRecipeAvailabilityStore";
import { useRecipes } from "@/app/product/stores/useRecipeStore";
import useWebSocketStore from "@/app/product/stores/useWebSocketStore";
import useMachineInventoryStore from "@/app/product/stores/useMachineInventoryStore";
import useRecipeIngredientStore from "@/app/product/stores/useRecipeIngredientStore";
import useIngredientStore from "@/app/product/stores/useIngredientStore";
import { ingredientService, recipeIngredientService } from "@/lib/api/services";
import AllRecipesList from "./components/AllRecipesList";

export default function RecipesPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [machineId, setMachineId] = useState<string | null>(null);

  // Get categories from API
  const { categories, isLoading: isLoadingCategories } = useRecipeCategories();

  // Get recipes from store with WebSocket integration
  const { recipes } = useRecipes();
  const getRecipesByCategory = useRecipeStore(
    (state) => state.getRecipesByCategory
  );

  // Get availability information
  const recipeAvailabilityStore = useRecipeAvailabilityStore();
  const isRecipeAvailable = recipeAvailabilityStore.isRecipeAvailable;

  // Get recipe ingredients from recipeIngredientStore
  const recipeIngredientStore = useRecipeIngredientStore();
  const recipeIngredients = Object.values(recipeIngredientStore.recipeIngredientMap);

  // Get all ingredients from ingredientStore
  const ingredientStore = useIngredientStore();
  const ingredients = ingredientStore.getAllIngredients();

  // Initialize WebSocket connection and handlers
  const webSocketStore = useWebSocketStore();

  // Track if inventory is loaded
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const machineInventoryStore = useMachineInventoryStore();

  // Load ingredient data from API when needed
  useEffect(() => {
    const loadIngredients = async () => {
      if (ingredients.length === 0) {
        try {
          console.log('[Recipes] Fetching ingredients from API...');
          const response = await ingredientService.getAllIngredients();
          
          if (response.success && response.data) {
            console.log(`[Recipes] Loaded ${response.data.length} ingredients from API`);
            ingredientStore.setIngredients(response.data);
          } else {
            console.warn('[Recipes] No ingredients returned from API');
          }
        } catch (error) {
          console.error('[Recipes] Failed to fetch ingredients:', error);
        }
      }
    };
    
    loadIngredients();
  }, [ingredients.length, ingredientStore]);

  // Load recipe ingredients data from API
  useEffect(() => {
    const loadRecipeIngredients = async () => {
      if (Object.keys(recipeIngredientStore.recipeIngredientMap).length === 0 && recipes.length > 0) {
        try {
          console.log('[Recipes] Fetching recipe ingredients from API...');
          const response = await recipeIngredientService.getAllRecipeIngredients();
          
          if (response.success && response.data) {
            console.log(`[Recipes] Loaded ${response.data.length} recipe ingredients from API`);
            recipeIngredientStore.setRecipeIngredients(response.data);
          } else {
            console.warn('[Recipes] No recipe ingredients returned from API');
          }
        } catch (error) {
          console.error('[Recipes] Failed to fetch recipe ingredients:', error);
        }
      }
    };
    
    loadRecipeIngredients();
  }, [recipes.length, recipeIngredientStore]);

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
        storedMachineId ? "/product/login" : "/product/auth"
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

  // Track when inventory is loaded
  useEffect(() => {
    const inventory = machineInventoryStore.getInventoryForMachine(
      machineId || ""
    );
    if (inventory && inventory.length > 0) {
      console.log(`[Recipes] Inventory loaded with ${inventory.length} items`);
      setInventoryLoaded(true);
    }
  }, [machineId, machineInventoryStore]);

  // Compute recipe availability when we receive data updates
  useEffect(() => {
    if (machineId && recipes.length > 0 && inventoryLoaded) {
      // Only compute availability when both recipes AND inventory are loaded
      console.log(
        `[Recipes] Computing availability for ${recipes.length} recipes with inventory loaded`
      );
      recipeAvailabilityStore.computeAvailability(machineId);
    }
  }, [machineId, recipes.length, inventoryLoaded]);

  const handleBackToLogin = () => {
    router.push("/product/login");
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    
    // Redirect to login
    router.push("/product/login");
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
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#141414]/80 rounded-full py-2 px-3 border border-[#292929] cursor-pointer hover:bg-[#1A1A1A]/80 transition-colors"
          >
            <span className="text-sm font-medium text-amber-400">
              {userName ? userName : "Guest"}
            </span>
            <LogOut className="h-4 w-4 text-amber-400" />
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 lg:px-10 pb-16 pt-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tight text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            COFFEE <span className="text-amber-500">MENU</span>
          </motion.h1>

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
            // Display all recipes organized by category
            <AllRecipesList
              categories={categories}
              recipes={recipes}
              getRecipesByCategory={getRecipesByCategory}
              isRecipeAvailable={isRecipeAvailable}
              recipeIngredients={recipeIngredients}
              ingredients={ingredients}
            />
          )}
        </div>
      </main>
    </div>
  );
}
