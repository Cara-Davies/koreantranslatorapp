export class WordStorageManager {
    constructor() {
        this.STORAGE_KEY = 'translatedWords';
        this.MAX_WORDS = 1000; // Maximum number of words to store
    }

    /**
     * Save translated words to local storage
     * @param {Object} wordData - Object containing word translations
     * @param {string} formality - Formality level used
     */
    saveWords(wordData, formality) {
        try {
            let storedWords = this.getStoredWords();
            
            // Add new words with timestamp and formality
            Object.entries(wordData.words).forEach(([english, data]) => {
                storedWords[english] = {
                    ...data,
                    formality,
                    timestamp: new Date().toISOString()
                };
            });

            // If we exceed the maximum number of words, remove the oldest entries
            const words = Object.entries(storedWords);
            if (words.length > this.MAX_WORDS) {
                // Sort by timestamp and keep only the most recent MAX_WORDS
                const sortedWords = words.sort((a, b) => 
                    new Date(b[1].timestamp) - new Date(a[1].timestamp)
                );
                storedWords = Object.fromEntries(sortedWords.slice(0, this.MAX_WORDS));
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedWords));
            return true;
        } catch (error) {
            console.error('Error saving words to storage:', error);
            return false;
        }
    }

    /**
     * Get all stored words from local storage
     * @returns {Object} Object containing all stored words
     */
    getStoredWords() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error retrieving words from storage:', error);
            return {};
        }
    }

    /**
     * Search for words in storage
     * @param {string} query - Search query
     * @param {string} formality - Optional formality level to filter by
     * @returns {Object} Matching words
     */
    searchWords(query, formality = null) {
        const words = this.getStoredWords();
        const searchLower = query.toLowerCase();
        
        return Object.entries(words).reduce((matches, [english, data]) => {
            if ((english.toLowerCase().includes(searchLower) || 
                 data.korean.toLowerCase().includes(searchLower)) &&
                (!formality || data.formality === formality)) {
                matches[english] = data;
            }
            return matches;
        }, {});
    }

    /**
     * Clear all stored words
     */
    clearStorage() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
} 