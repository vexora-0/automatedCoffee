# Recipe and Inventory Seeding

This script sets up test data for the coffee machine application with properly connected recipes and ingredients.

## Usage

To run the seeding script:

```bash
npm run seed
```

This will:
1. Clear existing data in the database
2. Create categories, ingredients, recipes, and recipe ingredients
3. Set up a machine with inventory
4. Ensure all IDs match correctly between collections

## Data Structure

The script ensures that all relational data matches between collections:

### Ingredients

The following ingredient IDs are used consistently:
- Coffee (`fb0e6156-b2f6-4593-9be0-d88af44b76a3`)
- Milk (`11921656-9630-401d-b4f3-9db7c30111de`)
- Tea (`0547ee94-a5f8-4402-ada0-52156b89e4dc`)
- Water (`1f4ef847-6208-4e99-83bd-2227b0601c62`)

### Recipes

Sample recipes that are configured:
- Regular Coffee
- Regular Tea
- Plain Milk
- Strong Coffee
- Black Coffee

Each recipe is connected to its required ingredients with appropriate quantities.

### Machine Inventory

The machine inventory contains all ingredients with sufficient quantities (1000ml each).

## Troubleshooting

If recipes still show as unavailable after running the seed script, check:

1. **WebSocket Connection**: Ensure the WebSocket is properly connected and receiving inventory updates.

2. **Console Logging**: Look for logs that show recipe availability computation:
   ```
   [RecipeAvail] Computing availability for machine: 1
   ```

3. **Ingredient Matching**: Verify that the client is using the exact same ingredient IDs when checking availability.

## Recipe-Ingredient Relationships

Here's how recipes are connected to ingredients:

- **Regular Coffee**:
  - Coffee: 30ml
  - Milk: 90ml

- **Regular Tea**:
  - Tea: 30ml
  - Milk: 90ml

- **Plain Milk**:
  - Milk: 120ml

- **Strong Coffee**:
  - Coffee: 48ml
  - Milk: 72ml

- **Black Coffee**:
  - Coffee: 60ml
  - Water: 60ml 