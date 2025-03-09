import { TranslatorPage } from './pages/translator.js';
import { WordBankPage } from './pages/wordbank.js';

export class App {
    constructor() {
        this.initializeNavigation();
        this.initializePages();
    }

    initializeNavigation() {
        this.navButtons = document.querySelectorAll('.nav-button');
        this.views = document.querySelectorAll('.view');

        this.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetView = button.dataset.view;
                this.navigateToView(targetView);
            });
        });
    }

    initializePages() {
        this.translatorPage = new TranslatorPage();
        this.wordBankPage = new WordBankPage();
    }

    navigateToView(viewId) {
        // Update active states
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        this.views.forEach(view => view.classList.remove('active'));
        
        // Activate target view and button
        document.getElementById(viewId).classList.add('active');
        document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 