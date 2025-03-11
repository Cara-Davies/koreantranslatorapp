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

    showWordList(words) {
        console.log('Showing word list with words:', words);
        this.emptyWordBank.style.display = 'none';
        this.wordList.style.display = 'block';

        // Clear any existing content
        this.wordList.innerHTML = '';

        // Create tiles for each word
        Object.entries(words).forEach(([english, data]) => {
            const tile = document.createElement('div');
            tile.className = 'word-tile';

            const englishText = document.createElement('div');
            englishText.className = 'word-english';
            englishText.textContent = `${english} -> ${data.korean}`;

            const formalityText = document.createElement('div');
            formalityText.className = 'word-formality';
            formalityText.textContent = `Formality Level: ${data.formality}`;

            tile.appendChild(englishText);
            tile.appendChild(formalityText);
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