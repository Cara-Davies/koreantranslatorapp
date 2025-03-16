export class WordStorageManager {
    constructor() {
        this.STORAGE_KEY = 'translatedWords';
        this.MAX_WORDS = 1000; // Maximum number of words to store
        this.FORMALITY_LEVELS = ['casual', 'polite-informal', 'formal-polite', 'very-formal'];
    }

    /**
     * Save translated words to local storage
     * @param {Object} wordData - Object containing word translations
     * @param {string} formality - Formality level used
     */
    saveWords(wordData, formality) {
        try {
            let storedWords = this.getStoredWords();
            
            // Add new words or update existing ones with new formality translations
            Object.entries(wordData.words).forEach(([english, data]) => {
                // Skip if:
                // 1. English word is empty/whitespace
                // 2. Korean translation is empty/whitespace
                // 3. Korean translation is just punctuation or special characters
                // 4. No tags provided
                if (!english.trim() || 
                    !data.korean || 
                    !data.korean.trim() || 
                    /^[.,!?;:'"()\s\-]+$/.test(data.korean.trim()) ||
                    !Array.isArray(data.tags) || data.tags.length === 0) {
                    
                    const reason = !Array.isArray(data.tags) || data.tags.length === 0 ? 
                        'No tags provided' : 'Invalid word or translation';
                    console.log(`Skipping word "${english}":`, reason);
                    return;
                }

                // If word exists, check if we have this formality level already
                if (english in storedWords) {
                    const existingTranslations = storedWords[english].translations;
                    
                    // Check if we already have this formality level
                    const hasFormality = existingTranslations.some(t => t.formality === formality);
                    if (hasFormality) {
                        console.log(`Skipping word "${english}": Already has ${formality} translation`);
                        return;
                    }

                    // Add new formality translation
                    existingTranslations.push({
                        formality: formality,
                        korean: data.korean.trim(),
                        notes: data.notes || '',
                        timestamp: new Date().toISOString()
                    });
                    
                    // Update tags if they don't exist or if we have new ones
                    if (!storedWords[english].tags || storedWords[english].tags.length === 0) {
                        storedWords[english].tags = data.tags.slice(0, 5);
                    }
                    console.log(`Added ${formality} translation for existing word "${english}" with tags:`, storedWords[english].tags);
                } else {
                    // Create new word entry with first translation and tags
                    storedWords[english] = {
                        english: english,
                        tags: data.tags.slice(0, 5),
                        translations: [{
                            formality: formality,
                            korean: data.korean.trim(),
                            notes: data.notes || '',
                            timestamp: new Date().toISOString()
                        }]
                    };
                    console.log(`Added new word "${english}" with ${formality} translation and tags:`, data.tags);
                }
            });

            // If we exceed the maximum number of words, remove the oldest entries
            // Now we'll base this on the timestamp of the most recent translation for each word
            const words = Object.entries(storedWords).map(([english, data]) => ({
                english,
                data,
                latestTimestamp: Math.max(...data.translations.map(t => new Date(t.timestamp)))
            }));

            if (words.length > this.MAX_WORDS) {
                // Sort by latest timestamp and keep only the most recent MAX_WORDS
                const sortedWords = words
                    .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
                    .slice(0, this.MAX_WORDS);
                storedWords = sortedWords.reduce((acc, {english, data}) => {
                    acc[english] = data;
                    return acc;
                }, {});
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
            if (!stored) return {};

            const words = JSON.parse(stored);
            
            // Convert old format to new format if necessary
            Object.entries(words).forEach(([english, data]) => {
                if (!data.translations) {
                    words[english] = {
                        english: english,
                        translations: [{
                            formality: data.formality,
                            korean: data.korean,
                            notes: data.notes || '',
                            timestamp: data.timestamp
                        }]
                    };
                }
            });
            
            return words;
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
            const matchingTranslations = data.translations.filter(t => 
                (!formality || t.formality === formality) &&
                (english.toLowerCase().includes(searchLower) || 
                 t.korean.toLowerCase().includes(searchLower))
            );
            
            if (matchingTranslations.length > 0) {
                matches[english] = {
                    ...data,
                    translations: matchingTranslations
                };
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