#!/usr/bin/env node

// Task 10 - Product Search Based on User Preferences
// Usage: node main.js

const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

// Check for OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY not set. Please provide it in your environment or .env file.');
  process.exit(1);
}

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4.1-mini';

// Load products dataset
let products = [];
try {
  const productsData = fs.readFileSync('./products.json', 'utf8');
  products = JSON.parse(productsData);
} catch (error) {
  console.error('Error loading products.json:', error.message);
  process.exit(1);
}

/**
 * Function schema for OpenAI Function Calling
 */
const searchProductsFunction = {
  name: "search_products",
  description: "Search and filter products based on user preferences. ONLY return products that exactly match criteria. Return empty array if no matches.",
  parameters: {
    type: "object",
    properties: {
      filtered_products: {
        type: "array",
        description: "Array of products that EXACTLY match ALL user criteria. Return empty array if no products match.",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Product name" },
            category: { type: "string", description: "Product category" },
            price: { type: "number", description: "Product price" },
            rating: { type: "number", description: "Product rating" },
            in_stock: { type: "boolean", description: "Whether product is in stock" }
          },
          required: ["name", "category", "price", "rating", "in_stock"]
        }
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of filtering logic and why these specific products were selected or why no products were found"
      }
    },
    required: ["filtered_products", "reasoning"]
  }
};

/**
 * Call OpenAI API with function calling for product search
 * @param {string} userQuery - User's search query in natural language
 * @returns {Object|null} - Filtered products and reasoning or null if error
 */
async function searchProductsWithAI(userQuery) {
  try {
    const systemMessage = `You are a product search assistant. You help users find products from a dataset based on their preferences.

Available products dataset:
${JSON.stringify(products, null, 2)}

STRICT FILTERING RULES:
1. ONLY return products that are in_stock: true UNLESS the user explicitly asks for out-of-stock items
2. If user asks for a specific product that doesn't exist or is out of stock, return an empty array - DO NOT suggest alternatives
3. If user says "only if in stock" or similar - NEVER return out-of-stock items
4. Match products based on exact category and name matching, not loose associations
5. For price criteria: "cheap" = under $50, "under $X" = strictly less than X
6. Apply ALL criteria strictly - product must meet EVERY condition

Your task is to:
1. Analyze the user's natural language query
2. Identify the exact filtering criteria (price range, category, rating, stock status)
3. Apply STRICT filtering - only return products that meet ALL criteria EXACTLY
4. Double-check each product meets ALL conditions before including it
5. If no products match, return empty array with clear explanation
6. DO NOT suggest alternatives unless user asks for recommendations

CRITICAL: Return only products that pass ALL filtering criteria exactly.`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userQuery }
        ],
        functions: [searchProductsFunction],
        function_call: { name: "search_products" },
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const functionCall = response.data.choices[0].message.function_call;
    if (functionCall && functionCall.name === 'search_products') {
      return JSON.parse(functionCall.arguments);
    }
    
    return null;
  } catch (err) {
    if (err.response) {
      console.error('OpenAI API error:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    return null;
  }
}

/**
 * Format and display search results
 * @param {Object} searchResult - Result from AI function call
 */
function displayResults(searchResult) {
  if (!searchResult || !searchResult.filtered_products) {
    console.log('No products found matching your criteria.');
    return;
  }

  const { filtered_products, reasoning } = searchResult;
  
  console.log('\n🔍 Search Results:');
  console.log('='.repeat(50));
  
  if (filtered_products.length === 0) {
    console.log('\nNo products found matching your criteria.');
    
    // Show reasoning even when no results found
    if (reasoning) {
      console.log(`\n💭 Why no results: ${reasoning}`);
    }
    return;
  }

  console.log(`\nFiltered Products (${filtered_products.length} found):`);
  
  filtered_products.forEach((product, index) => {
    const stockStatus = product.in_stock ? 'In Stock' : 'Out of Stock';
    console.log(`${index + 1}. ${product.name} - $${product.price}, Rating: ${product.rating}, ${stockStatus}`);
  });

  if (reasoning) {
    console.log(`\n💭 Search Logic: ${reasoning}`);
  }
}

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Main interactive application
 */
async function main() {
  console.log('🛍️  Product Search Application');
  console.log('='.repeat(50));
  console.log('Welcome! I can help you find products based on your preferences.');
  console.log('You can search using natural language like:');
  console.log('- "I need electronics under $100"');
  console.log('- "Show me fitness products with high ratings"');
  console.log('- "Find books that are in stock and cheap"');
  console.log('- "I want kitchen appliances under $200 with good ratings"');
  console.log('\nType "quit" or "exit" to end the session.\n');

  const rl = createReadlineInterface();

  const askQuestion = () => {
    rl.question('🔍 What are you looking for? ', async (userQuery) => {
      if (userQuery.toLowerCase() === 'quit' || userQuery.toLowerCase() === 'exit') {
        console.log('\n👋 Thank you for using Product Search! Goodbye!');
        rl.close();
        return;
      }

      if (!userQuery.trim()) {
        console.log('Please enter a search query.');
        askQuestion();
        return;
      }

      console.log('\n⏳ Searching products...');
      
      const searchResult = await searchProductsWithAI(userQuery);
      displayResults(searchResult);
      
      console.log('\n' + '-'.repeat(50));
      askQuestion();
    });
  };

  askQuestion();
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { searchProductsWithAI, displayResults }; 