#!/usr/bin/env node

// Service Analyzer CLI
// Usage: node service_analyzer.js

const readline = require('readline');
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY not set. Please provide it in your environment or .env file.');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Few-shot example for the prompt
const FEW_SHOT_EXAMPLES = `
Input: Spotify
Output:
## Brief History
Founded in 2006 in Sweden, Spotify launched its music streaming service in 2008. It quickly became a global leader in music streaming, reaching over 400 million users by 2022. Key milestones include the launch of Spotify Free, expansion to podcasts, and its IPO in 2018.

## Target Audience
Music listeners worldwide, including casual listeners, music enthusiasts, and podcast fans.

## Core Features
- On-demand music streaming
- Curated playlists and personalized recommendations
- Podcast streaming
- Offline listening

## Unique Selling Points
- Extensive music and podcast library
- Personalized playlists (e.g., Discover Weekly)
- Free ad-supported tier

## Business Model
Freemium: free ad-supported tier and paid premium subscriptions.

## Tech Stack Insights
Uses cloud infrastructure, data analytics, machine learning for recommendations, and mobile/web apps.

## Perceived Strengths
- Large content library
- Strong personalization
- Cross-platform availability

## Perceived Weaknesses
- Free tier has ads
- Some content region-locked

---
Input: Our platform helps creators monetize content by offering subscription tools and analytics.
Output:
## Brief History
Founded in the 2020s, the platform was created to empower digital creators to earn revenue directly from their audience. It has evolved to include analytics and community features.

## Target Audience
Independent creators, influencers, and digital entrepreneurs seeking to monetize their content.

## Core Features
- Subscription management
- Analytics dashboard
- Community engagement tools
- Payment processing

## Unique Selling Points
- Focus on creator empowerment
- Integrated analytics
- Flexible subscription options

## Business Model
Takes a percentage of creator earnings and/or charges a subscription fee for premium features.

## Tech Stack Insights
Likely uses cloud services, payment gateways, and analytics platforms. Web and mobile interfaces.

## Perceived Strengths
- Empowers creators
- Transparent earnings
- Useful analytics

## Perceived Weaknesses
- Platform fees
- Competition from larger platforms
`;

// Build the prompt for the OpenAI API
function buildPrompt(userInput) {
  return `${FEW_SHOT_EXAMPLES}\nInput: ${userInput}\nOutput:`;
}

// Call OpenAI API to get the markdown report
async function getReport(userInput) {
  const prompt = buildPrompt(userInput);
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a helpful analyst that generates structured markdown reports about digital services. Always use the required sections and markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 900,
        temperature: 0.4
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const markdown = response.data.choices[0].message.content.trim();
    return markdown;
  } catch (err) {
    if (err.response) {
      console.error('OpenAI API error:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    return null;
  }
}

// Prompt user for input
rl.question('Enter a service name or description: ', async (input) => {
  console.log('\nAnalyzing... Please wait.');
  const report = await getReport(input);
  if (report) {
    console.log('\n--- Service Analysis Report ---\n');
    console.log(report);
  } else {
    console.log('Failed to generate report.');
  }
  rl.close();
}); 