// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock window methods
global.scrollTo = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.body.innerHTML = '';
}); 