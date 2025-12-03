# Quick Fix Guide for Better Chat Responses

## Problem
Chat responses are short and crude because:
1. No genomics context is being added
2. System prompt doesn't instruct detailed responses
3. num_predict is too low (default ~128 tokens)

## Solution: Update GenomicsChat.jsx handleSend()

### Current Code (Line ~215):
```javascript
for await (const chunk of ollamaService.streamResponse(prompt WithContext, [], null)) {
```

### Change To:
```javascript
// 1. Import genomicsApiService at top of file
import { genomicsApiService } from './lib/genomicsApiService';

// 2. In handleSend, before streaming:
const genomicsContext = await genomicsApiService.buildContext(userPrompt);

// 3. Update the streaming call to include context:
for await (const chunk of ollamaService.streamResponse(
  userPrompt,
  genomicsContext,  // Add this
  i18n.language,     // Add this
  messages,          // Add this for conversation history
  null               // abort signal
)) {
```

## Alternative: Simple Fix in ollamaService.js

Update the `requestBody` in `generateStreamResponse` (line ~16):

```javascript
const requestBody = {
    model: 'gemma3:4b',
    prompt: `You are an expert genomics assistant. Provide detailed, comprehensive answers with scientific accuracy. Use proper formatting with headings and bullets.\n\nQuestion: ${prompt}\n\nDetailed Answer:`,
    stream: true,
    options: {
        temperature: 0.7,
        num_predict: 2048,  // ADD THIS - allows longer responses
        top_p: 0.9,
        top_k: 40
    }
};
```

## Test
After changes, ask: "What is BRCA1?"

**Before:** Short 2-3 sentence answer
**After:** Detailed paragraphs with headers, bullets, examples

## Files to modify:
1. `frontend/src/lib/ollamaService.js` - Add num_predict=2048
2. `frontend/src/GenomicsChat.jsx` - Use genomicsApiService.buildContext()
