"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRecipes, useRecipeCategories } from "@/lib/api/hooks";
import { RecipeCategory } from "@/lib/api/types";
import { RecipeCard } from "./components/RecipeCard";
import { ChevronLeft, Coffee, Search, FilterX } from "lucide-react";
import { useRecipes as useStoreRecipes } from "@/app/product/stores/useRecipeStore";
import useRecipeAvailabilityStore from "@/app/product/stores/useRecipeAvailabilityStore";

export default function CategoryRecipesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.categoryId as string;
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { recipes: apiRecipes, isLoading: isLoadingRecipes } =
    useRecipes(categoryId);
  const { categories, isLoading: isLoadingCategories } = useRecipeCategories();

  // Use Zustand stores for recipes and availability
  const { recipes: storeRecipes } = useStoreRecipes();
  const recipeAvailabilityStore = useRecipeAvailabilityStore();
  const [machineId, setMachineId] = useState<string | null>(null);

  const [currentCategory, setCurrentCategory] = useState<RecipeCategory | null>(
    null
  );

  // Handle category selection
  useEffect(() => {
    // Find the current category from available categories
    if (categories.length > 0 && categoryId) {
      const category = categories.find((cat) => cat.category_id === categoryId);
      if (category) {
        setCurrentCategory(category);
      }
    }

    // Get machine ID from localStorage (just once)
    const storedMachineId = localStorage.getItem("machineId");
    if (storedMachineId) {
      setMachineId(storedMachineId);
    }
  }, [categories, categoryId]);

  // Separate useEffect for availability computation
  useEffect(() => {
    // Compute availability when machineId changes
    if (machineId) {
      // We use a function reference to avoid re-triggering this effect
      const computeAvailability = recipeAvailabilityStore.computeAvailability;
      computeAvailability(machineId);
    }
  }, [machineId]);

  // Filter recipes by the current category
  const categoryRecipes =
    storeRecipes.length > 0
      ? storeRecipes.filter((recipe) => recipe.category_id === categoryId)
      : apiRecipes;

  // Apply search filter if query exists
  const filteredRecipes = searchQuery.trim()
    ? categoryRecipes.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (recipe.description &&
            recipe.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      )
    : categoryRecipes;

  const handleBackToCategories = () => {
    router.push("/product/pages/recipes");
  };

  const handleRecipeSelect = (recipeId: string) => {
    router.push(`/product/pages/recipe-details/${recipeId}`);
  };

  // Check recipe availability
  const isRecipeAvailable = (recipeId: string): boolean => {
    return recipeAvailabilityStore.isRecipeAvailable(recipeId);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };

  // Early SSR return to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">
              {currentCategory?.name || "RECIPES"}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Determine the appropriate theme color based on category
  const getCategoryColor = (name: string | undefined): string => {
    if (!name) return "amber";

    if (name.includes("Hot")) return "amber";
    if (name.includes("Iced")) return "blue";
    if (name.includes("Specialty")) return "purple";
    if (name.includes("Seasonal")) return "green";
    if (name.includes("Extras")) return "pink";

    return "amber";
  };

  const categoryColor = getCategoryColor(currentCategory?.name);
  const accentColorClasses =
    {
      amber: "from-amber-800/30 to-amber-700/10 text-amber-500",
      blue: "from-blue-800/30 to-blue-700/10 text-blue-400",
      purple: "from-purple-800/30 to-purple-700/10 text-purple-400",
      green: "from-green-800/30 to-green-700/10 text-green-400",
      pink: "from-pink-800/30 to-pink-700/10 text-pink-400",
    }[categoryColor] || "from-amber-800/30 to-amber-700/10 text-amber-500";

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
      <motion.header
        className="relative z-10 pt-8 px-6 lg:px-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ x: -3 }}
            onClick={handleBackToCategories}
            className="flex items-center text-gray-400 hover:text-amber-500 transition-colors bg-transparent border-0"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 text-sm">Back</span>
          </motion.button>

          <motion.h1
            className={`text-xl font-bold text-white ${
              categoryColor === "amber" ? "text-amber-400" : ""
            }`}
          >
            {currentCategory?.name || "Recipes"}
          </motion.h1>

          <div className="w-8"></div>
        </div>
      </motion.header>

      {/* Category banner */}
      <motion.div
        className="relative z-10 mt-6 px-6 lg:px-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`rounded-2xl p-6 bg-gradient-to-r ${accentColorClasses}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${accentColorClasses} flex items-center justify-center`}
              >
                <Coffee
                  className={accentColorClasses.split(" ").pop()}
                  size={26}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {currentCategory?.name || "Recipes"}
                </h2>
                <p className="text-gray-300 text-sm">
                  {currentCategory?.name
                    ? `Explore our premium ${currentCategory.name.toLowerCase()} selections`
                    : "Explore our premium coffee menu"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search bar */}
      <motion.div
        className="relative z-10 mt-8 px-6 lg:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#141414] text-white w-full pl-10 pr-4 py-3 rounded-xl border border-[#292929] focus:outline-none focus:border-amber-600/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-500"
              >
                <FilterX size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.main
        className="relative z-10 flex-1 px-6 lg:px-10 py-8 mb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto">
          {isLoadingRecipes || isLoadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[#141414]/50 h-64 rounded-xl animate-pulse border border-[#222]"
                ></div>
              ))}
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.recipe_id}
                  recipe={recipe}
                  isAvailable={isRecipeAvailable(recipe.recipe_id)}
                  onClick={() => handleRecipeSelect(recipe.recipe_id)}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-5 bg-gradient-to-br from-amber-800/20 to-amber-900/5 rounded-full mb-6">
                <Coffee className="h-10 w-10 text-amber-500/70" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                {searchQuery ? "No Matching Recipes" : "No Recipes Found"}
              </h2>
              <p className="text-gray-400 max-w-md">
                {searchQuery
                  ? "We couldn't find any recipes matching your search. Please try a different search term."
                  : "We couldn't find any recipes in this category. Please check back later or select a different category."}
              </p>

              {searchQuery ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-amber-700 to-amber-900 text-white font-medium hover:from-amber-600 hover:to-amber-800 transition-all duration-300"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-amber-700 to-amber-900 text-white font-medium hover:from-amber-600 hover:to-amber-800 transition-all duration-300"
                  onClick={handleBackToCategories}
                >
                  View All Categories
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
