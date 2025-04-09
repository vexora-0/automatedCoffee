import { create } from 'zustand';
import { Recipe } from '@/lib/api/types';
import { immer } from 'zustand/middleware/immer';
import { memoize } from './utils';
import { useWebSocketStore } from './useWebSocketStore';
import { useEffect } from 'react';

interface RecipeStore {
  // Normalized data structure for O(1) lookups
  recipesById: Record<string, Recipe>;
  recipeIds: string[];
  // Added: Category-based index for O(1) category lookups
  categorizedRecipes: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipeId: string, recipe: Partial<Recipe>) => void;
  removeRecipe: (recipeId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selectors (computed values)
  getRecipeById: (id: string) => Recipe | undefined;
  getAllRecipes: () => Recipe[];
  getRecipesByCategory: (categoryId: string) => Recipe[];
}

const useRecipeStore = create<RecipeStore>()(
  immer((set, get) => ({
    recipesById: {},
    recipeIds: [],
    categorizedRecipes: {},
    isLoading: false,
    error: null,

    // Actions
    setRecipes: (recipes) => set((state) => {
      // Reset state
      state.recipesById = {};
      state.recipeIds = [];
      state.categorizedRecipes = {};
      
      recipes.forEach((recipe) => {
        // Add to main indices
        state.recipesById[recipe.recipe_id] = recipe;
        state.recipeIds.push(recipe.recipe_id);
        
        // Add to category index for O(1) category lookup
        if (!state.categorizedRecipes[recipe.category_id]) {
          state.categorizedRecipes[recipe.category_id] = [];
        }
        state.categorizedRecipes[recipe.category_id].push(recipe.recipe_id);
      });
    }),
    
    addRecipe: (recipe) => set((state) => {
      // Add to main indices if not exists
      if (!state.recipesById[recipe.recipe_id]) {
        state.recipeIds.push(recipe.recipe_id);
      }
      state.recipesById[recipe.recipe_id] = recipe;
      
      // Add to category index
      if (!state.categorizedRecipes[recipe.category_id]) {
        state.categorizedRecipes[recipe.category_id] = [];
      }
      if (!state.categorizedRecipes[recipe.category_id].includes(recipe.recipe_id)) {
        state.categorizedRecipes[recipe.category_id].push(recipe.recipe_id);
      }
    }),
    
    updateRecipe: (recipeId, updatedRecipe) => set((state) => {
      if (state.recipesById[recipeId]) {
        const oldCategoryId = state.recipesById[recipeId].category_id;
        const newCategoryId = updatedRecipe.category_id;
        
        // Update recipe
        state.recipesById[recipeId] = {
          ...state.recipesById[recipeId],
          ...updatedRecipe
        };
        
        // Update category index if category changed
        if (newCategoryId && newCategoryId !== oldCategoryId) {
          // Remove from old category
          if (state.categorizedRecipes[oldCategoryId]) {
            const index = state.categorizedRecipes[oldCategoryId].indexOf(recipeId);
            if (index >= 0) {
              state.categorizedRecipes[oldCategoryId].splice(index, 1);
            }
          }
          
          // Add to new category
          if (!state.categorizedRecipes[newCategoryId]) {
            state.categorizedRecipes[newCategoryId] = [];
          }
          state.categorizedRecipes[newCategoryId].push(recipeId);
        }
      }
    }),
    
    removeRecipe: (recipeId) => set((state) => {
      if (state.recipesById[recipeId]) {
        const categoryId = state.recipesById[recipeId].category_id;
        
        // Remove from category index
        if (state.categorizedRecipes[categoryId]) {
          const categoryIndex = state.categorizedRecipes[categoryId].indexOf(recipeId);
          if (categoryIndex >= 0) {
            state.categorizedRecipes[categoryId].splice(categoryIndex, 1);
          }
        }
        
        // Remove from main indices
        delete state.recipesById[recipeId];
        const index = state.recipeIds.indexOf(recipeId);
        if (index >= 0) {
          state.recipeIds.splice(index, 1); // Using splice for in-place mutation (faster)
        }
      }
    }),
    
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),
    
    setError: (error) => set((state) => {
      state.error = error;
    }),
    
    // Selectors
    getRecipeById: (id: string) => get().recipesById[id],
    
    getAllRecipes: memoize<[], Recipe[]>(() => {
      const { recipesById, recipeIds } = get();
      return recipeIds.map(id => recipesById[id]);
    }),
    
    getRecipesByCategory: memoize<[string], Recipe[]>((categoryId) => {
      const { recipesById, categorizedRecipes } = get();
      const categoryRecipeIds = categorizedRecipes[categoryId] || [];
      return categoryRecipeIds.map(id => recipesById[id]);
    })
  }))
);

// Export a hook to use recipes with WebSocket integration
export const useRecipes = () => {
  const recipes = useRecipeStore(state => state.getAllRecipes());
  const setRecipes = useRecipeStore(state => state.setRecipes);
  const setLoading = useRecipeStore(state => state.setLoading);
  
  // Get WebSocket recipes
  const wsRecipes = useWebSocketStore(state => state.recipes);
  const isWSConnected = useWebSocketStore(state => state.isConnected);
  
  // Sync WebSocket recipes with RecipeStore when they change
  useEffect(() => {
    if (wsRecipes && wsRecipes.length > 0) {
      setRecipes(wsRecipes);
      setLoading(false);
    }
  }, [wsRecipes, setRecipes, setLoading]);
  
  return {
    recipes,
    isLoading: useRecipeStore(state => state.isLoading),
    error: useRecipeStore(state => state.error),
    isRealTimeConnected: isWSConnected
  };
};

export default useRecipeStore; 