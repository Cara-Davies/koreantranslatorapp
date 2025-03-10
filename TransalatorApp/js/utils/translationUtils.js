import { config } from '../config.js';

/**
 * Breaks down Korean translation text and maps it to English words with formality level
 * @param {string} englishText - The original English text
 * @param {string} formality - The formality level (casual, polite-informal, formal-polite, very-formal)
 * @returns {Promise<Object>} Object mapping English words to Korean words with formality info
 */
export async function translationToWords(englishText, formality = 'polite-informal') {
    // Clean and split English text into words
    const englishWords = englishText.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Create the system prompt for word-by-word translation
    const systemPrompt = `You are a Korean language expert. For each English word, provide its Korean translation using ${formality} speech level.
    If the word requires a Korean particle, include it. Return ONLY a JSON array where each item has 'english', 'korean', and 'notes' keys.
    The 'notes' field should include any relevant particle information or formality markers.
    Example for "${formality}" level:
    For "I am happy" return [
        {"english":"I", "korean":"나는", "notes":"Subject particle 는/은 added"},
        {"english":"am", "korean":"", "notes":"Omitted in Korean"},
        {"english":"happy", "korean":"행복해요", "notes":"Polite ending 요 added"}
    ]`;

    try {
        // Make API call for word-by-word translation
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.getApiKey()}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: `Translate each word: ${englishWords.join(' ')}`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse the JSON response
        try {
            const wordPairs = JSON.parse(content);
            
            // Convert array to object mapping with additional information
            const result = {
                formality: formality,
                words: {}
            };

            wordPairs.forEach(pair => {
                result.words[pair.english] = {
                    korean: pair.korean,
                    notes: pair.notes
                };
            });

            console.log('Translation mapping:', result);
            return result;

        } catch (e) {
            console.error('Error parsing word pairs:', e);
            return { formality: formality, words: {} };
        }

    } catch (error) {
        console.error('Error getting word translations:', error);
        return { formality: formality, words: {} };
    }
} 