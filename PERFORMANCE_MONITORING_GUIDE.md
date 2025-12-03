# Performance Monitoring & Improvement Guide

This guide provides practical code snippets for monitoring, measuring, and improving chat response performance.

---

## 📊 Performance Monitoring

### 1. Measure Time to First Token (TTFT)

Add to `ChatArea.jsx`:

```javascript
const handleSend = async (e) => {
  e.preventDefault();
  if (!inputValue.trim() || isLoading) return;

  const userMessage = inputValue.trim();
  
  // Start performance measurement
  const perfStart = performance.now();
  let firstTokenTime = null;
  
  // ... existing code ...
  
  // Stream response
  let fullResponse = '';
  let isFirstChunk = true;
  
  await ollamaService.generateStreamResponse(
    userMessage,
    context,
    i18n.language,
    (chunk) => {
      // Measure TTFT
      if (isFirstChunk) {
        firstTokenTime = performance.now() - perfStart;
        console.log(`⚡ TTFT: ${firstTokenTime.toFixed(2)}ms`);
        isFirstChunk = false;
      }
      
      fullResponse += chunk;
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? { ...msg, text: fullResponse }
          : msg
      ));
    },
    abortController.signal
  );
  
  // Measure total time
  const totalTime = performance.now() - perfStart;
  console.log(`📊 Total generation time: ${totalTime.toFixed(2)}ms`);
  console.log(`📊 Tokens per second: ${(fullResponse.split(' ').length / (totalTime/1000)).toFixed(2)}`);
};
```

---

### 2. Monitor Context Building Performance

Add to `ChatArea.jsx`:

```javascript
const buildContext = async (userMessage) => {
  const startTime = performance.now();
  
  try {
    let context = '';
    const operations = [];

    const variantMatch = userMessage.match(/variant|mutation|SNP/i);
    const diseaseMatch = userMessage.match(/disease|disorder|condition/i);
    const testMatch = userMessage.match(/test|screening|diagnosis/i);

    // Track which searches are performed
    if (variantMatch) {
      operations.push('variants');
      const variantStart = performance.now();
      const variants = await genomicsApiService.searchVariants(userMessage);
      const variantTime = performance.now() - variantStart;
      console.log(`🔍 Variant search: ${variantTime.toFixed(2)}ms`);
      
      if (variants && variants.length > 0) {
        context += `Relevant Variants: ${JSON.stringify(variants.slice(0, 2))}\n`;
      }
    }

    if (diseaseMatch) {
      operations.push('diseases');
      const diseaseStart = performance.now();
      const diseases = await genomicsApiService.searchDiseases(userMessage);
      const diseaseTime = performance.now() - diseaseStart;
      console.log(`🔍 Disease search: ${diseaseTime.toFixed(2)}ms`);
      
      if (diseases && diseases.length > 0) {
        context += `Relevant Diseases: ${JSON.stringify(diseases.slice(0, 2))}\n`;
      }
    }

    if (testMatch) {
      operations.push('tests');
      const testStart = performance.now();
      const tests = await genomicsApiService.searchTests(userMessage);
      const testTime = performance.now() - testStart;
      console.log(`🔍 Test search: ${testTime.toFixed(2)}ms`);
      
      if (tests && tests.length > 0) {
        context += `Relevant Tests: ${JSON.stringify(tests.slice(0, 2))}\n`;
      }
    }

    const totalTime = performance.now() - startTime;
    console.log(`📦 Context built in ${totalTime.toFixed(2)}ms (${operations.join(', ') || 'no searches'})`);
    console.log(`📦 Context size: ${context.length} characters`);
    
    return context;
  } catch (error) {
    console.error('❌ Error building context:', error);
    return '';
  }
};
```

---

### 3. Track Component Re-renders

Create `useRenderCount` hook:

```javascript
// src/hooks/useRenderCount.js
import { useRef, useEffect } from 'react';

export const useRenderCount = (componentName) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 ${componentName} rendered: ${renderCount.current} times`);
  });
  
  return renderCount.current;
};

// Usage in ChatArea.jsx
import { useRenderCount } from '../hooks/useRenderCount';

const ChatArea = ({ selectedSessionId, onSessionCreated }) => {
  useRenderCount('ChatArea');
  // ... rest of component
};
```

---

### 4. Monitor API Response Times

Add interceptor to services:

```javascript
// src/services/genomicsApiService.js
const genomicsClient = axios.create({
  baseURL: GENOMICS_API_URL,
  timeout: 10000,
});

// Request interceptor - mark start time
genomicsClient.interceptors.request.use((config) => {
  config.metadata = { startTime: performance.now() };
  return config;
});

// Response interceptor - calculate duration
genomicsClient.interceptors.response.use(
  (response) => {
    const duration = performance.now() - response.config.metadata.startTime;
    console.log(`🌐 API ${response.config.url}: ${duration.toFixed(2)}ms`);
    return response;
  },
  (error) => {
    if (error.config?.metadata) {
      const duration = performance.now() - error.config.metadata.startTime;
      console.error(`❌ API ${error.config.url} failed after ${duration.toFixed(2)}ms`);
    }
    return Promise.reject(error);
  }
);
```

---

## 🚀 Performance Improvements

### 1. Parallel Context Building (RECOMMENDED)

Current implementation is sequential. Improve it:

```javascript
// BEFORE (Sequential - SLOW)
const buildContext = async (userMessage) => {
  let context = '';
  
  if (variantMatch) {
    const variants = await searchVariants(userMessage);  // 500ms
    context += formatVariants(variants);
  }
  
  if (diseaseMatch) {
    const diseases = await searchDiseases(userMessage);  // 500ms
    context += formatDiseases(diseases);
  }
  
  if (testMatch) {
    const tests = await searchTests(userMessage);  // 500ms
    context += formatTests(tests);
  }
  
  return context;  // Total: 1500ms if all match
};

// AFTER (Parallel - FAST)
const buildContext = async (userMessage) => {
  const variantMatch = userMessage.match(/variant|mutation|SNP/i);
  const diseaseMatch = userMessage.match(/disease|disorder|condition/i);
  const testMatch = userMessage.match(/test|screening|diagnosis/i);

  // Execute all searches in parallel
  const [variants, diseases, tests] = await Promise.all([
    variantMatch ? genomicsApiService.searchVariants(userMessage) : Promise.resolve([]),
    diseaseMatch ? genomicsApiService.searchDiseases(userMessage) : Promise.resolve([]),
    testMatch ? genomicsApiService.searchTests(userMessage) : Promise.resolve([])
  ]);

  // Build context string
  let context = '';
  
  if (variants.length > 0) {
    context += `Relevant Variants: ${JSON.stringify(variants.slice(0, 2))}\n`;
  }
  
  if (diseases.length > 0) {
    context += `Relevant Diseases: ${JSON.stringify(diseases.slice(0, 2))}\n`;
  }
  
  if (tests.length > 0) {
    context += `Relevant Tests: ${JSON.stringify(tests.slice(0, 2))}\n`;
  }

  return context;  // Total: ~500ms (fastest of the three)
};

// PERFORMANCE GAIN: 66% faster when multiple keywords detected
```

---

### 2. Context Caching

Add caching to avoid redundant API calls:

```javascript
// Create cache outside component to persist across renders
const contextCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const buildContext = async (userMessage) => {
  // Create cache key (first 50 chars, lowercase)
  const cacheKey = userMessage.toLowerCase().trim().slice(0, 50);
  
  // Check cache
  const cached = contextCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('✅ Context cache hit!');
    return cached.context;
  }
  
  // Build context (existing logic)
  const context = await buildContextFromAPI(userMessage);
  
  // Store in cache
  contextCache.set(cacheKey, {
    context,
    timestamp: Date.now()
  });
  
  // Limit cache size
  if (contextCache.size > 100) {
    const firstKey = contextCache.keys().next().value;
    contextCache.delete(firstKey);
  }
  
  return context;
};

// PERFORMANCE GAIN: 0ms for cached queries (vs 500-1500ms)
```

---

### 3. Debounced Predictive Context Building

Start building context while user types (advanced):

```javascript
import { useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';

const ChatArea = () => {
  const [inputValue, setInputValue] = useState('');
  const [prebuiltContext, setPrebuiltContext] = useState('');

  // Debounced context builder
  const debouncedBuildContext = useMemo(
    () => debounce(async (message) => {
      if (message.length > 20) {  // Only for substantial messages
        console.log('🔮 Pre-building context...');
        const context = await buildContext(message);
        setPrebuiltContext(context);
      }
    }, 1000),  // Wait 1s after user stops typing
    []
  );

  // Call when user types
  useEffect(() => {
    debouncedBuildContext(inputValue);
  }, [inputValue, debouncedBuildContext]);

  const handleSend = async (e) => {
    e.preventDefault();
    // ...
    
    // Use pre-built context if available
    const context = prebuiltContext || await buildContext(userMessage);
    
    // Reset
    setPrebuiltContext('');
    
    // ... rest of send logic
  };
  
  // PERFORMANCE GAIN: Context ready instantly when user clicks send
};
```

---

### 4. Memoize Message Components

Prevent unnecessary re-renders:

```javascript
// src/components/MessageBubble.jsx
import React from 'react';

const MessageBubble = ({ message, onSpeak, onCopy, onDelete }) => {
  console.log('Rendering message:', message.id);
  
  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">{message.text}</div>
      {/* ... message controls ... */}
    </div>
  );
};

// Memoize to prevent re-renders when props unchanged
export default React.memo(MessageBubble, (prevProps, nextProps) => {
  // Only re-render if message text or id changed
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text
  );
});

// PERFORMANCE GAIN: 90% fewer re-renders during streaming
```

---

### 5. Virtual Scrolling for Long Conversations

For chats with 100+ messages:

```javascript
import { FixedSizeList as List } from 'react-window';

const ChatMessages = ({ messages }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <MessageBubble message={messages[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </List>
  );
};

// PERFORMANCE GAIN: Renders only visible messages (10-20 instead of 1000+)
```

---

### 6. Optimize State Updates During Streaming

Batch updates to reduce re-renders:

```javascript
// BEFORE (Updates every chunk)
await ollamaService.generateStreamResponse(
  userMessage,
  context,
  i18n.language,
  (chunk) => {
    fullResponse += chunk;
    setMessages(prev => prev.map(msg =>
      msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
    ));  // Re-render on EVERY chunk
  }
);

// AFTER (Throttled updates)
import throttle from 'lodash/throttle';

const throttledUpdate = throttle((text) => {
  setMessages(prev => prev.map(msg =>
    msg.id === botMsgId ? { ...msg, text } : msg
  ));
}, 50);  // Max 20 updates/second

await ollamaService.generateStreamResponse(
  userMessage,
  context,
  i18n.language,
  (chunk) => {
    fullResponse += chunk;
    throttledUpdate(fullResponse);  // Throttled re-renders
  }
);

// Final update to ensure completeness
setMessages(prev => prev.map(msg =>
  msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
));

// PERFORMANCE GAIN: 80% fewer re-renders, smoother UI
```

---

## 📈 Performance Dashboard Component

Create a dev-only performance monitor:

```javascript
// src/components/PerformanceMonitor.jsx
import { useState, useEffect } from 'react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    ttft: 0,
    contextTime: 0,
    messageCount: 0,
    renderCount: 0
  });

  useEffect(() => {
    // Listen to custom performance events
    const handlePerformance = (e) => {
      setMetrics(prev => ({
        ...prev,
        [e.detail.metric]: e.detail.value
      }));
    };

    window.addEventListener('performance:metric', handlePerformance);
    return () => window.removeEventListener('performance:metric', handlePerformance);
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: '#0f0',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>⚡ TTFT: {metrics.ttft.toFixed(2)}ms</div>
      <div>📦 Context: {metrics.contextTime.toFixed(2)}ms</div>
      <div>💬 Messages: {metrics.messageCount}</div>
      <div>🔄 Renders: {metrics.renderCount}</div>
    </div>
  );
};

// Dispatch events from ChatArea.jsx
const dispatchMetric = (metric, value) => {
  window.dispatchEvent(new CustomEvent('performance:metric', {
    detail: { metric, value }
  }));
};

// Usage:
dispatchMetric('ttft', firstTokenTime);
dispatchMetric('contextTime', contextBuildTime);
```

---

## 🧪 Performance Testing Script

Create automated performance tests:

```javascript
// tests/performance.test.js
import { performance } from 'perf_hooks';

const testChatPerformance = async () => {
  const results = {
    optimisticUI: [],
    contextBuilding: [],
    ttft: []
  };

  // Test 1: Optimistic UI update
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    setMessages([...messages, newMessage]);
    const duration = performance.now() - start;
    results.optimisticUI.push(duration);
  }

  // Test 2: Context building
  const testMessages = [
    'Hello',  // No keywords
    'What are BRCA1 variants?',  // Variant keyword
    'Tell me about breast cancer tests'  // Multiple keywords
  ];

  for (const msg of testMessages) {
    const start = performance.now();
    await buildContext(msg);
    const duration = performance.now() - start;
    results.contextBuilding.push(duration);
  }

  // Calculate statistics
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const p95 = (arr) => arr.sort((a, b) => a - b)[Math.floor(arr.length * 0.95)];

  console.log('Performance Results:');
  console.log('Optimistic UI - Avg:', avg(results.optimisticUI).toFixed(2), 'ms');
  console.log('Optimistic UI - P95:', p95(results.optimisticUI).toFixed(2), 'ms');
  console.log('Context Building - Avg:', avg(results.contextBuilding).toFixed(2), 'ms');
};
```

---

## 🎯 Performance Checklist

Use this checklist to ensure optimal performance:

```markdown
## Before Deployment

- [ ] Streaming enabled in ollamaService
- [ ] Optimistic UI updates implemented
- [ ] Context building is lazy (keyword-based)
- [ ] API calls use parallel execution where possible
- [ ] MessageBubble components are memoized
- [ ] State updates are batched/throttled
- [ ] Abort controller works for stop functionality
- [ ] No console.logs in production build
- [ ] Large lists use virtual scrolling
- [ ] Images and assets are optimized
- [ ] Network timeouts are configured
- [ ] Error boundaries catch performance issues
- [ ] React DevTools profiler shows no unnecessary renders
- [ ] Lighthouse score > 90 for performance
- [ ] TTFT < 1 second without context
- [ ] TTFT < 2 seconds with context
```

---

## 🔍 Debugging Slow Performance

If chat feels slow, check these in order:

### 1. Check Ollama Connection
```javascript
const isConnected = await ollamaService.checkConnection();
console.log('Ollama connected:', isConnected);
```

### 2. Verify Streaming is Enabled
```javascript
// In ollamaService.js
console.log('Stream setting:', { stream: true });  // Should be true
```

### 3. Check Context Building Time
```javascript
console.time('contextBuilding');
const context = await buildContext(userMessage);
console.timeEnd('contextBuilding');
// Should be < 1000ms
```

### 4. Monitor Network Tab
- Open DevTools → Network
- Look for slow API calls (> 2 seconds)
- Check if multiple requests are sequential (should be parallel)

### 5. Profile React Renders
- Open React DevTools → Profiler
- Record a message send
- Look for expensive renders (> 50ms)
- Check for render cascades

---

## 🏆 Performance Goals

Target these metrics:

```
Metric                          Target      Excellent
─────────────────────────────────────────────────────
Optimistic UI                   < 50ms      < 10ms
Keyword Detection               < 10ms      < 1ms
Context (no keywords)           < 10ms      < 1ms
Context (with keywords)         < 1000ms    < 500ms
TTFT (no context)              < 1000ms    < 500ms
TTFT (with context)            < 2000ms    < 1000ms
Chunk Processing               < 20ms      < 10ms
Stop Response                  < 100ms     < 50ms
Message Re-render              < 16ms      < 5ms
```

---

## 📚 Additional Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Streaming API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## Summary

**Monitor**: Use console.time, performance.now(), and custom events
**Optimize**: Parallelize, cache, memoize, throttle
**Test**: Profile with React DevTools and Chrome Performance tab
**Target**: TTFT < 1s, UI updates < 10ms, no blocking operations

The fastest code is the code that doesn't run! 🚀
