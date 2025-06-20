# Task 11 - Transcribe and Summarize Audio

A console application that transcribes audio files using OpenAI's Whisper API, generates summaries, and extracts meaningful analytics.

## Features

- 🎵 **Audio Transcription**: Uses OpenAI's `whisper-1` model for high-quality speech-to-text
- 📝 **Intelligent Summarization**: Creates concise summaries using GPT-4
- 📊 **Analytics Extraction**: Calculates word count, speaking speed (WPM), and identifies frequently mentioned topics
- 💾 **File Management**: Saves transcriptions with timestamps, summaries, and analytics in structured formats
- 🔒 **Secure**: API key handling via environment variables

## Requirements

- Node.js (v14 or higher)
- OpenAI API key
- Audio file (supports common formats: mp3, wav, m4a, etc.)

## Installation

1. **Clone the repository and navigate to task 11**:
   ```bash
   cd 11/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your OpenAI API key**:
   ```bash
   export OPENAI_API_KEY='your-api-key-here'
   ```
   
   **Alternative**: Create a `.env` file (NOT recommended for GitHub):
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

## Usage

### Basic Usage
```bash
node index.js <path-to-audio-file>
```

### Examples
```bash
# Transcribe a local audio file
node index.js ./audio/sample.mp3

# Transcribe audio from another directory
node index.js /path/to/your/audio/file.wav
```

## Output Files

The application creates the following files:

1. **`transcription_[timestamp].md`** - Full transcription with metadata
2. **`summary.md`** - Concise summary of the audio content
3. **`analysis.json`** - Analytics in the following format:

```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}
```

## Console Output

The application displays:
- 🎵 Transcription progress
- 📝 Summary generation status
- 📊 Analytics processing
- 💾 File saving confirmations
- 📋 Final summary in console
- 📊 Analytics results in console

## Error Handling

The application handles common errors:
- Missing audio file
- Invalid file path
- Missing API key
- API rate limits
- Network connectivity issues

## Supported Audio Formats

The Whisper API supports various audio formats:
- MP3
- WAV  
- M4A
- FLAC
- And more...

## API Usage

This application makes calls to:
- **OpenAI Whisper API** (`whisper-1` model) for transcription
- **OpenAI Chat Completions API** (`gpt-4` model) for summarization and analytics

## Security Notes

- ⚠️ **Never commit your API key to version control**
- Use environment variables for API key storage
- The `.env` file (if used) should be added to `.gitignore`

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY environment variable is required"**
   - Set your API key: `export OPENAI_API_KEY='your-key'`

2. **"Audio file not found"**
   - Check the file path is correct
   - Ensure the file exists

3. **API errors**
   - Verify your API key is valid
   - Check your OpenAI account has credits
   - Ensure you have access to the required models

4. **Large audio files**
   - Whisper API has file size limits (25MB)
   - Consider splitting longer audio files

## Development

### Testing
```bash
npm test
```

### Running in development mode
```bash
npm run dev <audio-file-path>
```

## License

MIT License 