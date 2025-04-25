"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRecipe } from "@/lib/api/hooks";
import { orderService } from "@/lib/api/services";
import { Recipe, RecipeIngredient, Ingredient } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRecipes } from "@/app/product/stores/useRecipeStore";
import useRecipeIngredientStore from "@/app/product/stores/useRecipeIngredientStore";
import useIngredientStore from "@/app/product/stores/useIngredientStore";
import {
  ChevronLeft,
  Coffee,
  CreditCard,
  Loader2,
  ThumbsUp,
  Heart,
  Share2,
  Clock,
  Star,
} from "lucide-react";

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.recipeId as string;
  const [isMounted, setIsMounted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch recipe details using SWR hook
  const { recipe: apiRecipe, isLoading: isLoadingApiRecipe } =
    useRecipe(recipeId);
  // Fetch recipes from store
  const { recipes } = useRecipes();
  const storeRecipe = recipes.find((r: Recipe) => r.recipe_id === recipeId);

  // Merge data from API and store, prioritizing store data
  const recipe = storeRecipe || apiRecipe;

  // Get recipe ingredients from recipeIngredientStore
  const recipeIngredientStore = useRecipeIngredientStore();
  const recipeIngredients =
    recipeIngredientStore.getIngredientsByRecipeId(recipeId);

  // Get all ingredients from ingredientStore
  const ingredientStore = useIngredientStore();
  const ingredients = ingredientStore.getAllIngredients();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format price as currency
  const formattedPrice = recipe
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(recipe.price)
    : "$0.00";

  const handleBackToRecipes = () => {
    if (recipe) {
      router.push(`/product/pages/recipes/${recipe.category_id}`);
    } else {
      router.push("/product/pages/recipes");
    }
  };

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
        recipe_id: recipeId,
        status: "pending",
      });

      if (response.success && response.data) {
        setShowOrderSuccess(true);
        // Automatically return to the screensaver after a delay
        setTimeout(() => {
          router.push("/product/pages/screensaver");
        }, 5000);
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
  const recipeIngredientsList = recipeIngredients.map(
    (ri: RecipeIngredient) => {
      const ingredient = ingredients.find(
        (i: Ingredient) => i.ingredient_id === ri.ingredient_id
      );
      return {
        ...ri,
        name: ingredient?.name || "Unknown",
        unit: ingredient?.unit || "",
      };
    }
  );

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

  // Early return for server-side rendering
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
          <p className="text-white/70">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (isLoadingApiRecipe && !recipe) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
          <p className="text-white/70">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black/60 border border-amber-900/20 backdrop-blur-lg">
          <CardContent className="pt-6 text-center">
            <Coffee className="h-12 w-12 text-amber-500/70 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-white">
              Recipe Not Found
            </h2>
            <p className="text-gray-400 mb-6">
              We couldn&apos;t find the recipe you&apos;re looking for.
            </p>
            <Button
              onClick={() => router.push("/product/pages/recipes")}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            >
              View All Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] to-black opacity-80"></div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -3 }}
        className="absolute top-6 left-6 z-50 flex items-center text-white/70 hover:text-white transition-colors"
        onClick={handleBackToRecipes}
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        <span className="text-sm">Back</span>
      </motion.button>

      {/* Main content */}
      <motion.div
        className="container mx-auto px-4 py-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image gallery */}
          <motion.div
            variants={itemVariants}
            className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10"
          >
            <Image
              src={recipe.image_url || "/placeholder-recipe.jpg"}
              alt={recipe.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Image actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-white"
                  }`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10"
              >
                <Share2 className="h-5 w-5 text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* Product details */}
          <motion.div variants={itemVariants} className="flex flex-col">
            {/* Title and price */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-white mb-2">
                {recipe.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-amber-500 text-lg font-bold">
                  {formattedPrice}
                </span>
              </div>
              <p className="text-gray-400 text-lg">{recipe.description}</p>
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Clock className="h-5 w-5 text-amber-500 mb-2" />
                <div className="text-sm text-gray-400">Prep Time</div>
                <div className="text-white font-medium">2-3 min</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Coffee className="h-5 w-5 text-amber-500 mb-2" />
                <div className="text-sm text-gray-400">Type</div>
                <div className="text-white font-medium">Hot</div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Ingredients
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {recipeIngredientsList.map((ingredient, index) => (
                  <motion.div
                    key={ingredient.ingredient_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div>
                      <div className="text-white font-medium">
                        {ingredient.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {ingredient.quantity} {ingredient.unit}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order button */}
            <div className="mt-auto">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-950/30 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg mb-4"
                >
                  <p className="text-sm font-medium">{errorMessage}</p>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full py-6 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-black border-none shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]"
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
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
          </motion.div>
        </div>
      </motion.div>

      {/* Order success overlay */}
      {showOrderSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-black/60 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-amber-900/20"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto backdrop-blur-md border border-green-500/30"
            >
              <ThumbsUp className="h-7 w-7 text-green-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              Order Successful!
            </h3>
            <p className="text-amber-100/70 text-center mb-6">
              Your {recipe.name} is being prepared.
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-1 bg-green-500/50 rounded-full mb-4"
            />
            <p className="text-sm text-amber-300/70 text-center">
              Returning to home screen...
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
