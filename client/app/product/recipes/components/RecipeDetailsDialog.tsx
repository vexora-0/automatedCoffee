"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Recipe, RecipeIngredient, Ingredient } from "@/lib/api/types";
import { orderService, recipeIngredientService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import {
  X,
  CreditCard,
  Loader2,
  ThumbsUp,
  Coffee,
  Sparkles,
} from "lucide-react";
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
  const [localRecipeIngredients, setLocalRecipeIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingredients" | "details">(
    "ingredients"
  );

  // Load recipe ingredients when dialog opens
  useEffect(() => {
    if (!recipe || !isOpen) return;

    const loadIngredients = async () => {
      setIsLoadingIngredients(true);

      // First try to get ingredients from props
      const relevantIngredients = recipeIngredients.filter(
        (ri) => ri.recipe_id === recipe.recipe_id
      );

      if (relevantIngredients.length > 0) {
        setLocalRecipeIngredients(relevantIngredients);
        setIsLoadingIngredients(false);
        return;
      }

      // Fallback to API if no ingredients found in props
      try {
        const response =
          await recipeIngredientService.getRecipeIngredientsByRecipeId(
            recipe.recipe_id
          );
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
        maximumFractionDigits: 2,
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
          router.push(
            `/product/success?recipe=${encodeURIComponent(
              recipe.name
            )}&price=${encodeURIComponent(recipe.price)}`
          );
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
  const recipeIngredientsList =
    recipe &&
    (localRecipeIngredients.length > 0
      ? localRecipeIngredients
      : recipeIngredients.filter((ri) => ri.recipe_id === recipe.recipe_id)
    ).map((ri) => {
      const ingredient = ingredients.find(
        (i) => i.ingredient_id === ri.ingredient_id
      );

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
              className="absolute top-4 right-4 z-[60] flex items-center justify-center w-9 h-9 rounded-full bg-[#5F3023]/80 text-[#F4EBDE] border border-[#DAB49D]/20 backdrop-blur-md hover:bg-[#DAB49D] hover:text-[#5F3023] transition-colors"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2 h-full bg-gradient-to-br from-[#8A5738] to-[#5F3023] border border-[#C28654]/30">
              {/* Left column - Image and branding */}
              <div className="relative flex flex-col">
                {/* Image */}
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <div className="absolute inset-0 bg-[#5F3023]/30 mix-blend-overlay z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#5F3023]/50 via-transparent to-[#8A5738]/90 z-10" />

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
                        <Sparkles className="h-4 w-4 text-[#DAB49D]" />
                        <p className="text-xs font-medium uppercase tracking-wider text-[#DAB49D]">
                          Premium Recipe
                        </p>
                      </div>
                      <h2 className="text-3xl font-bold text-[#F4EBDE]">
                        {recipe.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#C28654]/40 flex items-center justify-center">
                          <Coffee className="h-3 w-3 text-[#F4EBDE]" />
                        </div>
                        <p className="text-sm text-[#F4EBDE]/80">
                          {recipe.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price card */}
                <div className="bg-[#5F3023]/80 backdrop-blur-md p-6 border-t border-[#C28654]/30 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-medium text-[#F4EBDE]">
                      Price
                    </h3>
                    <div className="bg-gradient-to-r from-[#C28654] to-[#8A5738] px-4 py-2 rounded-full">
                      <span className="text-lg font-bold text-[#F4EBDE]">
                        {formattedPrice}
                      </span>
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
                      className="w-full py-5 text-lg font-bold bg-gradient-to-r from-[#C28654] to-[#8A5738] hover:from-[#DAB49D] hover:to-[#C28654] text-[#F4EBDE] border-none"
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
              <div className="bg-[#5F3023]/70 backdrop-blur-md border-l border-[#DAB49D]/10">
                {/* Tabs */}
                <div className="flex border-b border-[#DAB49D]/20">
                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`flex-1 py-4 text-center font-medium relative ${
                      activeTab === "ingredients"
                        ? "text-[#DAB49D]"
                        : "text-[#F4EBDE]/70 hover:text-[#F4EBDE]"
                    }`}
                  >
                    Ingredients
                    {activeTab === "ingredients" && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DAB49D]"
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 py-4 text-center font-medium relative ${
                      activeTab === "details"
                        ? "text-[#DAB49D]"
                        : "text-[#F4EBDE]/70 hover:text-[#F4EBDE]"
                    }`}
                  >
                    Details
                    {activeTab === "details" && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DAB49D]"
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </button>
                </div>

                {/* Tab content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                  <AnimatePresence mode="wait">
                    {activeTab === "ingredients" && (
                      <motion.div
                        key="ingredients"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <h3 className="text-xl font-bold text-[#F4EBDE] mb-4">
                          Recipe Ingredients
                        </h3>

                        {isLoadingIngredients ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 text-[#DAB49D] animate-spin" />
                          </div>
                        ) : recipeIngredientsList &&
                          recipeIngredientsList.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {recipeIngredientsList.map((ingredient, index) => (
                              <div
                                key={ingredient.ingredient_id}
                                className="flex items-center gap-3 p-4 bg-[#5F3023]/60 rounded-lg border border-[#C28654]/20"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#C28654]/30 flex items-center justify-center flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-[#DAB49D]"></div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-[#F4EBDE] font-medium">
                                    {ingredient.name}
                                  </div>
                                  <div className="text-sm text-[#DAB49D]">
                                    {ingredient.quantity} {ingredient.unit}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-xl bg-[#5F3023]/50 border border-[#DAB49D]/10 text-center">
                            <p className="text-[#F4EBDE]/70 italic">
                              No ingredients information available
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "details" && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-[#F4EBDE] mb-3">
                            About this Recipe
                          </h3>
                          <p className="text-[#F4EBDE]/80">
                            {recipe.description ||
                              "A premium coffee creation crafted with care and precision."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#5F3023]/60 rounded-lg p-4 border border-[#DAB49D]/10">
                            <h4 className="text-[#DAB49D] text-sm font-medium mb-1">
                              Category
                            </h4>
                            <p className="text-[#F4EBDE] font-bold">
                              {recipe.category_id === "1"
                                ? "Coffee"
                                : "Specialty"}
                            </p>
                          </div>

                          <div className="bg-[#5F3023]/60 rounded-lg p-4 border border-[#DAB49D]/10">
                            <h4 className="text-[#DAB49D] text-sm font-medium mb-1">
                              Recipe ID
                            </h4>
                            <p className="text-[#F4EBDE] font-mono text-sm">
                              {recipe.recipe_id.substring(0, 12)}...
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#5F3023]/60 p-5 rounded-lg border border-[#C28654]/20">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-[#DAB49D] mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-[#DAB49D] font-medium mb-1">
                                Premium Experience
                              </h4>
                              <p className="text-[#F4EBDE]/80 text-sm">
                                This recipe is crafted using our finest
                                ingredients and brewing techniques to deliver an
                                exceptional tasting experience.
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
                  className="absolute inset-0 z-[70] bg-[#5F3023]/90 backdrop-blur-md flex items-center justify-center"
                >
                  <div className="bg-gradient-to-b from-[#8A5738] to-[#5F3023] rounded-xl p-6 max-w-md w-full border border-[#C28654]/30">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/30 to-green-700/20 flex items-center justify-center mb-6 mx-auto border border-green-500/30">
                      <ThumbsUp className="h-7 w-7 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-[#F4EBDE] text-center mb-3">
                      Order Successful!
                    </h3>
                    <p className="text-[#DAB49D] text-center mb-6">
                      Your {recipe.name} is being prepared.
                    </p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "linear" }}
                      className="h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4"
                    />
                    <p className="text-sm text-[#DAB49D]/70 text-center">
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
