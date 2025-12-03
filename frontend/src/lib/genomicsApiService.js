// Genomics API Service - Context Data Retrieval
const API_BASE_URL = import.meta.env.VITE_GENOMICS_API_URL || `http://${window.location.hostname}:3001/api`;

class GenomicsApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Variant Information
    async searchVariants(query) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/variants/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to search variants');
            return await response.json();
        } catch (error) {
            console.warn('Variant search failed:', error);
            return [];
        }
    }

    async getVariant(variantId) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/variants/${variantId}`);
            if (!response.ok) throw new Error('Failed to get variant');
            return await response.json();
        } catch (error) {
            console.warn('Get variant failed:', error);
            return null;
        }
    }

    // Disease Information
    async searchDiseases(query) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/diseases/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to search diseases');
            return await response.json();
        } catch (error) {
            console.warn('Disease search failed:', error);
            return [];
        }
    }

    async getDisease(diseaseId) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/diseases/${diseaseId}`);
            if (!response.ok) throw new Error('Failed to get disease');
            return await response.json();
        } catch (error) {
            console.warn('Get disease failed:', error);
            return null;
        }
    }

    // Diagnostic Tests
    async searchTests(query) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/tests/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to search tests');
            return await response.json();
        } catch (error) {
            console.warn('Test search failed:', error);
            return [];
        }
    }

    async getTest(testId) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/tests/${testId}`);
            if (!response.ok) throw new Error('Failed to get test');
            return await response.json();
        } catch (error) {
            console.warn('Get test failed:', error);
            return null;
        }
    }

    // Associations
    async getVariantDiseaseAssociation(variantId) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/associations/variant/${variantId}`);
            if (!response.ok) throw new Error('Failed to get associations');
            return await response.json();
        } catch (error) {
            console.warn('Get associations failed:', error);
            return [];
        }
    }

    async getDiseaseTests(diseaseId) {
        try {
            const response = await fetch(`${this.baseUrl}/genomics/diseases/${diseaseId}/tests`);
            if (!response.ok) throw new Error('Failed to get disease tests');
            return await response.json();
        } catch (error) {
            console.warn('Get disease tests failed:', error);
            return [];
        }
    }

    // Context Building Helper
    async buildContext(userMessage) {
        let context = '';

        // Pattern detection
        const variantMatch = userMessage.match(/variant|mutation|SNP|gene\s+[A-Z]+|rs\d+|BRCA|TP53/i);
        const diseaseMatch = userMessage.match(/disease|disorder|condition|syndrome|cancer|diabetes/i);
        const testMatch = userMessage.match(/test|screening|diagnosis|diagnostic|sequencing/i);

        // Fetch relevant data
        if (variantMatch) {
            const variants = await this.searchVariants(userMessage);
            if (variants?.length > 0) {
                context += `Relevant Variants: ${JSON.stringify(variants.slice(0, 2))}\n`;
            }
        }

        if (diseaseMatch) {
            const diseases = await this.searchDiseases(userMessage);
            if (diseases?.length > 0) {
                context += `Relevant Diseases: ${JSON.stringify(diseases.slice(0, 2))}\n`;
            }
        }

        if (testMatch) {
            const tests = await this.searchTests(userMessage);
            if (tests?.length > 0) {
                context += `Relevant Tests: ${JSON.stringify(tests.slice(0, 2))}\n`;
            }
        }

        return context;
    }
}

export const genomicsApiService = new GenomicsApiService();
