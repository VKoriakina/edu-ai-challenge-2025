const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Load environment variables from .env file if it exists
try {
  require('dotenv').config();
} catch (error) {
  // dotenv not installed, continue without it
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function transcribeAudio(audioFilePath) {
  try {
    console.log('🎵 Transcribing audio...');
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
    });
    
    console.log('✅ Transcription completed');
    return transcription.text;
  } catch (error) {
    console.error('❌ Error transcribing audio:', error.message);
    throw error;
  }
}

async function summarizeText(text) {
  try {
    console.log('📝 Generating summary...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise, well-structured summaries of transcribed audio content. Focus on key points, main ideas, and important takeaways."
        },
        {
          role: "user",
          content: `Please provide a clear and concise summary of the following transcription:\n\n${text}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });
    
    console.log('✅ Summary generated');
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error generating summary:', error.message);
    throw error;
  }
}

async function analyzeText(text) {
  try {
    console.log('📊 Analyzing text...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an analytics assistant that extracts structured data from transcribed text. You must return valid JSON with word count, speaking speed, and frequently mentioned topics."
        },
        {
          role: "user",
          content: `Analyze the following transcription and return ONLY valid JSON in this exact format:

{
  "word_count": [number],
  "speaking_speed_wpm": [number],
  "frequently_mentioned_topics": [
    { "topic": "[topic name]", "mentions": [number] },
    { "topic": "[topic name]", "mentions": [number] },
    { "topic": "[topic name]", "mentions": [number] }
  ]
}

For speaking speed calculation, assume average speaking pace. For topics, identify the most frequently mentioned concepts, themes, or subjects. Return at least 3 topics.

Transcription: ${text}`
        }
      ],
      max_tokens: 300,
      temperature: 0.1,
    });
    
    console.log('✅ Analysis completed');
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Error analyzing text:', error.message);
    throw error;
  }
}

function saveTranscription(transcription) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `transcription_${timestamp}.md`;
  const filepath = path.join(__dirname, filename);
  
  const content = `# Audio Transcription
  
Generated on: ${new Date().toLocaleString()}

## Transcription

${transcription}
`;
  
  fs.writeFileSync(filepath, content);
  console.log(`📄 Transcription saved to: ${filename}`);
  return filename;
}

function saveSummary(summary) {
  const content = `# Audio Summary

Generated on: ${new Date().toLocaleString()}

## Summary

${summary}
`;
  
  fs.writeFileSync(path.join(__dirname, 'summary.md'), content);
  console.log('📄 Summary saved to: summary.md');
}

function saveAnalysis(analysis) {
  fs.writeFileSync(path.join(__dirname, 'analysis.json'), JSON.stringify(analysis, null, 2));
  console.log('📄 Analysis saved to: analysis.json');
}

async function main() {
  // Check for audio file argument
  const audioFilePath = process.argv[2];
  
  if (!audioFilePath) {
    console.error('❌ Please provide an audio file path as an argument');
    console.log('Usage: node index.js <audio-file-path>');
    process.exit(1);
  }
  
  // Check if file exists
  if (!fs.existsSync(audioFilePath)) {
    console.error(`❌ Audio file not found: ${audioFilePath}`);
    process.exit(1);
  }
  
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    console.log('Please set your OpenAI API key: export OPENAI_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  try {
    console.log(`🚀 Processing audio file: ${audioFilePath}`);
    console.log('=' .repeat(50));
    
    // Step 1: Transcribe audio
    const transcription = await transcribeAudio(audioFilePath);
    
    // Step 2: Generate summary
    const summary = await summarizeText(transcription);
    
    // Step 3: Analyze text
    const analysis = await analyzeText(transcription);
    
    // Step 4: Save files
    console.log('\n💾 Saving results...');
    saveTranscription(transcription);
    saveSummary(summary);
    saveAnalysis(analysis);
    
    // Step 5: Display results
    console.log('\n' + '=' .repeat(50));
    console.log('📋 SUMMARY:');
    console.log(summary);
    
    console.log('\n📊 ANALYTICS:');
    console.log(JSON.stringify(analysis, null, 2));
    
    console.log('\n✅ Process completed successfully!');
    
  } catch (error) {
    console.error('❌ Error processing audio:', error.message);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main();
}

module.exports = { transcribeAudio, summarizeText, analyzeText }; 