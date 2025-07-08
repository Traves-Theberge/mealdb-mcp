#!/usr/bin/env node

/**
 * MealDB MCP Server
 * 
 * A Model Context Protocol server for TheMealDB API.
 * Provides access to recipe search, meal details, categories, and ingredients.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

/**
 * Helper function to make API calls to TheMealDB
 */
async function fetchMealDB(endpoint: string) {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch from MealDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to extract ingredients and measurements from a meal object
 */
function extractIngredients(meal: any): string[] {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure?.trim() || ""} ${ingredient.trim()}`.trim());
    }
  }
  return ingredients;
}

// Create an MCP server
const server = new Server(
  {
    name: "mealdb-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_meals",
        description: "Search for meals by name",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Name of the meal to search for"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_meal_details",
        description: "Get detailed information about a specific meal by ID",
        inputSchema: {
          type: "object",
          properties: {
            mealId: {
              type: "string",
              description: "The ID of the meal to get details for"
            }
          },
          required: ["mealId"]
        }
      },
      {
        name: "get_random_meal",
        description: "Get a random meal suggestion",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: "list_categories",
        description: "Get all meal categories",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: "search_by_ingredient",
        description: "Find meals that contain a specific ingredient",
        inputSchema: {
          type: "object",
          properties: {
            ingredient: {
              type: "string",
              description: "Name of the ingredient to search for"
            }
          },
          required: ["ingredient"]
        }
      }
    ]
  };
});

/**
 * Handler for tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  try {
    switch (request.params.name) {
      case "search_meals": {
        const query = String(request.params.arguments?.query);
        if (!query) {
          throw new Error("Query parameter is required");
        }

        const data = await fetchMealDB(`/search.php?s=${encodeURIComponent(query)}`);
        
        if (!data.meals || data.meals.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No meals found for "${query}"`
            }]
          };
        }

        const results = data.meals.slice(0, 10).map((meal: any) => ({
          id: meal.idMeal,
          name: meal.strMeal,
          category: meal.strCategory,
          area: meal.strArea,
          thumbnail: meal.strMealThumb,
          tags: meal.strTags || "No tags"
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              message: `Found ${data.meals.length} meals for "${query}"`,
              results: results
            }, null, 2)
          }]
        };
      }

      case "get_meal_details": {
        const mealId = String(request.params.arguments?.mealId);
        if (!mealId) {
          throw new Error("Meal ID is required");
        }

        const data = await fetchMealDB(`/lookup.php?i=${mealId}`);
        
        if (!data.meals || data.meals.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No meal found with ID: ${mealId}`
            }]
          };
        }

        const meal = data.meals[0];
        const ingredients = extractIngredients(meal);

        const mealDetails = {
          id: meal.idMeal,
          name: meal.strMeal,
          category: meal.strCategory,
          area: meal.strArea,
          instructions: meal.strInstructions,
          thumbnail: meal.strMealThumb,
          tags: meal.strTags || "No tags",
          youtube: meal.strYoutube || "No video available",
          ingredients: ingredients
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              message: `Meal details for "${meal.strMeal}"`,
              meal: mealDetails
            }, null, 2)
          }]
        };
      }

      case "get_random_meal": {
        const data = await fetchMealDB("/random.php");
        
        if (!data.meals || data.meals.length === 0) {
          return {
            content: [{
              type: "text",
              text: "No random meal found"
            }]
          };
        }

        const meal = data.meals[0];
        const ingredients = extractIngredients(meal);

        const randomMeal = {
          id: meal.idMeal,
          name: meal.strMeal,
          category: meal.strCategory,
          area: meal.strArea,
          instructions: meal.strInstructions,
          thumbnail: meal.strMealThumb,
          tags: meal.strTags || "No tags",
          youtube: meal.strYoutube || "No video available",
          ingredients: ingredients
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              message: `Random meal suggestion: "${meal.strMeal}"`,
              meal: randomMeal
            }, null, 2)
          }]
        };
      }

      case "list_categories": {
        const data = await fetchMealDB("/categories.php");
        
        const categories = data.categories.map((cat: any) => ({
          id: cat.idCategory,
          name: cat.strCategory,
          description: cat.strCategoryDescription.substring(0, 100) + "...",
          thumbnail: cat.strCategoryThumb
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              message: `Found ${categories.length} meal categories`,
              categories: categories
            }, null, 2)
          }]
        };
      }

      case "search_by_ingredient": {
        const ingredient = String(request.params.arguments?.ingredient);
        if (!ingredient) {
          throw new Error("Ingredient parameter is required");
        }

        const data = await fetchMealDB(`/filter.php?i=${encodeURIComponent(ingredient)}`);
        
        if (!data.meals || data.meals.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No meals found containing "${ingredient}"`
            }]
          };
        }

        const results = data.meals.slice(0, 15).map((meal: any) => ({
          id: meal.idMeal,
          name: meal.strMeal,
          thumbnail: meal.strMealThumb
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              message: `Found ${data.meals.length} meals containing "${ingredient}"`,
              results: results,
              note: "Use get_meal_details with the meal ID to get full recipe details"
            }, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }],
      isError: true
    };
  }
});

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
}); 