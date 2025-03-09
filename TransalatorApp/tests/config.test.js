import { config } from '../js/config.js';

describe('Config', () => {
    beforeEach(() => {
        // Clear localStorage and reset config before each test
        localStorage.clear();
        config.apiKey = null;
    });

    test('loads API key from localStorage if available', () => {
        const testKey = 'test-api-key';
        localStorage.setItem('openai_api_key', testKey);
        
        config.loadApiKey();
        expect(config.getApiKey()).toBe(testKey);
    });

    test('throws error when API key is not set', () => {
        expect(() => config.getApiKey()).toThrow('OpenAI API key not found');
    });

    test('sets API key in localStorage when setting new key', () => {
        const testKey = 'new-test-key';
        config.setApiKey(testKey);
        
        expect(localStorage.getItem('openai_api_key')).toBe(testKey);
        expect(config.getApiKey()).toBe(testKey);
    });

    test('uses environment variable if available', () => {
        const testKey = 'env-test-key';
        global.OPENAI_API_KEY = testKey;
        
        config.loadApiKey();
        expect(config.getApiKey()).toBe(testKey);
        
        delete global.OPENAI_API_KEY;
    });
}); 