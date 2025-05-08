"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRecipeCategories } from "@/lib/api/hooks";
import { ChevronLeft, Coffee, LogOut } from "lucide-react";
import useRecipeStore from "@/app/product/stores/useRecipeStore";
import useRecipeAvailabilityStore from "@/app/product/stores/useRecipeAvailabilityStore";
import { useRecipes } from "@/app/product/stores/useRecipeStore";
import useWebSocketStore from "@/app/product/stores/useWebSocketStore";
import useRecipeIngredientStore from "@/app/product/stores/useRecipeIngredientStore";
import useIngredientStore from "@/app/product/stores/useIngredientStore";
import {
  ingredientService,
  recipeIngredientService,
  recipeService,
} from "@/lib/api/services";
import AllRecipesList from "./components/AllRecipesList";
import Image from "next/image";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    _inventorySyncedFromWebsocket?: boolean;
    _lastInventoryUpdate?: {
      machineId: string;
      count: number;
      timestamp: number;
    };
  }
}

export default function RecipesPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [machineId, setMachineId] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Get categories from API
  const { categories, isLoading: isLoadingCategories } = useRecipeCategories();

  // Get recipes from store with WebSocket integration
  const { recipes } = useRecipes();
  const getRecipesByCategory = useRecipeStore(
    (state) => state.getRecipesByCategory
  );

  // Get availability information
  const recipeAvailabilityStore = useRecipeAvailabilityStore();
  const { availableRecipes, unavailableRecipes, isRecipeAvailable } =
    recipeAvailabilityStore;

  // Get recipe ingredients from recipeIngredientStore
  const recipeIngredientStore = useRecipeIngredientStore();
  const recipeIngredients = Object.values(
    recipeIngredientStore.recipeIngredientMap
  );

  // Get all ingredients from ingredientStore
  const ingredientStore = useIngredientStore();
  const ingredients = ingredientStore.getAllIngredients();

  // Initialize WebSocket connection and handlers
  const webSocketStore = useWebSocketStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch recipe availability from backend and subscribe to updates
  useEffect(() => {
    if (machineId) {
      console.log(`[Recipes] Fetching availability for machine: ${machineId}`);

      // Fetch initial recipe availability
      recipeAvailabilityStore.fetchAvailability(machineId);

      // Subscribe to real-time updates
      recipeAvailabilityStore.subscribeToAvailability(machineId);

      // Join machine room for WebSocket updates
      if (webSocketStore.isConnected) {
        webSocketStore.joinMachineRoom(machineId);
      }

      // Cleanup on unmount
      return () => {
        if (webSocketStore.isConnected) {
          webSocketStore.leaveMachineRoom(machineId);
        }
      };
    }
  }, [machineId, webSocketStore.isConnected]);

  // Load ingredient data from API when needed
  useEffect(() => {
    const loadIngredients = async () => {
      if (ingredients.length === 0) {
        try {
          console.log("[Recipes] Fetching ingredients from API...");
          const response = await ingredientService.getAllIngredients();

          if (response.success && response.data) {
            console.log(
              `[Recipes] Loaded ${response.data.length} ingredients from API`
            );
            ingredientStore.setIngredients(response.data);
          } else {
            console.warn("[Recipes] No ingredients returned from API");
          }
        } catch (error) {
          console.error("[Recipes] Failed to fetch ingredients:", error);
        }
      }
    };

    loadIngredients();
  }, [ingredients.length, ingredientStore]);

  // Load recipe ingredients data from API
  useEffect(() => {
    const loadRecipeIngredients = async () => {
      const currentRecipeIngredients = Object.values(
        recipeIngredientStore.recipeIngredientMap
      );

      // Only load if we have recipes but no recipe ingredients
      if (currentRecipeIngredients.length === 0 && recipes.length > 0) {
        try {
          console.log("[Recipes] Fetching recipe ingredients from API...");
          recipeIngredientStore.setLoading(true);

          // Use only the service, skip direct fetch attempt
          const response =
            await recipeIngredientService.getAllRecipeIngredients();

          if (response.success && response.data) {
            console.log(
              `[Recipes] Loaded ${response.data.length} recipe ingredients from API`
            );
            recipeIngredientStore.setRecipeIngredients(response.data);
          } else {
            console.warn(
              "[Recipes] Failed to load recipe ingredients:",
              response.message || "Unknown error"
            );
          }
        } catch (error) {
          console.error("[Recipes] Failed to fetch recipe ingredients:", error);
        } finally {
          recipeIngredientStore.setLoading(false);
        }
      } else if (currentRecipeIngredients.length > 0) {
        console.log(
          `[Recipes] Using ${currentRecipeIngredients.length} cached recipe ingredients`
        );
      }
    };

    if (isMounted && recipes.length > 0) {
      loadRecipeIngredients();
    }
  }, [recipes.length, recipeIngredientStore, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    // Get user information from localStorage
    const storedUserName = sessionStorage.getItem("userName");
    const storedUserId = sessionStorage.getItem("userId");
    const storedMachineId = localStorage.getItem("machineId");

    // If no user ID is stored, redirect to the auth page
    if (!storedUserId) {
      router.push("/product/auth");
      return;
    }

    // If no machine ID is stored, use a default or handle appropriately
    if (!storedMachineId) {
      console.log("[Recipes] No machine ID found, using default");
      // You can set a default machine ID or handle it differently
      // For now, we'll continue without redirecting
    }

    setUserName(storedUserName);
    setMachineId(storedMachineId || "default-machine");

    // Initialize WebSocket connection if not already connected
    if (!webSocketStore.isConnected) {
      webSocketStore.initSocket();
    }
  }, [router, webSocketStore]);

  // Load recipe data from API if needed
  useEffect(() => {
    async function loadRecipes() {
      // Check if we already have recipes
      if (recipes.length === 0) {
        console.log("[Recipes] No recipes loaded yet, initializing from API");
        try {
          // Replace direct fetch with recipeService
          const response = await recipeService.getAllRecipes();

          if (response.success && response.data) {
            console.log(
              `[Recipes] Loaded ${response.data.length} recipes from API`
            );
            useRecipeStore.getState().setRecipes(response.data);
          } else {
            console.error(
              "[Recipes] Failed to load recipes from API:",
              response.message || "Unknown error"
            );
          }
        } catch (error) {
          console.error("[Recipes] Error loading recipes:", error);
        }
      } else {
        console.log(`[Recipes] Using ${recipes.length} cached recipes`);
      }
    }

    if (isMounted) {
      loadRecipes();
    }
  }, [isMounted, recipes.length]);

  // Debug recipe availability state
  useEffect(() => {
    if (availableRecipes.length > 0 || unavailableRecipes.length > 0) {
      console.log(`[Recipes] Recipe availability updated from backend:`, {
        available: availableRecipes.length,
        unavailable: unavailableRecipes.length,
      });
    }
  }, [availableRecipes, unavailableRecipes]);

  const handleBackToLogin = () => {
    router.push("/product/auth");
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    // Redirect to login
    router.push("/product/login");
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F4EBDE] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#5F3023]">
            <span className="text-[#5F3023]">Filter it.</span>
            <span className="text-[#8A5738]">Froth it.</span>
            <span className="text-[#C28654]">Feel it.</span>
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EBDE] flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] opacity-90"></div>

        {/* Coffee bean pattern */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#C28654]/10"
              initial={{ opacity: 0.1, scale: 0.8 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [0.8, 1, 0.8],
                rotate: [0, 20, 0],
              }}
              transition={{
                duration: Math.random() * 8 + 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
              style={{
                width: Math.random() * 100 + 30 + "px",
                height: Math.random() * 60 + 20 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
            ></motion.div>
          ))}
        </div>

        {/* Swirling coffee elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-[800px] h-[800px] rounded-full border-[15px] border-[#8A5738]/10 -top-[400px] -right-[400px]"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border-[20px] border-[#C28654]/20 -bottom-[300px] -left-[300px]"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border-[12px] border-[#5F3023]/10 top-[20%] -left-[200px]"></div>
        </div>

        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#F4EBDE] to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#F4EBDE] to-transparent"></div>
      </div>

      {/* Header */}
      <motion.header
        className={`sticky top-0 z-20 pt-6 px-6 lg:px-10 backdrop-blur-md transition-all duration-300 ${
          scrollY > 20
            ? "bg-[#F4EBDE]/90 shadow-md shadow-[#C28654]/10"
            : "bg-transparent"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-full mx-auto flex items-center justify-center pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center"
          >
            {/* Use Image component for logo - Update with actual image */}
            <div className="flex justify-center items-center">
            <Image
              src="/brownlogo.svg"
              alt="Tagline"
              className="w-1/2"
              width={100}
              height={100}
              />
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 lg:px-10 pb-16 pt-4 overflow-y-auto">
        <AnimatePresence>
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-center items-center">
            <Image
              src="/tagline.svg"
              alt="Tagline"
              className="w-1/2"
              width={100}
              height={100}
              />
            </div>
            {isLoadingCategories ? (
              // Loading skeleton for categories
              <div className="space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-6">
                    <div className="h-8 bg-[#DAB49D]/50 rounded w-48 animate-pulse"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="bg-[#DAB49D]/30 aspect-square rounded-xl animate-pulse border border-[#C28654]/20"
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
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
