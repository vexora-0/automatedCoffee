import mongoose from 'mongoose';
import { populateMockData } from '../utils/mockData';
import { populateMockIngredients } from '../utils/mockIngredients';
import { createRecipeIngredients } from '../utils/mockRecipeIngredients';
import { populateCategories } from '../utils/mockCategories';
import { populateMachines } from '../utils/mockMachines';
import { createMachineInventory } from '../utils/mockMachineInventory';
import Recipe from '../models/Recipe';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/automatedCoffee');
    console.log('Connected to MongoDB');
    
    // First populate categories
    const categories = await populateCategories();
    
    // Then populate ingredients
    const ingredients = await populateMockIngredients();
    
    // Then populate recipes with correct category IDs
    await populateMockData(categories);
    
    // Get all recipes
    const recipes = await Recipe.find({});
    if (recipes.length === 0) {
      throw new Error('No recipes found');
    }
    
    // Create recipe-ingredient mappings
    await createRecipeIngredients(recipes, ingredients);
    
    // Create test machine
    const machines = await populateMachines();
    
    // Create machine inventory
    await createMachineInventory(machines[0].machine_id, ingredients);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run(); 