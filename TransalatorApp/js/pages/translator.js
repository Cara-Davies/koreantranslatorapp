import { config } from '../config.js';

// Translator page functionality
export class TranslatorPage {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.checkApiKey();
    }

    initializeElements() {
        this.chatBox = document.getElementById('chatBox');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.fromLanguage = document.getElementById('fromLanguage');
        this.toLanguage = document.getElementById('toLanguage');
        this.formalityLevel = document.getElementById('formalityLevel');
        this.detailedMode = document.getElementById('detailedMode');

        // API Configuration
        this.API_URL = 'https://api.openai.com/v1/chat/completions';

        // Formality level descriptions
        this.formalityDescriptions = {
            'casual': 'casual/informal speech level',
            'polite-informal': 'polite informal speech level',
            'formal-polite': 'formal polite speech level',
            'very-formal': 'very formal and respectful speech level'
        };
    }

    checkApiKey() {
        try {
            config.getApiKey();
            this.enableTranslation();
        } catch (error) {
            this.disableTranslation();
            this.showApiKeyPrompt();
        }
    }

    enableTranslation() {
        this.sendButton.disabled = false;
        this.userInput.disabled = false;
        this.userInput.placeholder = "Enter English text to translate...";
    }

    disableTranslation() {
        this.sendButton.disabled = true;
        this.userInput.disabled = true;
        this.userInput.placeholder = "Please set your API key to start translating...";
    }

    showApiKeyPrompt() {
        const apiKey = prompt("Please enter your OpenAI API key to use the translator:");
        if (apiKey) {
            config.setApiKey(apiKey);
            this.checkApiKey();
        }
    }

    attachEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleTranslate());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent new line
                this.handleTranslate();
            }
        });
    }

    addMessage(originalText, translatedText, explanation = null, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (isUser) {
            messageDiv.textContent = originalText;
        } else {
            let content = `<strong>Translation (${this.formalityDescriptions[this.formalityLevel.value]}):</strong><br>${translatedText}`;
            
            if (explanation) {
                content += `
                    <div class="explanation-section">
                        <h4>Detailed Explanation:</h4>
                        ${explanation.map(item => {
                            // Skip empty explanations
                            if (!item.explanation || 
                                (Array.isArray(item.explanation) && item.explanation.length === 0) ||
                                (typeof item.explanation === 'string' && item.explanation.trim() === '')) {
                                return '';
                            }

                            if (item.type === 'Key Phrases') {
                                // Handle key phrases with bullet points
                                const phrases = Array.isArray(item.explanation) ? item.explanation : [item.explanation];
                                if (phrases.length === 0) return '';
                                
                                return `
                                    <div class="explanation-item">
                                        <strong>${item.type}:</strong>
                                        <ul class="phrase-list">
                                            ${phrases.map(phrase => `<li>${phrase.trim().replace(/^[•\s]+/, '')}</li>`).join('')}
                                        </ul>
                                    </div>
                                `;
                            } else {
                                // Handle other types normally
                                return `
                                    <div class="explanation-item">
                                        <strong>${item.type}:</strong> ${item.explanation}
                                    </div>
                                `;
                            }
                        }).filter(Boolean).join('')}
                    </div>
                `;
            }
            
            messageDiv.innerHTML = content;
        }
        
        this.chatBox.appendChild(messageDiv);
        
        // Ensure the new message is visible
        setTimeout(() => {
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100); // Small delay to ensure animation works properly
    }

    async getTranslation(text) {
        try {
            const formality = this.formalityLevel.value;
            const isDetailed = this.detailedMode.checked;
            
            const systemPrompt = isDetailed 
                ? `You are a professional Korean translator and language expert. Translate the text from English to Korean using ${this.formalityDescriptions[formality]}. 
                   Return your response in this exact JSON format without any additional text:
                   {
                       "translation": "Korean translation here",
                       "explanation": [
                           {
                               "type": "Key Phrases",
                               "explanation": [
                                   "Korean Word/Phrase 1 (English meaning) - Additional context or usage notes",
                                   "Korean Word/Phrase 2 (English meaning) - Additional context or usage notes"
                               ]
                           },
                           {"type": "Grammar Points", "explanation": "Explain any notable grammar structures used"},
                           {"type": "Cultural Notes", "explanation": "Add relevant cultural context if applicable"}
                       ]
                   }`
                : `You are a professional Korean translator. Translate the text from English to Korean using ${this.formalityDescriptions[formality]}. Only provide the Korean translation without any additional explanation or notes.`;

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.getApiKey()}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: text
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            if (isDetailed) {
                try {
                    // Try to find and parse only the JSON part
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsedResponse = JSON.parse(jsonMatch[0]);
                        // Filter out any sections with empty explanations
                        if (parsedResponse.explanation) {
                            parsedResponse.explanation = parsedResponse.explanation.filter(item => 
                                item.explanation && 
                                (Array.isArray(item.explanation) ? item.explanation.length > 0 : item.explanation.trim() !== '')
                            );
                        }
                        return {
                            translation: parsedResponse.translation,
                            explanation: parsedResponse.explanation
                        };
                    } else {
                        throw new Error('No valid JSON found in response');
                    }
                } catch (e) {
                    console.error('JSON parsing error:', e);
                    // Fallback: try to extract translation if JSON parsing fails
                    const translationMatch = content.match(/"translation":\s*"([^"]*)"/);
                    return {
                        translation: translationMatch ? translationMatch[1] : content,
                        explanation: null
                    };
                }
            } else {
                return {
                    translation: content,
                    explanation: null
                };
            }
        } catch (error) {
            console.error('Error:', error);
            return {
                translation: 'Sorry, there was an error processing your translation request.',
                explanation: null
            };
        }
    }

    async handleTranslate() {
        const text = this.userInput.value.trim();
        if (text === '') return;

        // Add original text to chat
        this.addMessage(text, null, null, true);
        this.userInput.value = '';

        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message';
        loadingDiv.textContent = 'Translating...';
        this.chatBox.appendChild(loadingDiv);
        loadingDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });

        // Get translation
        const result = await this.getTranslation(text);
        
        // Remove loading message
        this.chatBox.removeChild(loadingDiv);
        
        // Add translation
        this.addMessage(null, result.translation, result.explanation, false);
    }
} 