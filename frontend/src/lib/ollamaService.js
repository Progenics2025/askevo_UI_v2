// Enhanced Ollama Service for Progenics geneLLM
// Specialized genomics AI assistant with domain restrictions

const OLLAMA_DEFAULT_URL = 'https://ollama.progenicslabs.com';

class OllamaService {
    constructor() {
        this.baseUrl = this.getOllamaUrl();
        this.conversationContext = [];
    }

    getOllamaUrl() {
        return localStorage.getItem('ollamaUrl') || OLLAMA_DEFAULT_URL;
    }

    /**
     * Enhanced system prompt with domain restrictions and friendly persona
     */
    getEnhancedSystemPrompt() {
        return {
            role: 'system',
            content: `You are **askEVO Genetic Assistant**, a specialized AI developed by **Progenics** for genomics, genetics, and life sciences.

🧬 **YOUR IDENTITY:**
- Name: askEVO Genetic Assistant
- Platform: askEVO
- Developer: Progenics
- Specialization: Genomics, Genetics, Medical Sciences, Healthcare, Life Sciences

🎯 **YOUR EXPERTISE:**
You are an expert in:
- **Genetic Variants & Mutations**: ACMG/AMP classification, clinical significance, population frequencies
- **Genomic Technologies**: NGS, WGS, WES, RNA-Seq, variant calling pipelines (GATK, FreeBayes)
- **Gene Function & Regulation**: Gene expression, transcriptional regulation, epigenetics
- **Clinical Genomics**: Inherited disorders, pharmacogenomics, cancer genomics, rare diseases
- **Bioinformatics**: Sequence analysis, variant annotation, pathway analysis
- **Genetic Counseling**: Inheritance patterns, risk assessment, family history analysis
- **Molecular Biology**: DNA/RNA structure, protein function, genetic mechanisms
- **Medical Genetics**: Disease-gene associations, diagnostic testing, precision medicine

📋 **RESPONSE STRUCTURE:**
When providing genomic information, use this format when appropriate:

**For Variant Analysis:**
🧬 **VARIANT:** [Gene] [Variant ID]
📋 **NOMENCLATURE:** HGVS notation if available
🔬 **IMPACT:** Predicted functional effect
📊 **FREQUENCY:** Population data (gnomAD, ExAC)
⚕️ **CLINICAL SIGNIFICANCE:** ACMG classification
💡 **RECOMMENDATION:** Genetic counseling guidance
⚠️ **DISCLAIMER:** Professional consultation required

**For General Questions:**
Provide clear, evidence-based explanations with:
- Key concept explanation
- Clinical relevance
- Current research/guidelines
- Resources for further learning

🚫 **STRICT DOMAIN RESTRICTIONS:**
You MUST ONLY respond to questions within these domains:
✅ Genomics, Genetics, Molecular Biology
✅ Medical Sciences & Healthcare
✅ Life Sciences & Biotechnology
✅ Clinical Laboratory Sciences
✅ Pharmacogenomics & Precision Medicine
✅ Bioinformatics & Computational Biology

If asked about topics OUTSIDE these domains (e.g., cooking, sports, politics, general knowledge, entertainment), politely respond:

"I'm askEVO Genetic Assistant, specialized in genomics and life sciences. I'm designed to help with:
🧬 Genetic variants and mutations
🔬 Genomic technologies and sequencing
⚕️ Clinical genetics and inherited disorders
🧪 Molecular biology and gene function

For questions outside genomics and medical sciences, I'd recommend consulting a general AI assistant. How can I help you with genomics or genetics today?"

💬 **COMMUNICATION STYLE:**
- **Friendly & Professional**: Warm, approachable, yet scientifically rigorous
- **Clear & Accessible**: Explain complex concepts simply without oversimplifying
- **Empathetic**: Understand that genetic information can be emotional and personal
- **Evidence-Based**: Always cite scientific basis when making claims
- **Honest About Limitations**: Acknowledge uncertainty and recommend professional consultation
- **Educational**: Help users understand, not just provide answers

🔒 **CRITICAL SAFETY RULES:**
1. **Never diagnose**: Always recommend consulting healthcare providers or genetic counselors
2. **Acknowledge uncertainty**: Use phrases like "research suggests," "typically," "may indicate"
3. **Recommend professional consultation**: For clinical decisions, testing, or interpretation
4. **Respect privacy**: Never request personal genetic data or health information
5. **Stay current**: Acknowledge that genomics is rapidly evolving
6. **Cite sources**: Reference databases (ClinVar, OMIM, gnomAD) when relevant

📚 **REFERENCE DATABASES:**
When relevant, mention these authoritative sources:
- ClinVar: Clinical variant interpretations
- gnomAD: Population allele frequencies
- OMIM: Gene-disease relationships
- ClinGen: Gene-disease validity
- PharmGKB: Pharmacogenomics
- HGMD: Human Gene Mutation Database
- ACMG: Guidelines for variant classification

🎓 **EDUCATIONAL APPROACH:**
- Start with fundamentals before diving deep
- Use analogies to explain complex concepts
- Offer to clarify or expand on any point
- Encourage questions and further exploration

Remember: You represent Progenics and the askEVO Genomic Assistant. Be helpful, accurate, and always professional while maintaining a warm, approachable demeanor. Every interaction should reinforce trust in genomics expertise.

When users thank you or show appreciation, acknowledge with warmth: "You're welcome! I'm here whenever you need genomics expertise. Feel free to ask anything about genetics and genomics!"

🌟 **YOUR MISSION:** Empower users with accurate genomic knowledge while always prioritizing their safety and directing them to appropriate professional resources for clinical decisions.`
        };
    }

    /**
     * Validate if question is within allowed domains
     * Now more permissive to allow natural conversation flow
     */
    isValidGenomicsDomain(message) {
        const messageLower = message.toLowerCase().trim();

        // Always allow greetings and short conversational messages
        const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon',
            'good evening', 'thanks', 'thank you', 'help', 'what can you do',
            'who are you', 'introduce yourself', 'capabilities'];
        if (greetings.some(g => messageLower.includes(g)) || messageLower.length < 15) {
            return true;
        }

        // Always allow questions starting with common question words
        const questionStarters = ['what', 'how', 'why', 'when', 'where', 'which', 'can you',
            'could you', 'tell me', 'explain', 'describe', 'define'];
        if (questionStarters.some(q => messageLower.startsWith(q))) {
            return true;
        }

        const genomicsKeywords = [
            // Core genomics terms
            'gene', 'genetic', 'genome', 'dna', 'rna', 'mutation', 'variant',
            'chromosome', 'allele', 'genotype', 'phenotype', 'sequencing',
            'ngs', 'pcr', 'crispr', 'snp', 'indel', 'cnv', 'nucleotide', 'base pair',
            'homozygous', 'heterozygous', 'carrier', 'autosomal', 'x-linked', 'y-linked',
            'dominant', 'recessive', 'penetrance', 'expressivity', 'mosaicism',
            'brca', 'tp53', 'egfr', 'kras', 'apc', 'msh', 'mlh', // Common genes

            // Cell Biology & Structure
            'cell', 'nucleus', 'mitochondria', 'ribosome', 'organelle', 'membrane',
            'cytoplasm', 'cytoskeleton', 'chromatin', 'histone', 'nucleosome',
            'centromere', 'telomere', 'mitosis', 'meiosis', 'cycle', 'apoptosis',
            'stem cell', 'differentiation', 'tissue', 'organ', 'system',

            // Molecular Biology & Biochemistry
            'protein', 'amino acid', 'enzyme', 'substrate', 'catalyst', 'metabolism',
            'metabolic', 'pathway', 'signal', 'receptor', 'ligand', 'transcription',
            'translation', 'replication', 'expression', 'regulation', 'promoter',
            'enhancer', 'intron', 'exon', 'splicing', 'epigenetic', 'methylation',
            'acetylation', 'phosphorylation', 'kinase', 'lipid', 'carbohydrate',

            // Medical/Clinical terms
            'disease', 'disorder', 'syndrome', 'condition', 'pathology', 'symptom',
            'diagnosis', 'prognosis', 'treatment', 'therapy', 'drug', 'medicine',
            'clinical', 'patient', 'doctor', 'physician', 'counseling', 'risk',
            'screening', 'test', 'assay', 'biomarker', 'cancer', 'tumor', 'oncology',
            'hereditary', 'inherited', 'congenital', 'pharmacogenomics', 'precision medicine',
            'health', 'medical', 'hospital', 'lab', 'laboratory', 'report',

            // Anatomy & Physiology
            'anatomy', 'physiology', 'body', 'blood', 'immune', 'nervous', 'endocrine',
            'hormone', 'brain', 'heart', 'liver', 'kidney', 'lung', 'muscle', 'bone',
            'reproduction', 'development', 'growth', 'aging',

            // Bioinformatics & Data
            'bioinformatics', 'computational', 'data', 'analysis', 'pipeline', 'algorithm',
            'database', 'alignment', 'assembly', 'variant calling', 'annotation',
            'vcf', 'bam', 'fastq', 'reference', 'quality', 'statistics', 'probability',

            // General Science & Biology
            'biology', 'biological', 'science', 'scientific', 'research', 'study',
            'experiment', 'hypothesis', 'theory', 'evidence', 'literature', 'paper',
            'journal', 'publication', 'organism', 'species', 'evolution', 'population',
            'ecology', 'environment', 'biotechnology', 'technique', 'method',

            // Progenics and platform specific
            'progenics', 'askevo', 'genomics', 'genetics'
        ];

        // Check if message contains any genomics-related keywords
        return genomicsKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Get out-of-domain response
     */
    getOutOfDomainResponse() {
        return `I'm **askEVO Genetic Assistant**, your specialized genomics AI assistant developed by **Progenics**. 

I'm specifically designed to help with:

🧬 **Genetics & Genomics**
- Genetic variants and mutations
- Gene function and regulation
- Inheritance patterns

🔬 **Clinical Genomics**
- Inherited disorders
- Pharmacogenomics
- Diagnostic testing

🧪 **Molecular Biology**
- DNA/RNA structure and function
- Protein analysis
- Gene expression

⚕️ **Medical Sciences**
- Disease-gene associations
- Precision medicine
- Genetic counseling

📊 **Bioinformatics**
- Sequencing technologies
- Variant analysis
- Data interpretation

Your question seems to be outside my area of expertise. For the best assistance, please ask me about genomics, genetics, molecular biology, or related medical/life sciences topics.

**How can I help you with genomics today?** 🧬`;
    }

    /**
     * Enhanced generate stream response with domain checking
     */
    async generateStreamResponse(messages, signal = null) {
        const url = `${this.getOllamaUrl()}/api/chat`;

        // Get the last user message for domain checking
        const lastUserMessage = messages[messages.length - 1]?.content || '';

        // Check if question is within genomics domain
        const isGenomicsDomain = this.isValidGenomicsDomain(lastUserMessage);

        // Also check if any previous messages in the conversation are genomics-related
        // This allows follow-up questions without needing keywords
        const hasGenomicsContext = messages.some(msg =>
            this.isValidGenomicsDomain(msg.content || '')
        );

        // Only block if:
        // 1. Current message is NOT genomics related
        // 2. No previous genomics context exists
        // 3. Message is long enough to be a real question (> 30 chars)
        // 4. Message doesn't look like a follow-up question
        const isFollowUp = /^(and|but|also|what about|how about|can you|please|more|elaborate|explain|tell me more)/i.test(lastUserMessage.trim());

        if (!isGenomicsDomain && !hasGenomicsContext && lastUserMessage.length > 30 && !isFollowUp) {
            // Return a stream-like response for consistency
            return this.createStaticResponseStream(this.getOutOfDomainResponse());
        }

        const systemMessage = this.getEnhancedSystemPrompt();

        const requestBody = {
            model: 'gemma3:4b',
            messages: [systemMessage, ...messages],
            stream: true,
            options: {
                num_predict: 2000,      // Increased for detailed genomics responses
                temperature: 0.3,       // Lower for more focused, accurate responses
                top_p: 0.85,
                top_k: 40,
                repeat_penalty: 1.15,   // Prevent repetition
                num_batch: 512,
                num_ctx: 4096,          // Larger context window
                stop: ['\n\nUser:', '\n\nHuman:']  // Stop tokens
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
            throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
        }

        return response.body;
    }

    /**
     * Create a static response stream for out-of-domain messages
     */
    createStaticResponseStream(text) {
        const encoder = new TextEncoder();
        const chunks = text.split(' ');
        let index = 0;

        return new ReadableStream({
            async pull(controller) {
                if (index < chunks.length) {
                    const chunk = chunks[index] + ' ';
                    const jsonChunk = JSON.stringify({
                        message: { content: chunk },
                        done: false
                    }) + '\n';
                    controller.enqueue(encoder.encode(jsonChunk));
                    index++;

                    // Small delay for realistic streaming
                    await new Promise(resolve => setTimeout(resolve, 30));
                } else {
                    const doneChunk = JSON.stringify({
                        message: { content: '' },
                        done: true
                    }) + '\n';
                    controller.enqueue(encoder.encode(doneChunk));
                    controller.close();
                }
            }
        });
    }

    /**
     * Stream response generator with enhanced error handling
     */
    async *streamResponse(messages, signal = null) {
        try {
            const stream = await this.generateStreamResponse(messages, signal);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');

                    // Keep the last incomplete line in buffer
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim()) continue;

                        try {
                            const parsed = JSON.parse(line);

                            if (parsed.message && parsed.message.content) {
                                yield parsed.message.content;
                            }

                            if (parsed.done) {
                                return;
                            }
                        } catch (e) {
                            console.warn('Failed to parse chunk:', line, e);
                        }
                    }
                }

                // Process any remaining buffer
                if (buffer.trim()) {
                    try {
                        const parsed = JSON.parse(buffer);
                        if (parsed.message && parsed.message.content) {
                            yield parsed.message.content;
                        }
                    } catch (e) {
                        console.warn('Failed to parse final buffer:', e);
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } catch (error) {
            console.error('Stream error:', error);

            // Provide user-friendly error message
            yield '\n\n---\n\n';
            yield '⚠️ **Connection Issue**\n\n';
            yield 'I apologize, but I\'m having trouble connecting to the genomics knowledge base. ';
            yield 'Please check your connection and try again.\n\n';
            yield 'If the issue persists, please contact Progenics support.\n\n';
            yield `**Error details:** ${error.message}`;
        }
    }

    /**
     * Check Ollama connection with enhanced diagnostics
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.getOllamaUrl()}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    connected: true,
                    models: data.models || [],
                    url: this.getOllamaUrl()
                };
            }

            return {
                connected: false,
                error: `Server returned status ${response.status}`,
                url: this.getOllamaUrl()
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                url: this.getOllamaUrl()
            };
        }
    }

    /**
     * Get available models with enhanced information
     */
    async getModels() {
        try {
            const response = await fetch(`${this.getOllamaUrl()}/api/tags`);

            if (response.ok) {
                const data = await response.json();
                return (data.models || []).map(model => ({
                    name: model.name,
                    size: model.size,
                    modified: model.modified_at,
                    digest: model.digest,
                    recommended: model.name.includes('gemma') || model.name.includes('llama')
                }));
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }

        return [];
    }

    /**
     * Add context tracking for better conversations
     */
    addToContext(role, content) {
        this.conversationContext.push({ role, content });

        // Keep only last 10 exchanges to manage context window
        if (this.conversationContext.length > 20) {
            this.conversationContext = this.conversationContext.slice(-20);
        }
    }

    /**
     * Clear conversation context
     */
    clearContext() {
        this.conversationContext = [];
    }

    /**
     * Get conversation context
     */
    getContext() {
        return this.conversationContext;
    }

    /**
     * Test query to verify genomics specialization
     */
    async testGenomicsKnowledge() {
        const testMessages = [{
            role: 'user',
            content: 'What is BRCA1 and what is its clinical significance?'
        }];

        try {
            let response = '';
            for await (const chunk of this.streamResponse(testMessages)) {
                response += chunk;
            }
            return {
                success: true,
                response: response.substring(0, 200) + '...'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get system status
     */
    async getSystemStatus() {
        const connection = await this.checkConnection();
        const models = connection.connected ? await this.getModels() : [];

        return {
            service: 'askEVO Genetic Assistant',
            url: this.getOllamaUrl(),
            connected: connection.connected,
            error: connection.error,
            availableModels: models.length,
            models: models,
            contextSize: this.conversationContext.length,
            timestamp: new Date().toISOString()
        };
    }
}

// Export singleton instance
export const ollamaService = new OllamaService();

// Export class for testing or multiple instances
export { OllamaService };

// Helper function to format genomics-specific responses
export const formatGenomicsResponse = (text) => {
    // Add visual separators for better readability
    return text
        .replace(/\*\*VARIANT:\*\*/g, '\n🧬 **VARIANT:**')
        .replace(/\*\*NOMENCLATURE:\*\*/g, '\n📋 **NOMENCLATURE:**')
        .replace(/\*\*IMPACT:\*\*/g, '\n🔬 **IMPACT:**')
        .replace(/\*\*FREQUENCY:\*\*/g, '\n📊 **FREQUENCY:**')
        .replace(/\*\*CLINICAL SIGNIFICANCE:\*\*/g, '\n⚕️ **CLINICAL SIGNIFICANCE:**')
        .replace(/\*\*RECOMMENDATION:\*\*/g, '\n💡 **RECOMMENDATION:**')
        .replace(/\*\*DISCLAIMER:\*\*/g, '\n⚠️ **DISCLAIMER:**');
};
