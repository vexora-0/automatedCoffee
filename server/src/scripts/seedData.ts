import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../models/Recipe';
import Ingredient from '../models/Ingredient';
import RecipeIngredient from '../models/RecipeIngredient';
import RecipeCategory from '../models/RecipeCategory';
import MachineIngredientInventory from '../models/MachineIngredientInventory';
import Machine from '../models/Machine';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee-app')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Ingredient data with consistent IDs
const ingredients = [
  {
    ingredient_id: "fb0e6156-b2f6-4593-9be0-d88af44b76a3",
    name: "coffee",
    unit: "ml"
  },
  {
    ingredient_id: "11921656-9630-401d-b4f3-9db7c30111de",
    name: "milk",
    unit: "ml"
  },
  {
    ingredient_id: "0547ee94-a5f8-4402-ada0-52156b89e4dc",
    name: "tea",
    unit: "ml"
  },
  {
    ingredient_id: "1f4ef847-6208-4e99-83bd-2227b0601c62",
    name: "water",
    unit: "ml"
  }
];

// Recipe categories
const categories = [
  {
    category_id: "322bff53-0db6-493d-866f-4976448448dd",
    name: "Coffee"
  },
  {
    category_id: "f231e02a-41c0-4f61-a68d-d9072c1fa8f0",
    name: "Tea"
  },
  {
    category_id: "037d7af2-5c91-443d-8764-b45763539780",
    name: "Other"
  }
];

// Recipe data
const recipes = [
  {
    recipe_id: "e094bb6a-ad8a-4899-8602-dffbb03a6adf",
    name: "Regular Coffee",
    description: "Filter Coffee Decoction – 25% (30ml)\nHot Milk – 75% (90ml)\nAuthenticity – 100% (120ml)\nFrothed to Perfection!",
    category_id: "322bff53-0db6-493d-866f-4976448448dd",
    price: 10,
    image_url: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Regular_Coffee_u1u5bw.webp",
    image: {
      cdnUrl: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Regular_Coffee_u1u5bw.webp",
      publicId: "Copy_of_Regular_Coffee_u1u5bw",
      width: 800,
      height: 800,
      format: "webp",
      provider: "cloudinary"
    },
    calories: 139,
    protein: 3,
    carbs: 18,
    fat: 5,
    sugar: 7
  },
  {
    recipe_id: "290afeba-9f04-46e1-bd67-718e8ad973d4",
    name: "Regular Tea",
    description: "Tea Decoction – 25% (30ml)\nHot Milk – 75% (90ml)\nComfort – 100% (120ml)\nSmooth, Mellow, and Just Right!",
    category_id: "f231e02a-41c0-4f61-a68d-d9072c1fa8f0",
    price: 10,
    image_url: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
    image: {
      cdnUrl: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
      publicId: "Copy_of_Black_Coffee_okqice",
      width: 800,
      height: 800,
      format: "webp",
      provider: "cloudinary"
    },
    calories: 129,
    protein: 4,
    carbs: 16,
    fat: 2,
    sugar: 8
  },
  {
    recipe_id: "1b6261a8-85ae-49cd-9a73-041d0ea75b6d",
    name: "Plain Milk",
    description: "Hot Milk – 100% (120ml)\nWholesomeness – 100% (120ml)\nSmooth, Creamy, and Comforting!",
    category_id: "037d7af2-5c91-443d-8764-b45763539780",
    price: 10,
    image_url: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
    image: {
      cdnUrl: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
      publicId: "Copy_of_Black_Coffee_okqice",
      width: 800,
      height: 800,
      format: "webp",
      provider: "cloudinary"
    },
    calories: 114,
    protein: 4,
    carbs: 24,
    fat: 2,
    sugar: 8
  },
  {
    recipe_id: "93da2dd0-6b3a-4f12-8bf7-c7a43df9619b",
    name: "Strong Coffee",
    description: "Filter Coffee Decoction – 40% (48ml)\nHot Milk – 60% (72ml)\nBoldness – 100% (120ml)\nStrong, Frothy, and Uncompromised!",
    category_id: "322bff53-0db6-493d-866f-4976448448dd",
    price: 12,
    image_url: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
    image: {
      cdnUrl: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
      publicId: "Copy_of_Black_Coffee_okqice",
      width: 800,
      height: 800,
      format: "webp",
      provider: "cloudinary"
    },
    calories: 150,
    protein: 3,
    carbs: 20,
    fat: 6,
    sugar: 8
  },
  {
    recipe_id: "3f724ad0-7eeb-4591-9b8c-e22a72fb0c7a",
    name: "Black Coffee",
    description: "Filter Coffee Decoction – 50% (60ml)\nHot Water – 50% (60ml)\nPurity – 100% (120ml)\nNo Milk, No Fuss, Just Bold Flavor!",
    category_id: "322bff53-0db6-493d-866f-4976448448dd",
    price: 8,
    image_url: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
    image: {
      cdnUrl: "https://res.cloudinary.com/dqffksfw8/image/upload/v1744193464/Copy_of_Black_Coffee_okqice.webp",
      publicId: "Copy_of_Black_Coffee_okqice",
      width: 800,
      height: 800,
      format: "webp",
      provider: "cloudinary"
    },
    calories: 90,
    protein: 1,
    carbs: 10,
    fat: 1,
    sugar: 2
  }
];

// Recipe ingredients with consistent IDs matching both recipe and ingredient collections
const recipeIngredients = [
  // Regular Coffee
  {
    id: uuidv4(),
    recipe_id: "e094bb6a-ad8a-4899-8602-dffbb03a6adf",
    ingredient_id: "fb0e6156-b2f6-4593-9be0-d88af44b76a3", // coffee
    quantity: 30
  },
  {
    id: uuidv4(),
    recipe_id: "e094bb6a-ad8a-4899-8602-dffbb03a6adf",
    ingredient_id: "11921656-9630-401d-b4f3-9db7c30111de", // milk
    quantity: 90
  },
  
  // Regular Tea
  {
    id: uuidv4(),
    recipe_id: "290afeba-9f04-46e1-bd67-718e8ad973d4",
    ingredient_id: "0547ee94-a5f8-4402-ada0-52156b89e4dc", // tea
    quantity: 30
  },
  {
    id: uuidv4(),
    recipe_id: "290afeba-9f04-46e1-bd67-718e8ad973d4",
    ingredient_id: "11921656-9630-401d-b4f3-9db7c30111de", // milk
    quantity: 90
  },
  
  // Plain Milk
  {
    id: uuidv4(),
    recipe_id: "1b6261a8-85ae-49cd-9a73-041d0ea75b6d",
    ingredient_id: "11921656-9630-401d-b4f3-9db7c30111de", // milk
    quantity: 120
  },
  
  // Strong Coffee
  {
    id: uuidv4(),
    recipe_id: "93da2dd0-6b3a-4f12-8bf7-c7a43df9619b",
    ingredient_id: "fb0e6156-b2f6-4593-9be0-d88af44b76a3", // coffee
    quantity: 48
  },
  {
    id: uuidv4(),
    recipe_id: "93da2dd0-6b3a-4f12-8bf7-c7a43df9619b",
    ingredient_id: "11921656-9630-401d-b4f3-9db7c30111de", // milk
    quantity: 72
  },
  
  // Black Coffee
  {
    id: uuidv4(),
    recipe_id: "3f724ad0-7eeb-4591-9b8c-e22a72fb0c7a",
    ingredient_id: "fb0e6156-b2f6-4593-9be0-d88af44b76a3", // coffee
    quantity: 60
  },
  {
    id: uuidv4(),
    recipe_id: "3f724ad0-7eeb-4591-9b8c-e22a72fb0c7a",
    ingredient_id: "1f4ef847-6208-4e99-83bd-2227b0601c62", // water
    quantity: 60
  }
];

// Machine data
const machine = {
  machine_id: "1",
  name: "Coffee Machine 1",
  status: "active",
  location: "Main Floor",
  temperature: 80,
  temperature_c: 80,
  cleaning_water_ml: 500,
  last_regular_service: new Date(),
  last_deep_service: new Date(),
  last_maintenance_date: new Date()
};

// Machine inventory with matching ingredient IDs
const machineInventory = ingredients.map(ingredient => ({
  id: uuidv4(),
  machine_id: "1",
  ingredient_id: ingredient.ingredient_id,
  quantity: 1000, // All ingredients available with 1000ml
  updated_at: new Date()
}));

// Clear existing data and seed new data
async function seedData() {
  try {
    // Clear existing data
    await Recipe.deleteMany({});
    await Ingredient.deleteMany({});
    await RecipeIngredient.deleteMany({});
    await RecipeCategory.deleteMany({});
    await MachineIngredientInventory.deleteMany({});
    await Machine.deleteMany({});

    console.log('Cleared existing data');

    // Insert categories
    await RecipeCategory.insertMany(categories);
    console.log(`Inserted ${categories.length} categories`);

    // Insert ingredients
    await Ingredient.insertMany(ingredients);
    console.log(`Inserted ${ingredients.length} ingredients`);

    // Insert recipes
    await Recipe.insertMany(recipes);
    console.log(`Inserted ${recipes.length} recipes`);

    // Insert recipe ingredients
    await RecipeIngredient.insertMany(recipeIngredients);
    console.log(`Inserted ${recipeIngredients.length} recipe ingredients`);

    // Insert machine
    await Machine.create(machine);
    console.log('Inserted machine');

    // Insert machine inventory
    await MachineIngredientInventory.insertMany(machineInventory);
    console.log(`Inserted ${machineInventory.length} machine inventory items`);

    console.log('Data seeding completed successfully');
    
    // Log relationships for debugging
    console.log('\nVerifying relationships:');
    
    // Check a recipe and its ingredients
    const sampleRecipe = recipes[0];
    console.log(`Sample recipe: ${sampleRecipe.name} (${sampleRecipe.recipe_id})`);
    
    const recipeIngs = recipeIngredients.filter(ri => ri.recipe_id === sampleRecipe.recipe_id);
    console.log(`Recipe ingredients: ${recipeIngs.length}`);
    
    for (const ri of recipeIngs) {
      const ingredient = ingredients.find(i => i.ingredient_id === ri.ingredient_id);
      console.log(`- ${ingredient?.name}: ${ri.quantity}${ingredient?.unit}`);
      
      // Check if this ingredient exists in machine inventory
      const inventoryItem = machineInventory.find(mi => mi.ingredient_id === ri.ingredient_id);
      console.log(`  In machine inventory: ${inventoryItem ? 'Yes' : 'No'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 