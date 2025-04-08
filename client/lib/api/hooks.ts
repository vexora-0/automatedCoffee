import useSWR from 'swr';
import { AxiosError } from 'axios';
import apiClient from './apiClient';
import {
  User,
  UserHistory,
  Machine,
  MachineIngredientInventory,
  Ingredient,
  RecipeCategory,
  Recipe,
  Order,
  Warning,
  ApiResponse
} from './types';

// SWR fetcher function
const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

// ===== USER HOOKS =====
export const useUsers = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<User[]>, AxiosError>(
    '/users',
    fetcher
  );

  return {
    users: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useUser = (userId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<User>, AxiosError>(
    userId ? `/users/${userId}` : null,
    fetcher
  );

  return {
    user: data?.data,
    isLoading,
    isError: error,
    mutate
  };
};

export const useUserHistory = (userId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<any[]>, AxiosError>(
    userId ? `/users/${userId}/history` : null,
    fetcher
  );

  return {
    history: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

// ===== MACHINE HOOKS =====
export const useMachines = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Machine[]>, AxiosError>(
    '/machines',
    fetcher
  );

  return {
    machines: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useMachine = (machineId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Machine>, AxiosError>(
    machineId ? `/machines/${machineId}` : null,
    fetcher
  );

  return {
    machine: data?.data,
    isLoading,
    isError: error,
    mutate
  };
};

export const useMachineInventory = (machineId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<MachineIngredientInventory[]>, AxiosError>(
    machineId ? `/machines/${machineId}/inventory` : null,
    fetcher
  );

  return {
    inventory: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

// ===== INGREDIENT HOOKS =====
export const useIngredients = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Ingredient[]>, AxiosError>(
    '/ingredients',
    fetcher
  );

  return {
    ingredients: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useIngredient = (ingredientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Ingredient>, AxiosError>(
    ingredientId ? `/ingredients/${ingredientId}` : null,
    fetcher
  );

  return {
    ingredient: data?.data,
    isLoading,
    isError: error,
    mutate
  };
};

// ===== RECIPE HOOKS =====
export const useRecipeCategories = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<RecipeCategory[]>, AxiosError>(
    '/recipes/categories',
    fetcher
  );

  return {
    categories: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useRecipes = (categoryId?: string) => {
  const url = categoryId ? `/recipes?category=${categoryId}` : '/recipes';
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Recipe[]>, AxiosError>(
    url,
    fetcher
  );

  return {
    recipes: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useRecipe = (recipeId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Recipe>, AxiosError>(
    recipeId ? `/recipes/${recipeId}` : null,
    fetcher
  );

  return {
    recipe: data?.data,
    isLoading,
    isError: error,
    mutate
  };
};

// ===== ORDER HOOKS =====
export const useOrders = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Order[]>, AxiosError>(
    '/orders',
    fetcher
  );

  return {
    orders: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useOrder = (orderId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Order>, AxiosError>(
    orderId ? `/orders/${orderId}` : null,
    fetcher
  );

  return {
    order: data?.data,
    isLoading,
    isError: error,
    mutate
  };
};

// ===== WARNING HOOKS =====
export const useWarnings = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Warning[]>, AxiosError>(
    '/warnings',
    fetcher
  );

  return {
    warnings: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useWarning = (warningId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Warning>, AxiosError>(
    warningId ? `/warnings/${warningId}` : null,
    fetcher
  );

  return {
    warning: data?.data,
    isLoading,
    isError: error,
    mutate
  };
}; 