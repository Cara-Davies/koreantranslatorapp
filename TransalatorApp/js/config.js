// Configuration management
export const config = {
    getApiKey() {
        // First try to get from environment variable
        if (typeof OPENAI_API_KEY !== 'undefined') {
            return OPENAI_API_KEY;
        }
        
        // Fallback to localStorage (for development)
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            throw new Error('API key not found in environment or local storage');
        }
        return apiKey;
    },

    // Only used in development
    setApiKey(key) {
        if (!key) {
            throw new Error('Invalid API key');
        }
        localStorage.setItem('openai_api_key', key);
    },

    removeApiKey() {
        localStorage.removeItem('openai_api_key');
    }
}; 