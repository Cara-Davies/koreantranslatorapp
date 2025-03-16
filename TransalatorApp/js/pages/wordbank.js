import { WordStorageManager } from '../utils/wordStorageManager.js';

// Word Bank page functionality
export class WordBankPage {
    constructor() {
        console.log('Initializing WordBankPage');
        this.wordStorage = new WordStorageManager();
        this.emptyWordBank = document.getElementById('emptyWordBank');
        this.wordList = document.getElementById('wordList');
        this.startTranslatingButton = document.getElementById('startTranslatingButton');

        this.checkStoredWords();
        this.setupEventListeners();
    }

    checkStoredWords() {
        console.log('Checking stored words');
        const storedWords = this.wordStorage.getStoredWords();
        console.log('Stored words:', storedWords);
        if (Object.keys(storedWords).length === 0) {
            this.showEmptyState();
        } else {
            this.showWordList(storedWords);
        }
    }

    showEmptyState() {
        console.log('Showing empty state');
        this.emptyWordBank.style.display = 'block';
        this.wordList.style.display = 'none';
    }

    formatFormalityLabel(formality) {
        switch(formality) {
            case 'casual': return 'Casual';
            case 'polite-informal': return 'Polite';
            case 'formal-polite': return 'Formal';
            case 'very-formal': return 'Very Formal';
            default: return formality;
        }
    }

    showWordList(words) {
        console.log('Showing word list with words:', words);
        this.emptyWordBank.style.display = 'none';
        this.wordList.style.display = 'grid';

        // Clear any existing content
        this.wordList.innerHTML = '';

        // Create tiles for each word
        Object.entries(words).forEach(([english, data]) => {
            const tile = document.createElement('div');
            tile.className = 'word-tile';

            // Create header with English word
            const header = document.createElement('h3');
            header.className = 'word-english';
            header.textContent = english;
            tile.appendChild(header);

            // Create translations list
            const translationsList = document.createElement('ul');
            translationsList.className = 'translations-list';

            // Sort translations by formality level
            const sortedTranslations = [...data.translations].sort((a, b) => {
                const formalityOrder = {
                    'casual': 0,
                    'polite-informal': 1,
                    'formal-polite': 2,
                    'very-formal': 3
                };
                return formalityOrder[a.formality] - formalityOrder[b.formality];
            });

            // Add each translation as a list item
            sortedTranslations.forEach(translation => {
                const listItem = document.createElement('li');
                listItem.className = 'translation-item';
                
                const formalitySpan = document.createElement('span');
                formalitySpan.className = 'translation-formality';
                formalitySpan.textContent = this.formatFormalityLabel(translation.formality);
                
                const koreanSpan = document.createElement('span');
                koreanSpan.className = 'translation-korean';
                koreanSpan.textContent = translation.korean;
                
                listItem.appendChild(formalitySpan);
                listItem.appendChild(document.createTextNode(': '));
                listItem.appendChild(koreanSpan);
                
                translationsList.appendChild(listItem);
            });

            tile.appendChild(translationsList);

            // Add tags below translations if they exist
            if (data.tags && data.tags.length > 0) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'word-tags';
                data.tags.forEach(tag => {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'word-tag';
                    // Capitalize the tag
                    tagSpan.textContent = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                    tagsContainer.appendChild(tagSpan);
                });
                tile.appendChild(tagsContainer);
            }

            this.wordList.appendChild(tile);
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        this.startTranslatingButton.addEventListener('click', () => {
            this.navigateToTranslationPage();
        });
    }

    navigateToTranslationPage() {
        console.log('Navigating to translation page');
        const translationView = document.getElementById('translationView');
        const wordBankView = document.getElementById('wordBankView');
        const navButtons = document.querySelectorAll('.nav-button');

        // Hide Word Bank view and show Translation view
        wordBankView.classList.remove('active');
        translationView.classList.add('active');

        // Update navigation bar active state
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector('[data-view="translationView"]').classList.add('active');
    }
} 