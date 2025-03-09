import { config } from './config.js';

export class ThemeManager {
    constructor() {
        console.log('ThemeManager initializing...');
        this.themeOptions = document.querySelectorAll('.theme-option');
        this.apiKeySection = document.querySelector('.settings-section:last-child');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveApiKeyButton = document.getElementById('saveApiKey');
        this.darkModeToggle = document.getElementById('darkMode');
        this.currentTheme = localStorage.getItem('theme') || 'blue';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (!this.themeOptions || !this.darkModeToggle || !this.apiKeyInput || !this.saveApiKeyButton) {
            console.error('Required elements not found!');
            return;
        }
        
        this.initializeTheme();
        this.initializeDarkMode();
        this.setupEventListeners();
        this.updateApiKeyVisibility();
    }

    initializeTheme() {
        console.log('Initializing theme:', this.currentTheme);
        this.applyTheme(this.currentTheme);
        this.updateActiveTheme();
    }

    initializeDarkMode() {
        console.log('Initializing dark mode:', this.isDarkMode);
        this.darkModeToggle.checked = this.isDarkMode;
        this.applyDarkMode(this.isDarkMode);
    }

    applyDarkMode(isDark) {
        if (isDark) {
            document.documentElement.setAttribute('data-mode', 'dark');
        } else {
            document.documentElement.removeAttribute('data-mode');
        }
        this.isDarkMode = isDark;
        localStorage.setItem('darkMode', isDark);
    }

    updateApiKeyVisibility() {
        try {
            const apiKey = config.getApiKey();
            // If we get here, API key exists
            if (this.apiKeySection) {
                this.apiKeySection.classList.add('api-key-set');
                this.apiKeyInput.style.display = 'none';
                this.saveApiKeyButton.style.display = 'none';
            }
        } catch {
            // No API key, show the input
            if (this.apiKeySection) {
                this.apiKeySection.classList.remove('api-key-set');
                this.apiKeyInput.style.display = 'block';
                this.saveApiKeyButton.style.display = 'block';
            }
        }
    }

    updateActiveTheme() {
        this.themeOptions.forEach(option => {
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Dark mode toggle
        this.darkModeToggle.addEventListener('change', (e) => {
            this.applyDarkMode(e.target.checked);
        });

        // Theme selection
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.applyTheme(theme);
                this.updateActiveTheme();
            });
        });

        // Save API key
        if (this.saveApiKeyButton && this.apiKeyInput) {
            this.saveApiKeyButton.addEventListener('click', () => {
                const apiKey = this.apiKeyInput.value.trim();
                if (apiKey) {
                    config.setApiKey(apiKey);
                    this.apiKeyInput.value = '';
                    this.updateApiKeyVisibility();
                }
            });
        }
        
        console.log('Event listeners set up successfully');
    }

    applyTheme(theme) {
        console.log('Applying theme:', theme);
        document.documentElement.removeAttribute('data-theme');
        if (theme !== 'blue') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        console.log('Theme applied and saved');
    }
} 