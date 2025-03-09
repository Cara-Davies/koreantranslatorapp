import { ThemeManager } from '../js/theme.js';

describe('ThemeManager', () => {
    let themeManager;
    
    // Mock DOM elements
    beforeEach(() => {
        document.body.innerHTML = `
            <button id="themeButton">
                <span class="color-circle"></span>
                Theme
            </button>
            <div id="themeMenu">
                <div class="theme-option" data-theme="blue">
                    <span class="color-circle" style="background-color: #007AFF;"></span>
                    Blue
                </div>
                <div class="theme-option" data-theme="pink">
                    <span class="color-circle" style="background-color: #FF2D55;"></span>
                    Pink
                </div>
            </div>
        `;
        
        // Clear localStorage before each test
        localStorage.clear();
        
        themeManager = new ThemeManager();
    });

    test('initializes with default blue theme when no theme is stored', () => {
        expect(themeManager.currentTheme).toBe('blue');
        expect(document.body.getAttribute('data-theme')).toBeNull();
    });

    test('loads theme from localStorage if available', () => {
        localStorage.setItem('theme', 'pink');
        themeManager = new ThemeManager();
        expect(themeManager.currentTheme).toBe('pink');
        expect(document.body.getAttribute('data-theme')).toBe('pink');
    });

    test('toggles theme menu on button click', () => {
        const themeButton = document.getElementById('themeButton');
        const themeMenu = document.getElementById('themeMenu');
        
        themeButton.click();
        expect(themeMenu.classList.contains('active')).toBe(true);
        
        themeButton.click();
        expect(themeMenu.classList.contains('active')).toBe(false);
    });

    test('changes theme when option is selected', () => {
        const pinkOption = document.querySelector('[data-theme="pink"]');
        pinkOption.click();
        
        expect(themeManager.currentTheme).toBe('pink');
        expect(document.body.getAttribute('data-theme')).toBe('pink');
        expect(localStorage.getItem('theme')).toBe('pink');
    });

    test('closes menu when clicking outside', () => {
        const themeMenu = document.getElementById('themeMenu');
        themeMenu.classList.add('active');
        
        document.body.click();
        expect(themeMenu.classList.contains('active')).toBe(false);
    });
}); 