/**
 * @jest-environment jsdom
 */
import { TranslatorPage } from '../../js/pages/translator.js';

describe('TranslatorPage', () => {
    let translatorPage;
    
    beforeEach(() => {
        // Set up our HTML structure
        document.body.innerHTML = `
            <div id="translationView">
                <div id="chatBox"></div>
                <textarea id="userInput"></textarea>
                <button id="sendButton">Translate</button>
                <select id="formalityLevel">
                    <option value="casual">Casual / Informal</option>
                    <option value="polite-informal">Polite Informal</option>
                    <option value="formal-polite">Formal Polite</option>
                    <option value="very-formal">Very Formal & Respectful</option>
                </select>
                <input type="checkbox" id="detailedMode">
            </div>
        `;
        
        translatorPage = new TranslatorPage();
    });

    test('translates text with different formality levels', async () => {
        const mockResponses = {
            casual: { choices: [{ message: { content: '안녕' } }] },
            'polite-informal': { choices: [{ message: { content: '안녕하세요' } }] },
            'formal-polite': { choices: [{ message: { content: '안녕하십니까' } }] }
        };

        // Mock fetch for different formality levels
        global.fetch.mockImplementation((url, options) => {
            const body = JSON.parse(options.body);
            const formality = document.getElementById('formalityLevel').value;
            return Promise.resolve({
                json: () => Promise.resolve(mockResponses[formality])
            });
        });

        // Test different formality levels
        const testCases = [
            { formality: 'casual', expected: '안녕' },
            { formality: 'polite-informal', expected: '안녕하세요' },
            { formality: 'formal-polite', expected: '안녕하십니까' }
        ];

        for (const { formality, expected } of testCases) {
            // Set formality level
            document.getElementById('formalityLevel').value = formality;
            
            // Get translation
            const result = await translatorPage.getTranslation('hello');
            expect(result.translation).toBe(expected);
        }
    });

    test('provides detailed explanation when detailed mode is enabled', async () => {
        const mockDetailedResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        translation: '안녕하세요',
                        explanation: [
                            {
                                type: 'Key Phrases',
                                explanation: ['안녕하세요 (annyeonghaseyo) - Hello/Hi - Polite greeting']
                            },
                            {
                                type: 'Grammar Points',
                                explanation: 'Uses the polite -요 ending'
                            }
                        ]
                    })
                }
            }]
        };

        global.fetch.mockImplementation(() => 
            Promise.resolve({
                json: () => Promise.resolve(mockDetailedResponse)
            })
        );

        // Enable detailed mode
        document.getElementById('detailedMode').checked = true;

        const result = await translatorPage.getTranslation('hello');
        
        expect(result.translation).toBe('안녕하세요');
        expect(result.explanation).toHaveLength(2);
        expect(result.explanation[0].type).toBe('Key Phrases');
        expect(result.explanation[1].type).toBe('Grammar Points');
    });

    test('only returns translation when detailed mode is disabled', async () => {
        const mockSimpleResponse = {
            choices: [{
                message: {
                    content: '안녕하세요'
                }
            }]
        };

        global.fetch.mockImplementation(() => 
            Promise.resolve({
                json: () => Promise.resolve(mockSimpleResponse)
            })
        );

        // Ensure detailed mode is disabled
        document.getElementById('detailedMode').checked = false;

        const result = await translatorPage.getTranslation('hello');
        
        expect(result.translation).toBe('안녕하세요');
        expect(result.explanation).toBeNull();
    });

    test('adds messages to chat box', () => {
        const userText = 'Hello';
        const translation = '안녕하세요';
        const explanation = [{
            type: 'Key Phrases',
            explanation: ['안녕하세요 (annyeonghaseyo) - Hello']
        }];

        // Add user message
        translatorPage.addMessage(userText, null, null, true);
        
        // Add translation message
        translatorPage.addMessage(null, translation, explanation, false);

        const messages = document.querySelectorAll('.message');
        expect(messages).toHaveLength(2);
        
        const userMessage = messages[0];
        const botMessage = messages[1];

        expect(userMessage).toHaveClass('user-message');
        expect(userMessage.textContent).toBe(userText);

        expect(botMessage).toHaveClass('bot-message');
        expect(botMessage.textContent).toContain(translation);
        expect(botMessage.innerHTML).toContain('Key Phrases');
    });
}); 