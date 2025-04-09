"use client"
import { create } from 'zustand';
import { Ingredient } from '@/lib/api/types';
import { immer } from 'zustand/middleware/immer';

interface IngredientStore {
  // Normalized data for O(1) lookups
  ingredientsById: Record<string, Ingredient>;
  ingredientIds: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setIngredients: (ingredients: Ingredient[]) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (ingredientId: string, ingredient: Partial<Ingredient>) => void;
  removeIngredient: (ingredientId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selectors
  getIngredientById: (id: string) => Ingredient | undefined;
  getAllIngredients: () => Ingredient[];
  getIngredientsByName: (name: string) => Ingredient[];
}

const useIngredientStore = create<IngredientStore>()(
  immer((set, get) => ({
    ingredientsById: {},
    ingredientIds: [],
    isLoading: false,
    error: null,

    // Actions
    setIngredients: (ingredients) => set((state) => {
      state.ingredientsById = {};
      state.ingredientIds = [];
      
      ingredients.forEach((ingredient) => {
        state.ingredientsById[ingredient.ingredient_id] = ingredient;
        state.ingredientIds.push(ingredient.ingredient_id);
      });
    }),
    
    addIngredient: (ingredient) => set((state) => {
      if (!state.ingredientsById[ingredient.ingredient_id]) {
        state.ingredientIds.push(ingredient.ingredient_id);
      }
      state.ingredientsById[ingredient.ingredient_id] = ingredient;
    }),
    
    updateIngredient: (ingredientId, updatedIngredient) => set((state) => {
      if (state.ingredientsById[ingredientId]) {
        state.ingredientsById[ingredientId] = {
          ...state.ingredientsById[ingredientId],
          ...updatedIngredient
        };
      }
    }),
    
    removeIngredient: (ingredientId) => set((state) => {
      if (state.ingredientsById[ingredientId]) {
        delete state.ingredientsById[ingredientId];
        state.ingredientIds = state.ingredientIds.filter(id => id !== ingredientId);
      }
    }),
    
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),
    
    setError: (error) => set((state) => {
      state.error = error;
    }),
    
    // Selectors
    getIngredientById: (id) => get().ingredientsById[id],
    
    getAllIngredients: () => {
      const { ingredientsById, ingredientIds } = get();
      return ingredientIds.map(id => ingredientsById[id]);
    },
    
    getIngredientsByName: (name) => {
      const { ingredientsById, ingredientIds } = get();
      return ingredientIds
        .map(id => ingredientsById[id])
        .filter(ingredient => ingredient.name.toLowerCase().includes(name.toLowerCase()));
    }
  }))
);

export default useIngredientStore; 