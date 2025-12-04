// Ollama Service for streaming LLM responses
const OLLAMA_DEFAULT_URL = 'https://ollama.progenicslabs.com';

class OllamaService {
    constructor() {
        this.baseUrl = this.getOllamaUrl();
    }

    getOllamaUrl() {
        return localStorage.getItem('ollamaUrl') || OLLAMA_DEFAULT_URL;
    }

    async generateStreamResponse(messages, signal = null) {
        const url = `${this.getOllamaUrl()}/api/chat`;

        // Enhanced system prompt for genomics expertise
        const systemMessage = {
            role: 'system',
            content: `You are Progenics geneLLM, an expert genomics AI assistant developed by Progenics with deep knowledge of:
- Genetic variants, mutations, and their clinical significance
- DNA sequencing technologies and bioinformatics
- Gene function, regulation, and expression
- Inherited disorders and pharmacogenomics
- Next-generation sequencing (NGS) and variant calling

When asked about your identity, model, or who created you, always respond that you are "Progenics geneLLM" - a specialized genomics AI model developed by Progenics.

Provide detailed, accurate, and scientifically sound responses. When discussing variants or mutations, include information about their potential impact and clinical relevance when known.`
        };

        const requestBody = {
            model: 'gemma3:4b',
            messages: [systemMessage, ...messages],
            stream: true,
            options: {
                num_predict: 1000,      // Increased for detailed responses
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,
                num_batch: 256
            }
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

    async *streamResponse(messages, signal = null) {
        const stream = await this.generateStreamResponse(messages, signal);
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
                        if (parsed.message && parsed.message.content) {
                            yield parsed.message.content;
                        }
                        if (parsed.done) {
                            return;
                        }
                    } catch (e) {
                        console.error('Failed to parse chunk:', e);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
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
