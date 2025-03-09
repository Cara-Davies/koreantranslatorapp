import { config } from './config.js';

export class ThemeManager {
    constructor() {
        console.log('ThemeManager initializing...');
        this.themeOptions = document.querySelectorAll('.theme-option');
        this.darkModeToggle = document.getElementById('darkMode');
        this.currentTheme = localStorage.getItem('theme') || 'blue';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (!this.themeOptions || !this.darkModeToggle) {
            console.error('Required elements not found!');
            return;
        }
        
        this.initializeTheme();
        this.initializeDarkMode();
        this.setupEventListeners();
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