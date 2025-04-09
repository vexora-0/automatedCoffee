"use client";

import { useEffect } from "react";
import { useWebSocketStore } from "./stores/useWebSocketStore";
import {
  useRecipeStore,
  useIngredientStore,
  useRecipeIngredientStore,
  useMachineInventoryStore,
  useRecipeAvailabilityStore,
  useUpdateMachineInventory,
} from "./stores";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize WebSocket connection once at the layout level
  const { isConnected, initSocket, recipes, machineInventories } =
    useWebSocketStore();
  const recipeStore = useRecipeStore();
  const ingredientStore = useIngredientStore();
  const recipeIngredientStore = useRecipeIngredientStore();
  const machineInventoryStore = useMachineInventoryStore();
  const recipeAvailabilityStore = useRecipeAvailabilityStore();

  useEffect(() => {
    console.log("[Layout] ProductLayout effect running");
    console.log("[Layout] WebSocket connected:", isConnected);
    console.log("[Layout] Recipes count:", recipes?.length || 0);
    console.log(
      "[Layout] Machine inventories:",
      Object.keys(machineInventories).length
    );

    // Connect to WebSocket if not already connected
    if (!isConnected) {
      console.log("[Layout] Initializing WebSocket connection...");
      initSocket();
    }

    // Sync data from WebSocket to Zustand stores
    if (recipes && recipes.length > 0) {
      console.log("[Layout] Setting recipes from WebSocket:", recipes.length);
      recipeStore.setRecipes(recipes);
    }

    // Get machineId from localStorage if available
    const machineId = localStorage.getItem("machineId");
    console.log("[Layout] Machine ID from localStorage:", machineId);

    // Handle inventory data if it's available and we have a machine ID
    if (machineId) {
      const machineInventory = machineInventories[machineId];
      console.log(
        "[Layout] Machine inventory for current machine:",
        machineInventory?.length || 0,
        "items"
      );

      if (machineInventory) {
        console.log(
          "[Layout] Setting machine inventory and calculating availability"
        );
        machineInventoryStore.setMachineInventory(machineId, machineInventory);

        // Compute recipe availability based on machine inventory
        recipeAvailabilityStore.computeAvailability(machineId);
      } else {
        console.log("[Layout] No inventory data for current machine yet");
      }
    } else {
      console.log("[Layout] No machine ID in localStorage");
    }
  }, [
    isConnected,
    initSocket,
    recipes,
    machineInventories,
    recipeStore,
    ingredientStore,
    recipeIngredientStore,
    machineInventoryStore,
    recipeAvailabilityStore,
  ]);

  // Use a separate effect to update inventory when WebSocket data changes
  // This helps isolate and debug inventory update issues
  const machineId =
    typeof window !== "undefined" ? localStorage.getItem("machineId") : null;

  useEffect(() => {
    if (machineId) {
      console.log(
        "[Layout] Setting up inventory listener for machine:",
        machineId
      );

      // Join machine room to get machine-specific updates
      if (isConnected) {
        console.log("[Layout] Joining machine room:", machineId);
        useWebSocketStore.getState().joinMachineRoom(machineId);
      } else {
        console.log("[Layout] WebSocket not connected, trying direct API call");

        // If WebSocket is not connected, try a direct API call as fallback
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        // Handle case where NEXT_PUBLIC_API_URL already ends with /api
        const baseUrl = apiUrl.replace(/\/api$/, "");
        const inventoryUrl = `${baseUrl}/api/machines/${machineId}/inventory`;

        console.log("[Layout] Fetching inventory from:", inventoryUrl);

        fetch(inventoryUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log(
              "[Layout] Received inventory from API:",
              data.length,
              "items"
            );
            if (data && data.length > 0) {
              machineInventoryStore.setMachineInventory(machineId, data);
              recipeAvailabilityStore.computeAvailability(machineId);
            }
          })
          .catch((error) => {
            console.error(
              "[Layout] API inventory fetch failed:",
              error.message
            );
          });
      }
    }
  }, [machineId, isConnected, machineInventoryStore, recipeAvailabilityStore]);

  // Use the specialized hook to handle inventory updates
  useUpdateMachineInventory(
    machineId || "",
    machineId ? machineInventories[machineId] : undefined
  );

  return <div className="min-h-screen">{children}</div>;
}
