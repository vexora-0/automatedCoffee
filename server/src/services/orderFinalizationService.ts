import { v4 as uuidv4 } from 'uuid';
import RecipeIngredient from '../models/RecipeIngredient';
import MachineIngredientInventory from '../models/MachineIngredientInventory';
import Warning from '../models/Warning';
import Machine from '../models/Machine';
import Recipe from '../models/Recipe';
import websocketService from './websocketService';

type FinalizableOrder = {
  order_id: string;
  machine_id: string;
  recipe_id: string;
  bill?: number;
};

/**
 * Apply post-completion side effects for an order:
 * - Deduct machine inventory based on recipe ingredients
 * - Raise low-inventory warnings
 * - Increment machine revenue
 * - Emit recipe availability updates for the machine
 */
export const finalizeOrderAndUpdateInventory = async (
  order: FinalizableOrder
): Promise<void> => {
  if (!order?.machine_id || !order?.recipe_id) return;

  // 1) Deduct inventory for all ingredients in the recipe
  const recipeIngredients = await RecipeIngredient.find({
    recipe_id: order.recipe_id,
  }).lean();
  const machineInventory = await MachineIngredientInventory.find({
    machine_id: order.machine_id,
  });

  for (const recipeIngredient of recipeIngredients) {
    const inventoryItem = machineInventory.find(
      (item) => item.ingredient_id === recipeIngredient.ingredient_id
    );

    if (inventoryItem) {
      const newQuantity = inventoryItem.quantity - recipeIngredient.quantity;

      await MachineIngredientInventory.findOneAndUpdate(
        { id: inventoryItem.id },
        { quantity: newQuantity, updated_at: new Date() }
      );

      // If inventory is low after the order, create a warning
      if (newQuantity <= 10) {
        await Warning.create({
          warning_id: uuidv4(),
          machine_id: order.machine_id,
          type: 'dispenser_level',
          severity: newQuantity <= 5 ? 'critical' : 'high',
          message: `Ingredient ID ${recipeIngredient.ingredient_id} is running low (${newQuantity} remaining)`,
          status: 'active',
          created_at: new Date(),
        });
      }
    }
  }

  // 2) Increment machine revenue
  if (typeof order.bill === 'number') {
    await Machine.findOneAndUpdate(
      { machine_id: order.machine_id },
      { $inc: { revenue_total: order.bill } }
    );
  }

  // 3) Emit recipe availability update after inventory change
  const recipes = await Recipe.find({}).lean();
  const allRecipeIngredients = await RecipeIngredient.find({}).lean();
  const updatedInventory = await MachineIngredientInventory.find({
    machine_id: order.machine_id,
  }).lean();

  const inventoryMap: Record<string, number> = {};
  updatedInventory.forEach((item) => {
    inventoryMap[item.ingredient_id] = item.quantity;
  });

  const recipeIngredientMap: Record<
    string,
    Array<{ ingredient_id: string; quantity: number }>
  > = {};
  allRecipeIngredients.forEach((ri) => {
    if (!recipeIngredientMap[ri.recipe_id]) recipeIngredientMap[ri.recipe_id] = [];
    recipeIngredientMap[ri.recipe_id].push({
      ingredient_id: ri.ingredient_id,
      quantity: ri.quantity,
    });
  });

  const availableRecipes = [];
  const unavailableRecipes = [];
  const missingIngredientsByRecipe: Record<string, string[]> = {};

  for (const recipe of recipes) {
    const ingredients = recipeIngredientMap[recipe.recipe_id] || [];
    const missing = [];
    for (const ri of ingredients) {
      if (!inventoryMap[ri.ingredient_id] || inventoryMap[ri.ingredient_id] < ri.quantity) {
        missing.push(ri.ingredient_id);
      }
    }
    if (missing.length === 0) {
      availableRecipes.push(recipe);
    } else {
      unavailableRecipes.push(recipe);
      missingIngredientsByRecipe[recipe.recipe_id] = missing;
    }
  }

  websocketService.emitRecipeAvailabilityUpdate(order.machine_id, {
    availableRecipes,
    unavailableRecipes,
    missingIngredientsByRecipe,
  });
};

