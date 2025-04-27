"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Recipe, RecipeIngredient, Ingredient } from "@/lib/api/types";
import { orderService, recipeService, recipeIngredientService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Loader2, ThumbsUp, Coffee } from "lucide-react";
import { useRouter } from "next/navigation";

// Interface for recipe details with ingredients
interface RecipeDetails extends Recipe {
  ingredients: RecipeIngredient[];
}

interface RecipeDetailsDialogProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  recipeIngredients: RecipeIngredient[];
  ingredients: Ingredient[];
}

export default function RecipeDetailsDialog({
  recipe,
  isOpen,
  onClose,
  recipeIngredients,
  ingredients,
}: RecipeDetailsDialogProps) {
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [localRecipeIngredients, setLocalRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);

  // Load recipe details with ingredients when dialog opens
  useEffect(() => {
    const loadRecipeDetails = async () => {
      if (recipe && isOpen) {
        setIsLoadingIngredients(true);
        try {
          // We'll use the recipe ID to filter the recipeIngredients directly
          const relevantIngredients = recipeIngredients.filter(
            ri => ri.recipe_id === recipe.recipe_id
          );
          
          if (relevantIngredients.length > 0) {
            setLocalRecipeIngredients(relevantIngredients);
            console.log(`Found ${relevantIngredients.length} ingredients for recipe ${recipe.name}`);
          } else {
            console.warn(`No ingredients found in props for recipe ${recipe.name} (ID: ${recipe.recipe_id}). Fetching from API...`);
            
            // Fallback to API request if no ingredients found in props
            try {
              const response = await recipeIngredientService.getRecipeIngredientsByRecipeId(recipe.recipe_id);
              if (response.success && response.data && response.data.length > 0) {
                setLocalRecipeIngredients(response.data);
                console.log(`Loaded ${response.data.length} ingredients from API for recipe ${recipe.name}`);
              } else {
                console.warn(`No ingredients found from API for recipe ${recipe.name}`);
              }
            } catch (apiError) {
              console.error(`Error fetching ingredients for recipe ${recipe.name}:`, apiError);
            }
          }
        } catch (error) {
          console.error("Failed to process recipe ingredients:", error);
        } finally {
          setIsLoadingIngredients(false);
        }
      }
    };

    loadRecipeDetails();
  }, [recipe, isOpen, recipeIngredients]);

  // Format price as currency
  const formattedPrice = recipe
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        currencyDisplay: "symbol"
      }).format(recipe.price)
    : "₹0.00";

  const handlePlaceOrder = async () => {
    if (!recipe) return;

    // Get IDs from localStorage
    const userId = localStorage.getItem("userId");
    const machineId = localStorage.getItem("machineId");

    if (!userId || !machineId) {
      setErrorMessage("Session expired. Please login again.");
      return;
    }

    setIsOrdering(true);
    setErrorMessage("");

    try {
      // Place order using the API
      const response = await orderService.createOrder({
        user_id: userId,
        machine_id: machineId,
        recipe_id: recipe.recipe_id,
        status: "pending",
      });

      if (response.success && response.data) {
        // Navigate directly to success page without delay
        router.push(`/product/success?recipe=${encodeURIComponent(recipe.name)}&price=${encodeURIComponent(recipe.price)}`);
      } else {
        setErrorMessage("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order error:", err);
      setErrorMessage("An error occurred while placing your order.");
    } finally {
      setIsOrdering(false);
    }
  };

  // Process ingredients for this recipe
  const recipeIngredientsList = recipe
    ? (localRecipeIngredients.length > 0 ? localRecipeIngredients : recipeIngredients.filter(ri => ri.recipe_id === recipe.recipe_id)).map(
        (ri: RecipeIngredient) => {
          const ingredient = ingredients.find(
            (i: Ingredient) => i.ingredient_id === ri.ingredient_id
          );
          return {
            ...ri,
            name: ingredient?.name || `Ingredient ${ri.ingredient_id.slice(0, 6)}`,
            unit: ingredient?.unit || "",
          };
        }
      )
    : [];

  if (!recipe) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop and close button container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Close button - completely outside the dialog */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 z-[60] flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </motion.button>

          {/* Main dialog content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-[55] w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full bg-gradient-to-br from-[#1c1c1c] to-[#111] border border-white/10">
              {/* Image section */}
              <div className="relative h-60 sm:h-64 md:h-full">
                <div className="absolute inset-0 bg-black/40 mix-blend-overlay z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10"></div>
                
                <Image
                  src={recipe.image_url || "/placeholder-recipe.jpg"}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Floating name label */}
                <div className="absolute bottom-5 left-0 right-0 text-center z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-amber-500/30"
                  >
                    <h2 className="text-xl font-bold text-white">{recipe.description}</h2>
                  </motion.div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="flex flex-col h-full">
                  {/* Header with price */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center">
                        <Coffee className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-400">{recipe.name}</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-bold text-amber-500"
                    >
                      {formattedPrice}
                    </motion.div>
                  </div>
                  
                  {/* Ingredients */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <span className="relative">
                        Ingredients
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                          className="absolute bottom-0 left-0 h-[2px] bg-amber-500/50"
                        />
                      </span>
                    </h3>
                    
                    {isLoadingIngredients ? (
                      <div className="p-4 rounded-xl bg-black/20 border border-white/10 text-center">
                        <p className="text-gray-400">Loading ingredients...</p>
                      </div>
                    ) : recipeIngredientsList.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {recipeIngredientsList.map((ingredient, index) => (
                          <motion.div 
                            key={ingredient.ingredient_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="flex items-center gap-3 p-3 bg-black/40 backdrop-blur-sm rounded-xl border border-white/5 hover:border-amber-500/20 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium">
                                {ingredient.name}
                              </div>
                              <div className="text-sm text-amber-300/70">
                                {ingredient.quantity} {ingredient.unit}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-black/20 border border-white/10 text-center">
                        <p className="text-gray-400 italic">No ingredients information available</p>
                      </div>
                    )}
                  </div>

                  {/* Error message */}
                  {errorMessage && (
                    <div className="bg-red-950/30 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg mb-4">
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                  )}

                  {/* Order button */}
                  <div className="mt-auto pt-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full py-5 sm:py-6 text-base sm:text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black border-none shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                        onClick={handlePlaceOrder}
                        disabled={isOrdering}
                      >
                        {isOrdering ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Order Now - {formattedPrice}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order success overlay */}
            {showOrderSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60]"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-b from-[#1c1c1c] to-black backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-md w-full border border-amber-900/20 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-green-700/20 flex items-center justify-center mb-6 mx-auto backdrop-blur-md border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    <ThumbsUp className="h-8 w-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white text-center mb-4">
                    Order Successful!
                  </h3>
                  <p className="text-amber-100/70 text-center mb-8">
                    Your {recipe.name} is being prepared.
                  </p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6"
                  />
                  <p className="text-sm text-amber-300/70 text-center">
                    Returning to home screen...
                  </p>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 