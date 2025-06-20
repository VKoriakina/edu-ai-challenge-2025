const { transcribeAudio, summarizeText, analyzeText } = require('./index.js');

// Mock test data
const mockTranscriptionText = `
Welcome to our quarterly business review meeting. Today we'll be discussing customer onboarding processes, 
our Q4 roadmap, and AI integration strategies. The customer onboarding team has made significant progress 
in streamlining our processes. We've reduced onboarding time by 30% through automation. 

Our Q4 roadmap includes three major initiatives: enhancing our AI integration capabilities, 
improving customer onboarding workflows, and expanding our product portfolio. The AI integration 
project is particularly exciting as we're implementing machine learning algorithms to personalize 
customer experiences. 

Customer onboarding remains our top priority. We've identified key pain points and developed 
solutions to address them. The Q4 roadmap also includes upgrading our customer support infrastructure 
and implementing new AI integration features. 

In terms of AI integration, we're exploring opportunities in predictive analytics, automated 
customer service, and intelligent recommendation systems. These AI integration efforts will 
significantly enhance our platform's capabilities and improve customer satisfaction.

Thank you for your attention during this customer onboarding and Q4 roadmap discussion.
`;

async function testApplication() {
  console.log('🧪 Testing application functions...\n');
  
  try {
    // Test summarization
    console.log('Testing summarization...');
    const summary = await summarizeText(mockTranscriptionText);
    console.log('✅ Summary generated successfully');
    console.log('Summary preview:', summary.substring(0, 100) + '...\n');
    
    // Test analytics
    console.log('Testing analytics...');
    const analytics = await analyzeText(mockTranscriptionText);
    console.log('✅ Analytics generated successfully');
    console.log('Analytics:', JSON.stringify(analytics, null, 2));
    
    // Validate analytics format
    if (analytics.word_count && 
        analytics.speaking_speed_wpm && 
        analytics.frequently_mentioned_topics && 
        Array.isArray(analytics.frequently_mentioned_topics)) {
      console.log('✅ Analytics format is correct');
    } else {
      console.log('❌ Analytics format is incorrect');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testApplication();
} 