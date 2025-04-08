'use client';

import React, { useState, useEffect } from 'react';
import { useRecipes } from '@/lib/websocket/socketContext';
import { useRecipes as useRecipesAPI } from '@/lib/api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecipeList() {
  // Get recipes from both API and WebSocket
  const { recipes: apiRecipes, isLoading } = useRecipesAPI();
  const websocketRecipes = useRecipes();
  
  // Use WebSocket data if available, otherwise fall back to API data
  const recipes = websocketRecipes.length > 0 ? websocketRecipes : apiRecipes;
  
  if (isLoading && recipes.length === 0) {
    return <div>Loading recipes...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recipes (Real-time Updates)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <Card key={recipe.recipe_id} className="h-full">
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div>
                  <p className="text-xs font-medium">Price</p>
                  <p className="font-bold">${recipe.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium">Calories</p>
                  <p className="font-bold">{recipe.calories}</p>
                </div>
                <div>
                  <p className="text-xs font-medium">Protein</p>
                  <p className="font-bold">{recipe.protein}g</p>
                </div>
                <div>
                  <p className="text-xs font-medium">Carbs</p>
                  <p className="font-bold">{recipe.carbs}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {recipes.length === 0 && (
          <p className="text-gray-500 col-span-full">No recipes available</p>
        )}
      </div>
    </div>
  );
} 