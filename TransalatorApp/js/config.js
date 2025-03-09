// Configuration management
export const config = {
    getApiKey() {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            throw new Error('API key not found');
        }
        return apiKey;
    },

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