# Progenics AI - Genomics Chat Application

A comprehensive genomics chat application with voice input/output, multi-language support, and integration with Ollama (Gemma model) and genomics APIs.

## Features

- **Chat Interface**: Text-based messaging with genomics context
- **Voice Input**: Speech-to-text for hands-free queries
- **Voice Output**: Text-to-speech for bot responses
- **Multi-Language Support**: English, Spanish, and French
- **Ollama Integration**: Local LLM (Gemma model) for intelligent responses
- **Genomics API Integration**: Fetch variants, diseases, and diagnostic tests
- **Settings Panel**: Configure API endpoints and voice preferences
- **Chat History**: Track recent conversations

## Prerequisites

### 1. Ollama Setup

Install Ollama and pull the Gemma model:

```bash
# Install Ollama from https://ollama.ai

# Pull the Gemma model
ollama pull gemma

# Start Ollama server (runs on http://localhost:11434 by default)
ollama serve
```

### 2. Genomics API

You need to set up a genomics API server that provides the following endpoints:

```
GET /api/health - Health check
GET /api/variants/search?q=query - Search variants
GET /api/diseases/search?q=query - Search diseases
GET /api/tests/search?q=query - Search diagnostic tests
GET /api/variants/{id} - Get variant details
GET /api/diseases/{id} - Get disease details
GET /api/tests/{id} - Get test details
GET /api/associations/variant/{id} - Get variant-disease associations
GET /api/diseases/{id}/tests - Get tests for a disease
```

**Example API Response Format:**

```json
{
  "variants": [
    {
      "id": "BRCA1_c.68_69delAG",
      "gene": "BRCA1",
      "hgvs": "c.68_69delAG",
      "pathogenicity": "Pathogenic",
      "frequency": 0.0001,
      "inheritance": "Autosomal Dominant",
      "clinicalSignificance": "High risk for breast and ovarian cancer"
    }
  ]
}
```

## Installation

### 1. Install Dependencies

```bash
cd "CHAT BOT NEW"
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your API endpoints:

```env
REACT_APP_OLLAMA_URL=http://localhost:11434
REACT_APP_OLLAMA_MODEL=gemma
REACT_APP_GENOMICS_API_URL=http://localhost:3001/api
REACT_APP_DEFAULT_LANGUAGE=en
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Text Chat
1. Type your genomics question in the input field
2. Press Enter or click the Send button
3. The AI will fetch relevant genomics data and provide an answer

### Voice Input
1. Click the microphone button to start voice input
2. Speak your question
3. The text will be transcribed and sent automatically

### Voice Output
1. Click the speaker icon on any bot response to hear it read aloud
2. Click again to stop

### Language Selection
1. Click Settings in the sidebar
2. Select your preferred language (English, Spanish, or French)
3. The interface and responses will update accordingly

### Settings
- **Auto-speak**: Enable automatic voice output for all responses
- **Ollama URL**: Configure your Ollama server endpoint
- **Genomics API URL**: Configure your genomics API endpoint

## API Integration

### Ollama Service

The application uses the Ollama API to generate responses:

```javascript
import ollamaService from './services/ollamaService';

// Generate a response
const response = await ollamaService.generateResponse(
  "What is BRCA1?",
  "Context about BRCA1 variants..."
);
```

### Genomics API Service

Fetch genomics data:

```javascript
import genomicsApiService from './services/genomicsApiService';

// Search variants
const variants = await genomicsApiService.searchVariants("BRCA1");

// Search diseases
const diseases = await genomicsApiService.searchDiseases("breast cancer");

// Search tests
const tests = await genomicsApiService.searchTests("genetic screening");
```

## Project Structure

```
src/
├── components/
│   ├── ChatArea.jsx           # Main chat interface
│   ├── MessageBubble.jsx      # Message display component
│   ├── Sidebar.jsx            # Navigation sidebar
│   ├── LanguageSelector.jsx   # Language selection
│   └── Settings.jsx           # Settings modal
├── services/
│   ├── ollamaService.js       # Ollama API integration
│   ├── genomicsApiService.js  # Genomics API integration
│   └── voiceService.js        # Web Speech API wrapper
├── config/
│   └── i18n.js                # i18next configuration
├── styles/
│   ├── ChatArea.css
│   ├── ChatPage.css
│   ├── LanguageSelector.css
│   └── Settings.css
└── pages/
    └── ChatPage.jsx           # Main page layout
```

## Browser Compatibility

- Chrome/Edge: Full support (including Web Speech API)
- Firefox: Full support (including Web Speech API)
- Safari: Full support (including Web Speech API)

## Troubleshooting

### Ollama Connection Error
- Ensure Ollama is running: `ollama serve`
- Check the URL in Settings matches your Ollama server
- Default: `http://localhost:11434`

### Genomics API Connection Error
- Verify your API server is running
- Check the URL in Settings
- Ensure the API endpoints match the expected format

### Voice Input Not Working
- Check browser permissions for microphone access
- Ensure your browser supports Web Speech API
- Try a different browser if issues persist

### Voice Output Not Working
- Check browser permissions for audio output
- Ensure your system volume is not muted
- Try a different browser if issues persist

## Development

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

## Technologies Used

- **React 19**: UI framework
- **Vite**: Build tool
- **i18next**: Internationalization
- **Axios**: HTTP client
- **Lucide React**: Icons
- **Web Speech API**: Voice input/output
- **Ollama**: Local LLM
- **CSS3**: Styling with glassmorphism effects

## License

MIT

## Support

For issues or questions, please refer to the documentation or contact the development team.
