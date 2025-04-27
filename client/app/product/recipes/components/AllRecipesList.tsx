"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeCategory, Recipe, RecipeIngredient, Ingredient } from "@/lib/api/types";
import { RecipeCard } from "./RecipeCard";
import RecipeDetailsDialog from "./RecipeDetailsDialog";

interface AllRecipesListProps {
  categories: RecipeCategory[];
  recipes: Recipe[];
  getRecipesByCategory: (categoryId: string) => Recipe[];
  isRecipeAvailable: (recipeId: string) => boolean;
  recipeIngredients: RecipeIngredient[];
  ingredients: Ingredient[];
}

export default function AllRecipesList({
  categories,
  recipes,
  getRecipesByCategory,
  isRecipeAvailable,
  recipeIngredients,
  ingredients,
}: AllRecipesListProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.category_id || "");
  const categoryRef = useRef<HTMLDivElement>(null);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedRecipe(null), 300);
  };

  // Animation variants with shorter durations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.1 }
    },
  };

  return (
    <div className="space-y-6">
      {/* Category Navigation */}
      <div className="relative">
        <div 
          ref={categoryRef}
          className="flex overflow-x-auto py-3 px-2 space-x-2 scrollbar-hide"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.category_id;
            return (
              <motion.button
                key={category.category_id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(category.category_id)}
                className={`flex-shrink-0 px-6 py-3 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-600 text-white font-bold shadow-lg shadow-amber-600/30' 
                    : 'bg-black/40 border border-white/10 text-gray-300 hover:border-amber-500/40'
                }`}
              >
                {category.name}
                {isActive && (
                  <motion.div 
                    layoutId="activeCategoryIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {categories.map((category) => {
            if (category.category_id !== activeCategory) return null;
            
            const categoryRecipes = getRecipesByCategory(category.category_id);
            
            if (categoryRecipes.length === 0) {
              return (
                <div key={category.category_id} className="flex items-center justify-center h-40">
                  <p className="text-gray-400">No recipes available in this category</p>
                </div>
              );
            }
            
            return (
              <div key={category.category_id}>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {category.name}
                </h2>
                
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {categoryRecipes.map((recipe) => (
                    <motion.div key={recipe.recipe_id} variants={itemVariants}>
                      <RecipeCard
                        recipe={recipe}
                        isAvailable={isRecipeAvailable(recipe.recipe_id)}
                        onClick={() => handleRecipeClick(recipe)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <RecipeDetailsDialog
        recipe={selectedRecipe}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        recipeIngredients={recipeIngredients}
        ingredients={ingredients}
      />
    </div>
  );
} 