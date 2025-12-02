// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`;

class ApiService {
    constructor() {
        this.baseUrl = this.getApiUrl();
        this.token = localStorage.getItem('token');
    }

    getApiUrl() {
        return localStorage.getItem('genomicsApiUrl') || API_BASE_URL;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Chat Sessions
    async createChatSession(sessionName = 'New Chat') {
        const response = await fetch(`${this.getApiUrl()}/chat/sessions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ session_name: sessionName })
        });

        if (!response.ok) {
            throw new Error('Failed to create chat session');
        }

        return response.json();
    }

    async getChatSessions() {
        const response = await fetch(`${this.getApiUrl()}/chat/sessions`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch chat sessions');
        }

        return response.json();
    }

    async getSessionMessages(sessionId) {
        const response = await fetch(`${this.getApiUrl()}/chat/sessions/${sessionId}/messages`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        return response.json();
    }

    async saveMessage(sessionId, role, content) {
        const response = await fetch(`${this.getApiUrl()}/chat/messages`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                session_id: sessionId,
                role,
                content
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save message');
        }

        return response.json();
    }

    async updateMessageFeedback(messageId, feedbackType, feedbackText = '') {
        const response = await fetch(`${this.getApiUrl()}/chat/messages/${messageId}/feedback`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
                feedback_type: feedbackType,
                feedback_text: feedbackText
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update feedback');
        }

        return response.json();
    }

    // Authentication
    async login(email, password) {
        const response = await fetch(`${this.getApiUrl()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        this.setToken(data.token);
        return data;
    }

    async register(username, email, password) {
        const response = await fetch(`${this.getApiUrl()}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        this.setToken(data.token);
        return data;
    }
}

export const apiService = new ApiService();
