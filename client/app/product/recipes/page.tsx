"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRecipeCategories } from "@/lib/api/hooks";
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

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F4EBDE] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#5F3023]">
              COFFEE <span className="text-[#8A5738]">MENU</span>
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EBDE] flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#F4EBDE]/90 opacity-80"></div>
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#DAB49D]/20"
              style={{
                width: Math.random() * 4 + 2 + "px",
                height: Math.random() * 4 + 2 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
            ></div>
          ))}
        </div>
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#F4EBDE] to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#F4EBDE] to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 px-6 lg:px-10">
        <div className="w-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <div className="w-32 h-12 relative">
              <Image
                src="/brownlogo.svg"
                alt="Froth Filter Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 lg:px-10 pb-16 pt-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {isLoadingCategories ? (
            // Loading skeleton for categories
            <div className="space-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-6">
                  <div className="h-8 bg-[#DAB49D]/40 rounded w-48 animate-pulse"></div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="bg-white/50 aspect-square rounded-xl animate-pulse border border-[#C28654]/30"
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
