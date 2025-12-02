// Ollama Service for streaming LLM responses
const OLLAMA_DEFAULT_URL = 'http://localhost:11434';

class OllamaService {
    constructor() {
        this.baseUrl = this.getOllamaUrl();
    }

    getOllamaUrl() {
        return localStorage.getItem('ollamaUrl') || `http://${window.location.hostname}:11434`;
    }

    async generateStreamResponse(prompt, context = [], signal = null) {
        const url = `${this.getOllamaUrl()}/api/generate`;

        const requestBody = {
            model: 'gemma3:4b',  // Using available model
            prompt: prompt,
            stream: true,
            context: context
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: signal
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        return response.body;
    }

    async *streamResponse(prompt, context = [], signal = null) {
        const stream = await this.generateStreamResponse(prompt, context, signal);
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            yield parsed.response;
                        }
                        if (parsed.done) {
                            return parsed.context || [];
                        }
                    } catch (e) {
                        console.error('Failed to parse chunk:', e);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return [];
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.getOllamaUrl()}/api/tags`);
            return response.ok;
        } catch {
            return false;
        }
    }

    async getModels() {
        try {
            const response = await fetch(`${this.getOllamaUrl()}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                return data.models || [];
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }
        return [];
    }
}

export const ollamaService = new OllamaService();
