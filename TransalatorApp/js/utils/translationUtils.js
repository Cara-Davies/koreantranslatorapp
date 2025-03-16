import { config } from '../config.js';

/**
 * Check if a word is likely a proper name
 * @param {string} word - The word to check
 * @param {boolean} isFirstWord - Whether this is the first word in a sentence
 * @returns {boolean} True if the word is likely a proper name
 */
function isLikelyName(word, isFirstWord) {
    // Skip empty words
    if (!word || !word.trim()) return false;
    
    word = word.trim();
    
    // If it's not the first word and starts with a capital letter, likely a name
    if (!isFirstWord && /^[A-Z][a-z]+$/.test(word)) {
        return true;
    }
    
    // Common name endings that might indicate a name
    const nameEndings = ['ie', 'y', 'ey', 'ly', 'a', 'ia'];
    if (nameEndings.some(ending => word.toLowerCase().endsWith(ending)) && 
        /^[A-Z][a-z]+$/.test(word)) {
        return true;
    }
    
    return false;
}

/**
 * Breaks down Korean translation text and maps it to English words with formality level
 * @param {string} englishText - The original English text
 * @param {string} formality - The formality level (casual, polite-informal, formal-polite, very-formal)
 * @returns {Promise<Object>} Object mapping English words to Korean words with formality info
 */
export async function translationToWords(englishText, formality = 'polite-informal') {
    // Clean and split English text into words
    const englishWords = englishText.trim().split(/[.!?]+\s*/).map(sentence => 
        sentence.trim().split(/\s+/).filter(word => word.length > 0)
    );
    
    // Flatten the array but keep track of first words in sentences
    const wordsWithContext = englishWords.flatMap((sentence, i) => 
        sentence.map((word, j) => ({
            word,
            isFirstWord: j === 0
        }))
    ).filter(({word}) => word.length > 0);
    
    // Filter out likely names before translation
    const wordsToTranslate = wordsWithContext.filter(({word, isFirstWord}) => {
        if (isLikelyName(word, isFirstWord)) {
            console.log('Skipping likely name:', word);
            return false;
        }
        return true;
    });

    if (wordsToTranslate.length === 0) {
        return { formality: formality, words: {} };
    }

    // Create the system prompt for word-by-word translation
    const systemPrompt = `You are a Korean language expert. For each English word, provide its Korean translation using ${formality} speech level.
    If the word requires a Korean particle, include it. Return ONLY a JSON array where each item has 'english', 'korean', 'notes', and 'tags' keys.
    The 'notes' field should include any relevant particle information or formality markers.
    The 'tags' field should be an array of relevant tags (max 5) from these categories: verb, noun, adverb, adjective, time, location, particle, food, sport, greeting, country, emotion, number, color, weather, family, body, clothing, animal, nature.
    Example for "${formality}" level:
    For "I am happy" return [
        {"english":"I", "korean":"나는", "notes":"Subject particle 는/은 added", "tags":["noun", "pronoun"]},
        {"english":"am", "korean":"", "notes":"Omitted in Korean", "tags":["verb"]},
        {"english":"happy", "korean":"행복해요", "notes":"Polite ending 요 added", "tags":["adjective", "emotion"]}
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
                        content: `Translate each word: ${wordsToTranslate.map(w => w.word).join(' ')}`
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
                // Skip if:
                // 1. English word is missing/empty
                // 2. Korean translation is missing/empty/just whitespace
                // 3. Korean translation is '?' (invalid)
                // 4. Korean translation contains only punctuation or special characters
                // 5. No tags provided
                if (!pair.english || !pair.korean || 
                    !pair.english.trim() || !pair.korean.trim() || 
                    pair.korean === '?' ||
                    pair.korean.trim() === '' ||
                    /^[.,!?;:'"()\s\-]+$/.test(pair.korean.trim()) ||
                    !Array.isArray(pair.tags) || pair.tags.length === 0) {
                    console.log('Skipping invalid translation:', pair);
                    return;
                }
                
                result.words[pair.english] = {
                    korean: pair.korean.trim(),
                    notes: pair.notes || '',
                    tags: pair.tags.slice(0, 5) // Ensure max 5 tags
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