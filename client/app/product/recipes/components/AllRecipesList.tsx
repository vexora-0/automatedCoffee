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
  getRecipesByCategory: (categoryId: string) => Recipe[];
  isRecipeAvailable: (recipeId: string) => boolean;
  recipeIngredients: RecipeIngredient[];
  ingredients: Ingredient[];
}

export default function AllRecipesList({
  categories,
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

  // Animation variants with refined durations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.07,
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="space-y-24">
      {categories.map((category, categoryIndex) => {
        const categoryRecipes = getRecipesByCategory(category.category_id);

        if (categoryRecipes.length === 0) {
          return null;
        }

        return (
          <motion.div
            key={category.category_id}
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: categoryIndex * 0.1,
              ease: "easeOut",
            }}
          >
            {/* Background decorative elements */}
            <div className="absolute -left-20 top-10 w-40 h-40 rounded-full bg-[#C28654]/5 -z-10 blur-xl"></div>
            <div className="absolute -right-10 bottom-10 w-32 h-32 rounded-full bg-[#8A5738]/5 -z-10 blur-xl"></div>

            {/* Category header */}
            <div className="relative mb-10">
              <motion.div
                className="h-[2px] w-16 bg-[#C28654] mb-3"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ duration: 0.6, delay: 0.3 + categoryIndex * 0.1 }}
              />
              <motion.h2
                className="text-3xl font-bold text-[#5F3023] mb-2 sticky top-4 z-10 py-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
              >
                {category.name}
              </motion.h2>
              <motion.p
                className="text-[#8A5738]/80 text-lg max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + categoryIndex * 0.1 }}
              >
                {getCategoryDescription(category.name)}
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {categoryRecipes.map((recipe) => (
                <motion.div key={recipe.recipe_id} variants={itemVariants}>
                  <RecipeCard
                    recipe={recipe}
                    isAvailable={isRecipeAvailable(recipe.recipe_id)}
                    // Prevent clicks when unavailable
                    onClick={
                      isRecipeAvailable(recipe.recipe_id)
                        ? () => handleRecipeClick(recipe)
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
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

// Helper function to provide descriptions for each category
function getCategoryDescription(categoryName: string): string {
  const descriptions: Record<string, string> = {
    Coffee:
      "Our signature coffee collection crafted with precision and passion, featuring both classic and innovative creations.",
    Tea: "Exquisite teas from around the world, carefully selected and prepared for a perfect cup every time.",
    "Cold Drinks":
      "Refreshing cold beverages perfect for any season, from fruity concoctions to iced coffee classics.",
    Specialty:
      "Unique specialty drinks created by our master baristas, offering extraordinary flavors and experiences.",
    Seasonal:
      "Limited-time offerings that celebrate the flavors of the season with premium ingredients.",
  };

  return (
    descriptions[categoryName] ||
    "Discover our delicious selection of premium beverages."
  );
}
