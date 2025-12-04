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
            body: JSON.stringify({ session_title: sessionName }) // Changed from session_name
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

        const data = await response.json();
        return data.sessions || []; // Return sessions array
    }

    async getSessionMessages(sessionId) {
        const response = await fetch(`${this.getApiUrl()}/chat/sessions/${sessionId}/messages`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        return data.messages || []; // Return messages array
    }

    async saveMessage(sessionId, role, content) {
        const response = await fetch(`${this.getApiUrl()}/chat/messages`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                session_id: sessionId,
                sender_type: role, // Changed from role to sender_type
                message_text: content, // Changed from content to message_text
                message_type: 'text'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save message');
        }

        return response.json();
    }

    async renameSession(sessionId, newName) {
        const response = await fetch(`${this.getApiUrl()}/chat/sessions/${sessionId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ session_title: newName })
        });

        if (!response.ok) {
            throw new Error('Failed to rename session');
        }

        return response.json();
    }

    async deleteSession(sessionId) {
        const response = await fetch(`${this.getApiUrl()}/chat/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete session');
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

    async register(userData) {
        const response = await fetch(`${this.getApiUrl()}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async sendOtp(email, type = 'login') {
        const response = await fetch(`${this.getApiUrl()}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, type })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send OTP');
        }

        return response.json();
    }

    async verifyOtp(email, otp) {
        const response = await fetch(`${this.getApiUrl()}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'OTP verification failed');
        }

        return response.json();
    }
}

export const apiService = new ApiService();
