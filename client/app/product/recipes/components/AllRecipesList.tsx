"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RecipeCategory,
  Recipe,
  RecipeIngredient,
  Ingredient,
} from "@/lib/api/types";
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
      transition: { duration: 0.1 },
    },
  };

  return (
    <div className="space-y-16">
      {categories.map((category) => {
        const categoryRecipes = getRecipesByCategory(category.category_id);

        if (categoryRecipes.length === 0) {
          return null;
        }

        return (
          <div key={category.category_id} className="pb-6">
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
