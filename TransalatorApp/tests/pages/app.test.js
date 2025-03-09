/**
 * @jest-environment jsdom
 */
import { App } from '../../js/app.js';
import { TranslatorPage } from '../../js/pages/translator.js';
import { WordBankPage } from '../../js/pages/wordbank.js';

describe('App Navigation', () => {
    let app;
    
    beforeEach(() => {
        // Set up our HTML structure
        document.body.innerHTML = `
            <div class="app-container">
                <div id="translationView" class="view active">
                    <div class="translation-area">
                        <div id="chatBox"></div>
                    </div>
                    <div class="input-container">
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
                </div>
                <div id="wordBankView" class="view"></div>
                <nav class="nav-bar">
                    <button class="nav-button active" data-view="translationView">Translate</button>
                    <button class="nav-button" data-view="wordBankView">Word Bank</button>
                </nav>
            </div>
        `;
        
        app = new App();
    });

    test('initializes with translation view active', () => {
        const translationView = document.getElementById('translationView');
        const wordBankView = document.getElementById('wordBankView');
        
        expect(translationView).toHaveClass('active');
        expect(wordBankView).not.toHaveClass('active');
    });

    test('switches to word bank view when clicking word bank button', () => {
        const wordBankButton = document.querySelector('[data-view="wordBankView"]');
        wordBankButton.click();

        const translationView = document.getElementById('translationView');
        const wordBankView = document.getElementById('wordBankView');
        
        expect(translationView).not.toHaveClass('active');
        expect(wordBankView).toHaveClass('active');
    });

    test('switches back to translation view when clicking translate button', () => {
        // First switch to word bank
        const wordBankButton = document.querySelector('[data-view="wordBankView"]');
        wordBankButton.click();

        // Then switch back to translation
        const translateButton = document.querySelector('[data-view="translationView"]');
        translateButton.click();

        const translationView = document.getElementById('translationView');
        const wordBankView = document.getElementById('wordBankView');
        
        expect(translationView).toHaveClass('active');
        expect(wordBankView).not.toHaveClass('active');
    });

    test('nav bar remains visible after adding translations', () => {
        const chatBox = document.getElementById('chatBox');
        const navBar = document.querySelector('.nav-bar');
        
        // Add multiple messages to simulate a conversation
        for (let i = 0; i < 10; i++) {
            const message = document.createElement('div');
            message.className = i % 2 === 0 ? 'message user-message' : 'message bot-message';
            message.textContent = `Test message ${i + 1}`;
            chatBox.appendChild(message);
        }

        // Verify nav bar is still visible
        expect(navBar).toBeVisible();
        expect(window.getComputedStyle(navBar).display).not.toBe('none');
        
        // Verify nav bar is at the bottom
        const navBarRect = navBar.getBoundingClientRect();
        const containerRect = document.querySelector('.app-container').getBoundingClientRect();
        expect(Math.round(navBarRect.bottom)).toBeLessThanOrEqual(Math.round(containerRect.bottom));
    });
}); 