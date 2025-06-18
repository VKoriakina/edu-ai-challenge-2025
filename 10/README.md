# Task 10 Solution - Product Search Based on User Preferences

A sophisticated product search application that uses OpenAI's Function Calling capabilities to filter products based on natural language user preferences.

## Overview

This application demonstrates advanced AI integration by using OpenAI's function calling feature to:
- Parse natural language search queries
- Apply intelligent filtering logic
- Search through a product dataset
- Return structured, formatted results

Instead of hardcoded filtering rules, the AI model dynamically interprets user preferences and applies appropriate search criteria.

## Requirements

- Node.js (v14+ recommended)
- npm
- OpenAI API key

## Installation

1. **Clone and navigate to the project:**
   ```bash
   cd 10
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your OpenAI API key:**
   Create a `.env` file in the `10` directory:
   ```bash
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```
   
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Usage

**Start the application:**
```bash
node main.js
```

The application will launch an interactive console where you can enter natural language search queries.

### Example Queries

You can search using natural language expressions like:

- `"I need electronics under $100"`
- `"Show me fitness products with high ratings"`
- `"Find books that are in stock and cheap"`
- `"I want kitchen appliances under $200 with good ratings"`
- `"Show me out of stock items"`
- `"Find products with rating above 4.5"`

### Commands

- Enter any natural language search query to find products
- Type `quit` or `exit` to end the session

## How It Works

### AI Function Calling

The application uses OpenAI's function calling feature with a defined schema:

```javascript
const searchProductsFunction = {
  name: "search_products",
  description: "Search and filter products based on user preferences",
  parameters: {
    // Structured schema for product filtering
  }
}
```

### Process Flow

1. **User Input**: Natural language query entered via console
2. **AI Processing**: OpenAI model analyzes the query and dataset
3. **Function Calling**: Model invokes the search function with structured parameters
4. **Results**: Filtered products returned in organized format

### No Manual Filtering

The application deliberately avoids hardcoded filtering logic. All product selection is performed by the AI model using function calling, demonstrating the power of letting AI handle complex reasoning tasks.

## Environment Variables

Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Security Notes

- **Never commit your `.env` file to git**
- The `.env` file is already included in `.gitignore`
- **Never share or commit your OpenAI API key**
- Keep your API key secure and rotate it periodically

## Dataset

The application uses `products.json` containing 50 diverse products across categories:
- **Electronics**: Headphones, laptops, smartphones, etc.
- **Fitness**: Yoga mats, treadmills, dumbbells, etc.
- **Kitchen**: Blenders, air fryers, coffee makers, etc.
- **Books**: Novels, guides, cookbooks, etc.
- **Clothing**: Shirts, dresses, shoes, etc.

Each product includes: name, category, price, rating, and stock status.

## Output Format

Results are displayed in a user-friendly format:

```
🔍 Search Results:
==================================================

Filtered Products (X found):
1. Product Name - $XX.XX, Rating: X.X, In Stock/Out of Stock
2. Product Name - $XX.XX, Rating: X.X, In Stock/Out of Stock

💭 Search Logic: [AI explanation of filtering criteria]
```

## Technical Features

- **OpenAI Function Calling**: Advanced AI integration
- **Natural Language Processing**: Flexible query interpretation
- **Interactive Console**: User-friendly command-line interface
- **Structured Output**: Clear, formatted results
- **Error Handling**: Robust API failure management
- **Secure Configuration**: Environment-based API key management

## Files Structure

```
10/
├── main.js              # Main application logic
├── products.json        # Product dataset
├── package.json         # Dependencies and scripts
├── README.md           # This file
├── sample_outputs.md   # Example application runs
└── .env               # API key (create this file)
```

## Troubleshooting

**"OPENAI_API_KEY not set" error:**
- Ensure your `.env` file exists in the `10` directory
- Check that your API key is correctly formatted
- Verify the `.env` file contains: `OPENAI_API_KEY=sk-...`

**"Error loading products.json" error:**
- Ensure `products.json` exists in the `10` directory
- Check that the JSON file is properly formatted

**OpenAI API errors:**
- Verify your API key is valid and has sufficient credits
- Check your internet connection
- Ensure you're using a supported model

## API Usage

This application uses:
- **Model**: `gpt-4.1-mini`
- **Feature**: Function Calling
- **Temperature**: 0.1 (for consistent results)

## Contributing

This is a challenge submission, but feel free to explore and modify the code to learn more about OpenAI function calling! 