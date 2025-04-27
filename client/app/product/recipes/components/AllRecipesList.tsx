"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedRecipe(null), 300); // Clear selected recipe after dialog animation completes
  };

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

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.div 
        className="space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => {
          const categoryRecipes = getRecipesByCategory(category.category_id);
          
          if (categoryRecipes.length === 0) return null;
          
          return (
            <motion.div 
              key={category.category_id} 
              className="space-y-6"
              variants={categoryVariants}
            >
              <h2 className="text-2xl font-bold text-white">
                {category.name}
                <motion.div
                  className="h-1 w-16 bg-amber-500/70 mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: "4rem" }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                />
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.recipe_id}
                    recipe={recipe}
                    isAvailable={isRecipeAvailable(recipe.recipe_id)}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <RecipeDetailsDialog
        recipe={selectedRecipe}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        recipeIngredients={recipeIngredients}
        ingredients={ingredients}
      />
    </>
  );
} 