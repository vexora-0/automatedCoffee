"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Recipe, RecipeIngredient, Ingredient } from "@/lib/api/types";
import { orderService, recipeIngredientService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Loader2, ThumbsUp, Coffee, Sparkles } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<'ingredients' | 'details'>('ingredients');

  // Load recipe ingredients when dialog opens
  useEffect(() => {
    if (!recipe || !isOpen) return;
    
    const loadIngredients = async () => {
      setIsLoadingIngredients(true);
      
      // First try to get ingredients from props
      const relevantIngredients = recipeIngredients.filter(
        ri => ri.recipe_id === recipe.recipe_id
      );
      
      if (relevantIngredients.length > 0) {
        setLocalRecipeIngredients(relevantIngredients);
        setIsLoadingIngredients(false);
        return;
      }
      
      // Fallback to API if no ingredients found in props
      try {
        const response = await recipeIngredientService.getRecipeIngredientsByRecipeId(recipe.recipe_id);
        if (response.success && response.data && response.data.length > 0) {
          setLocalRecipeIngredients(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch recipe ingredients");
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    loadIngredients();
  }, [recipe, isOpen, recipeIngredients]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage("");
      setShowOrderSuccess(false);
    }
  }, [isOpen]);

  // Format price as currency
  const formattedPrice = recipe
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(recipe.price)
    : "₹0.00";

  const handlePlaceOrder = async () => {
    if (!recipe) return;

    const userId = localStorage.getItem("userId");
    const machineId = localStorage.getItem("machineId");

    if (!userId || !machineId) {
      setErrorMessage("Session expired. Please login again.");
      return;
    }

    setIsOrdering(true);
    setErrorMessage("");

    try {
      const response = await orderService.createOrder({
        user_id: userId,
        machine_id: machineId,
        recipe_id: recipe.recipe_id,
        status: "pending",
      });

      if (response.success && response.data) {
        setShowOrderSuccess(true);
        
        // Wait 2 seconds before redirecting to success page
        setTimeout(() => {
          router.push(`/product/success?recipe=${encodeURIComponent(recipe.name)}&price=${encodeURIComponent(recipe.price)}`);
        }, 2000);
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
  const recipeIngredientsList = recipe && (localRecipeIngredients.length > 0 
    ? localRecipeIngredients 
    : recipeIngredients.filter(ri => ri.recipe_id === recipe.recipe_id)
  ).map(ri => {
    const ingredient = ingredients.find(i => i.ingredient_id === ri.ingredient_id);
    
    return {
      ...ri,
      name: ingredient?.name || `Ingredient ${ri.ingredient_id.slice(0, 6)}`,
      unit: ingredient?.unit || "",
    };
  });

  if (!recipe) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Dialog container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-[55] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-xl"
          >
            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 z-[60] flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-white hover:text-black transition-colors"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2 h-full bg-gradient-to-br from-slate-900 to-black border border-amber-500/10">
              {/* Left column - Image and branding */}
              <div className="relative flex flex-col">
                {/* Image */}
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <div className="absolute inset-0 bg-black/30 mix-blend-overlay z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-slate-900/90 z-10" />
                  
                  <Image
                    src={recipe.image_url || "/placeholder-recipe.jpg"}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {/* Recipe name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-medium uppercase tracking-wider text-amber-400/90">
                          Premium Recipe
                        </p>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{recipe.name}</h2>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-amber-600/30 flex items-center justify-center">
                          <Coffee className="h-3 w-3 text-amber-400" />
                        </div>
                        <p className="text-sm text-gray-300">{recipe.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price card */}
                <div className="bg-black/60 backdrop-blur-md p-6 border-t border-amber-500/10 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-medium text-white">Price</h3>
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 rounded-full">
                      <span className="text-lg font-bold text-white">{formattedPrice}</span>
                    </div>
                  </div>
                  
                  {/* Order button */}
                  <div className="mt-auto">
                    {errorMessage && (
                      <div className="bg-red-950/30 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg mb-4">
                        <p className="text-sm font-medium">{errorMessage}</p>
                      </div>
                    )}
                    
                    <Button
                      className="w-full py-5 text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black border-none"
                      onClick={handlePlaceOrder}
                      disabled={isOrdering || showOrderSuccess}
                    >
                      {isOrdering ? (
                        <>
                          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-6 w-6" />
                          Order Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right column - Tabs and details */}
              <div className="bg-black/40 backdrop-blur-md border-l border-white/5">
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`flex-1 py-4 text-center font-medium relative ${
                      activeTab === 'ingredients' ? 'text-amber-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Ingredients
                    {activeTab === 'ingredients' && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-4 text-center font-medium relative ${
                      activeTab === 'details' ? 'text-amber-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Details
                    {activeTab === 'details' && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </button>
                </div>
                
                {/* Tab content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'ingredients' && (
                      <motion.div
                        key="ingredients"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <h3 className="text-xl font-bold text-white mb-4">
                          Recipe Ingredients
                        </h3>
                        
                        {isLoadingIngredients ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                          </div>
                        ) : recipeIngredientsList && recipeIngredientsList.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {recipeIngredientsList.map((ingredient, index) => (
                              <div 
                                key={ingredient.ingredient_id}
                                className="flex items-center gap-3 p-4 bg-black/60 rounded-lg border border-amber-500/10"
                              >
                                <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-white font-medium">
                                    {ingredient.name}
                                  </div>
                                  <div className="text-sm text-amber-400/70">
                                    {ingredient.quantity} {ingredient.unit}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-xl bg-black/30 border border-white/10 text-center">
                            <p className="text-gray-400 italic">No ingredients information available</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {activeTab === 'details' && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-white mb-3">About this Recipe</h3>
                          <p className="text-gray-300">
                            {recipe.description || "A premium coffee creation crafted with care and precision."}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                            <h4 className="text-amber-400 text-sm font-medium mb-1">Category</h4>
                            <p className="text-white font-bold">
                              {recipe.category_id === "1" ? "Coffee" : "Specialty"}
                            </p>
                          </div>
                          
                          <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                            <h4 className="text-amber-400 text-sm font-medium mb-1">Recipe ID</h4>
                            <p className="text-white font-mono text-sm">
                              {recipe.recipe_id.substring(0, 12)}...
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-black/40 p-5 rounded-lg border border-amber-900/10">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-amber-300 font-medium mb-1">Premium Experience</h4>
                              <p className="text-gray-300 text-sm">
                                This recipe is crafted using our finest ingredients and brewing techniques to deliver an exceptional tasting experience.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Order success overlay */}
            <AnimatePresence>
              {showOrderSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center"
                >
                  <div className="bg-gradient-to-b from-slate-900 to-black rounded-xl p-6 max-w-md w-full border border-amber-500/20">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/30 to-green-700/20 flex items-center justify-center mb-6 mx-auto border border-green-500/30">
                      <ThumbsUp className="h-7 w-7 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-3">
                      Order Successful!
                    </h3>
                    <p className="text-amber-100/70 text-center mb-6">
                      Your {recipe.name} is being prepared.
                    </p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "linear" }}
                      className="h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4"
                    />
                    <p className="text-sm text-amber-300/70 text-center">
                      Redirecting...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 