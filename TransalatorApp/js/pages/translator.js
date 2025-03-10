import { config } from '../config.js';
import { translationToWords } from '../utils/translationUtils.js';

// Translator page functionality
export class TranslatorPage {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
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
        this.outputSection = document.querySelector('.output-section');
        this.detailedToggle = document.querySelector('#detailedToggle');
        this.formalityButton = document.querySelector('#formalityButton');
        this.formalityModal = document.querySelector('.formality-modal');
        this.formalityModalClose = document.querySelector('.formality-modal-close');
        this.formalityOptions = document.querySelectorAll('.formality-option');
        this.formalityLabel = document.querySelector('.formality-label');
        this.loadingIndicator = document.getElementById('loadingIndicator');

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

    setupEventListeners() {
        // Translation events
        this.sendButton.addEventListener('click', () => this.handleTranslate());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent new line
                this.handleTranslate();
            }
        });

        // Formality modal events
        this.formalityButton.addEventListener('click', () => this.openFormalityModal());
        this.formalityModalClose.addEventListener('click', () => this.closeFormalityModal());
        this.formalityModal.querySelector('.formality-modal-overlay').addEventListener('click', () => this.closeFormalityModal());

        this.formalityOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                this.updateFormalitySelection(value);
                this.closeFormalityModal();
            });
        });
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

    addMessage(originalText, translatedText, explanation = null, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (isUser) {
            messageDiv.textContent = originalText;
        } else {
            let content = `<strong>Translation (${this.formalityDescriptions[this.formalityLevel.value]}):</strong><br>${translatedText}`;
            
            // Only show explanation section if we have valid explanations and detailed mode is on
            if (explanation && Array.isArray(explanation) && explanation.length > 0 && this.detailedMode.checked) {
                const validExplanations = explanation.filter(item => {
                    if (!item || !item.type || !item.explanation) return false;
                    if (Array.isArray(item.explanation)) {
                        return item.explanation.length > 0 && item.explanation.some(exp => exp && exp.trim() !== '');
                    }
                    return typeof item.explanation === 'string' && item.explanation.trim() !== '';
                });

                if (validExplanations.length > 0) {
                    content += `
                        <div class="explanation-section">
                            ${validExplanations.map(item => {
                                if (item.type === 'Key Phrases') {
                                    // Handle key phrases with bullet points
                                    const phrases = Array.isArray(item.explanation) ? item.explanation : [item.explanation];
                                    const validPhrases = phrases.filter(phrase => phrase && phrase.trim() !== '');
                                    
                                    if (validPhrases.length === 0) return '';
                                    
                                    return `
                                        <div class="explanation-item">
                                            <strong>${item.type}:</strong>
                                            <ul class="phrase-list">
                                                ${validPhrases.map(phrase => {
                                                    // Clean up the phrase and ensure proper formatting
                                                    const cleanPhrase = phrase.trim()
                                                        .replace(/^[•\s-]+/, '')  // Remove leading bullets or dashes
                                                        .replace(/^([^(]+)\(([^)]+)\)(.*)$/, '<span class="korean">$1</span> <span class="meaning">($2)</span>$3'); // Format Korean and meaning
                                                    return `<li>${cleanPhrase}</li>`;
                                                }).join('')}
                                            </ul>
                                        </div>
                                    `;
                                } else if (item.type === 'Error') {
                                    // Handle error messages with special styling
                                    return `
                                        <div class="explanation-item error">
                                            <strong>${item.type}:</strong>
                                            <p>${item.explanation}</p>
                                        </div>
                                    `;
                                } else if (item.type === 'Note') {
                                    // Handle informational notes with special styling
                                    return `
                                        <div class="explanation-item note">
                                            <strong>${item.type}:</strong>
                                            <p>${item.explanation}</p>
                                        </div>
                                    `;
                                } else {
                                    // Handle other types (Grammar Points, Cultural Notes)
                                    return `
                                        <div class="explanation-item">
                                            <strong>${item.type}:</strong>
                                            <p>${item.explanation}</p>
                                        </div>
                                    `;
                                }
                            }).filter(Boolean).join('')}
                        </div>
                    `;
                }
            }
            
            messageDiv.innerHTML = content;
        }
        
        this.chatBox.appendChild(messageDiv);
        
        // Ensure the new message is visible
        setTimeout(() => {
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }

    async getTranslation(text) {
        try {
            const formality = this.formalityLevel.value;
            const isDetailed = this.detailedMode.checked;
            
            // Enhanced formality descriptions with more specific instructions
            const formalityInstructions = {
                'casual': 'Use the most casual/informal speech level (반말) as if speaking to a close friend or family member. For longer sentences, maintain the casual form throughout and avoid mixing with polite endings. Use 아/어 endings, not 요 endings. Example format: "하다" -> "해", not "해요".',
                'polite-informal': 'Use the polite informal speech level (해요체) appropriate for everyday conversations with acquaintances or colleagues. End sentences with 요.',
                'formal-polite': 'Use the formal polite speech level (합쇼체) suitable for business and professional settings. End sentences with 습니다/ㅂ니다.',
                'very-formal': 'Use the most formal and respectful speech level with appropriate honorifics for highly formal situations or when addressing seniors or authority figures.'
            };
            
            const systemPrompt = isDetailed 
                ? `You are a professional Korean translator and language expert specializing in maintaining consistent speech levels. ${formalityInstructions[formality]}
                   
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
                           {"type": "Grammar Points", "explanation": "Explain any notable grammar structures used and how the speech level is maintained"},
                           {"type": "Cultural Notes", "explanation": "Add relevant cultural context if applicable"}
                       ]
                   }`
                : `You are a professional Korean translator specializing in maintaining consistent speech levels. ${formalityInstructions[formality]} Only provide the Korean translation without any additional explanation or notes.`;

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
                            
                            // If all explanations were filtered out, return a specific error
                            if (parsedResponse.explanation.length === 0) {
                                return {
                                    translation: parsedResponse.translation,
                                    explanation: [{
                                        type: "Note",
                                        explanation: "No detailed explanations were provided for this translation. This might happen with very simple phrases or when the model doesn't detect any notable grammar points or cultural context to explain."
                                    }]
                                };
                            }
                        } else {
                            // If no explanation array was provided
                            return {
                                translation: parsedResponse.translation,
                                explanation: [{
                                    type: "Note",
                                    explanation: "The translation was successful, but detailed explanations could not be generated. Try rephrasing your text or check if it's complex enough to warrant detailed explanations."
                                }]
                            };
                        }
                        return parsedResponse;
                    } else {
                        throw new Error('No valid JSON found in response');
                    }
                } catch (e) {
                    console.error('JSON parsing error:', e);
                    return {
                        translation: content,
                        explanation: [{
                            type: "Error",
                            explanation: "There was an issue generating detailed explanations. The translation is shown above, but detailed mode may not work with this input."
                        }]
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
                explanation: [{
                    type: "Error",
                    explanation: "An error occurred while translating. Please try again or check your internet connection."
                }]
            };
        }
    }

    showLoading() {
        this.loadingIndicator.classList.add('active');
        this.sendButton.disabled = true;
        // Ensure loading indicator is visible
        setTimeout(() => {
            this.loadingIndicator.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }

    hideLoading() {
        this.loadingIndicator.classList.remove('active');
        this.sendButton.disabled = false;
    }

    async handleTranslate() {
        const text = this.userInput.value.trim();
        if (text === '') return;

        try {
            // Add original text to chat
            this.addMessage(text, null, null, true);

            // Clear input
            this.userInput.value = '';

            // Move loading indicator after the user's message
            this.chatBox.appendChild(this.loadingIndicator);
            
            // Show loading state and ensure it's visible
            this.showLoading();

            // Get main translation
            const { translation, explanation } = await this.getTranslation(text);
            
            // Get word-by-word translations with formality level
            const wordPairs = await translationToWords(text, this.formalityLevel.value);

            // Add translation to chat
            this.addMessage(text, translation, explanation);
        } catch (error) {
            console.error('Translation error:', error);
            this.addMessage(
                text,
                'Sorry, there was an error processing your translation. Please try again.',
                null
            );
        } finally {
            // Hide loading state
            this.hideLoading();
        }
    }

    openFormalityModal() {
        this.formalityModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update active state
        const currentValue = this.formalityLevel.value;
        this.formalityOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.value === currentValue);
        });
    }

    closeFormalityModal() {
        this.formalityModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateFormalitySelection(value) {
        this.formalityLevel.value = value;
        const selectedOption = Array.from(this.formalityLevel.options)
            .find(option => option.value === value);
        this.formalityLabel.textContent = selectedOption.textContent;
    }
} 