"use client";

import { useEffect, useState, useRef } from "react";
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
import { ingredientService, recipeIngredientService, recipeService } from "@/lib/api/services";
import AllRecipesList from "./components/AllRecipesList";

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
  const [isInventoryEmpty, setIsInventoryEmpty] = useState(false);

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
      const currentRecipeIngredients = Object.values(recipeIngredientStore.recipeIngredientMap);
      
      // Only load if we have recipes but no recipe ingredients
      if (currentRecipeIngredients.length === 0 && recipes.length > 0) {
        try {
          console.log('[Recipes] Fetching recipe ingredients from API...');
          recipeIngredientStore.setLoading(true);
          
          // Use only the service, skip direct fetch attempt
          const response = await recipeIngredientService.getAllRecipeIngredients();
          
          if (response.success && response.data) {
            console.log(`[Recipes] Loaded ${response.data.length} recipe ingredients from API`);
            recipeIngredientStore.setRecipeIngredients(response.data);
          } else {
            console.warn('[Recipes] Failed to load recipe ingredients:', response.message || 'Unknown error');
          }
        } catch (error) {
          console.error('[Recipes] Failed to fetch recipe ingredients:', error);
        } finally {
          recipeIngredientStore.setLoading(false);
        }
      } else if (currentRecipeIngredients.length > 0) {
        console.log(`[Recipes] Using ${currentRecipeIngredients.length} cached recipe ingredients`);
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

  // Join machine room and request data when machineId is available
  useEffect(() => {
    if (machineId && webSocketStore.isConnected) {
      console.log(`[Recipes] Connecting to machine: ${machineId}`);
      // Join machine room for real-time updates
      webSocketStore.joinMachineRoom(machineId);

      // Make explicit request for data
      webSocketStore.requestData(machineId);
      
      // Set up retry mechanism for inventory loading - only retry once after a longer delay
      const retryTimer = setTimeout(() => {
        const inventory = machineInventoryStore.getInventoryForMachine(machineId);
        if (!inventory || inventory.length === 0) {
          console.log('[Recipes] Initial data load timeout - trying one final request');
          webSocketStore.requestData(machineId);
        }
      }, 5000); // Longer delay of 5 seconds

      // Cleanup on unmount
      return () => {
        console.log(`[Recipes] Disconnecting from machine: ${machineId}`);
        webSocketStore.leaveMachineRoom(machineId);
        clearTimeout(retryTimer);
      };
    }
  }, [machineId, webSocketStore.isConnected]); // Only run when machineId or connection status changes

  // Track when inventory is loaded - changed to prevent disconnecting/reconnecting
  useEffect(() => {
    // Add retry counter with maximum attempts
    const maxRetries = 3;
    let retryCount = 0;
    let retryTimer: NodeJS.Timeout;

    function checkInventory() {
      // First, get inventory from the store
      const inventory = machineInventoryStore.getInventoryForMachine(machineId || "");
      
      // Check if inventory exists in websocket store but not in inventory store
      const wsInventory = machineId ? webSocketStore.machineInventories[machineId] : null;
      
      if (machineId) {
        console.log(`[Recipes] Inventory loaded with ${inventory?.length || 0} items for machine ${machineId}`);
        
        // Check if we have a flag indicating successful inventory update
        const lastUpdate = window._lastInventoryUpdate;
        if (lastUpdate && lastUpdate.machineId === machineId && lastUpdate.count > 0 && (!inventory || inventory.length === 0)) {
          console.log(`[Recipes] DETECTION MISMATCH: Last update recorded ${lastUpdate.count} items but store shows 0 - forcing direct store access`);
          
          // Force direct global state access which may differ from hook state
          const globalStore = useMachineInventoryStore.getState();
          const globalInventory = globalStore.inventoryArrayByMachineId?.[machineId] || [];
          
          if (globalInventory.length > 0) {
            console.log(`[Recipes] RECOVERY: Found ${globalInventory.length} items in global state - using this data`);
            
            // Force a re-save of the data to ensure it persists
            machineInventoryStore.setMachineInventory(machineId, [...globalInventory]);
            
            setIsInventoryEmpty(false);
            setInventoryLoaded(true);
            return;
          }
          
          // If inventory is empty in store but exists in websocket store, sync them
          if ((!inventory || inventory.length === 0) && wsInventory && wsInventory.length > 0) {
            console.log(`[Recipes] Found inventory data in WebSocketStore (${wsInventory.length} items) but not in InventoryStore - syncing stores`);
            
            // Create a fresh copy to avoid reference issues and directly update the store
            const wsCopy = wsInventory.map(item => ({...item}));
            machineInventoryStore.setMachineInventory(machineId, wsCopy);
            
            // Mark as not empty since we found data
            setIsInventoryEmpty(false);
            setInventoryLoaded(true);
            return;
          }
        }
        
        // Reset sync flag when inventory changes
        if (inventory && inventory.length > 0) {
          window._inventorySyncedFromWebsocket = false;
          
          // Log inventory for successful cases
          console.log('[Recipes] INVENTORY PRESENT: Contents:', inventory.map(item => 
            `${item.ingredient_id}: ${item.quantity} units`).join(', '));
        }
        
        // Debug inventory contents
        if (!inventory || inventory.length === 0) {
          console.warn('[Recipes] WARNING: Machine inventory is EMPTY - this will cause all recipes to be unavailable');
          setIsInventoryEmpty(true);
          
          // If inventory is empty and we haven't exceeded max retries, try again
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`[Recipes] Empty inventory detected, requesting data again (attempt ${retryCount}/${maxRetries})`);
            
            // Clear any existing timer
            if (retryTimer) clearTimeout(retryTimer);
            
            // Increase delay with each retry to avoid hammering server
            const delay = 2000 + (retryCount * 1000);
            retryTimer = setTimeout(() => {
              webSocketStore.requestData(machineId);
            }, delay);
          } else if (retryCount === maxRetries) {
            console.warn(`[Recipes] Maximum retry attempts (${maxRetries}) reached, giving up on inventory requests`);
            
            // As a last resort, force-use WebSocket data
            if (wsInventory && wsInventory.length > 0) {
              console.log(`[Recipes] LAST RESORT: Using ${wsInventory.length} items directly from WebSocketStore`);
              setIsInventoryEmpty(false);
            }
          }
        } else {
          setIsInventoryEmpty(false);
          
          // Reset retry counter when we get data
          retryCount = 0;
        }
        
        setInventoryLoaded(true);
      }
    }

    // Run the initial check
    checkInventory();

    // Cleanup on unmount
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      // Clear sync flag on unmount
      window._inventorySyncedFromWebsocket = false;
    };
  }, [machineId, machineInventoryStore, webSocketStore]);

  // Load recipe data from API if needed
  useEffect(() => {
    async function loadRecipes() {
      // Check if we already have recipes
      if (recipes.length === 0) {
        console.log('[Recipes] No recipes loaded yet, initializing from API');
        try {
          // Replace direct fetch with recipeService
          const response = await recipeService.getAllRecipes();
          
          if (response.success && response.data) {
            console.log(`[Recipes] Loaded ${response.data.length} recipes from API`);
            useRecipeStore.getState().setRecipes(response.data);
          } else {
            console.error('[Recipes] Failed to load recipes from API:', response.message || 'Unknown error');
          }
        } catch (error) {
          console.error('[Recipes] Error loading recipes:', error);
        }
      } else {
        console.log(`[Recipes] Using ${recipes.length} cached recipes`);
      }
    }
    
    if (isMounted) {
      loadRecipes();
    }
  }, [isMounted, recipes.length]);

  // Compute recipe availability when we receive data updates
  useEffect(() => {
    if (machineId && inventoryLoaded) {
      const currentRecipes = useRecipeStore.getState().getAllRecipes();
      const currentRecipeIngredients = Object.values(recipeIngredientStore.recipeIngredientMap);
      
      console.log(
        `[Recipes] Ready to compute availability: ${currentRecipes.length} recipes, ${ingredients.length} ingredients`
      );
      
      // Only compute availability when we have recipes and ingredients
      if (currentRecipes.length > 0) {
        console.log('[Recipes] Computing availability now');
        
        // Safety check - if inventory appears empty but we have _lastInventoryUpdate data,
        // try one final recovery before computing availability
        const inventory = machineInventoryStore.getInventoryForMachine(machineId);
        const lastUpdate = window._lastInventoryUpdate;
        
        if ((!inventory || inventory.length === 0) && lastUpdate && lastUpdate.count > 0) {
          console.log('[Recipes] AVAILABILITY RECOVERY: Detected missing inventory before computing availability');
          
          // Try to get inventory from WebSocket store as a last resort
          const wsInventory = webSocketStore.machineInventories[machineId];
          if (wsInventory && wsInventory.length > 0) {
            console.log(`[Recipes] Using WebSocket inventory data (${wsInventory.length} items) for availability calculation`);
            // Update the inventory store with a fresh copy
            machineInventoryStore.setMachineInventory(machineId, [...wsInventory]);
          }
        }
        
        // Compute availability with whatever data we have
        recipeAvailabilityStore.computeAvailability(machineId);
      }
    }
  }, [machineId, inventoryLoaded, recipes, recipeIngredients.length, ingredients.length]);

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

          {/* Empty Inventory Alert */}
          {isInventoryEmpty && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-amber-900/30 border border-amber-800 rounded-lg text-center"
            >
              <h3 className="text-xl font-bold text-amber-400 mb-2">Machine Needs Restocking</h3>
              <p className="text-amber-200">
                This coffee machine is out of ingredients and needs to be restocked. 
                All recipes are currently unavailable.
              </p>
            </motion.div>
          )}

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
