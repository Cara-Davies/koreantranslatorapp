module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.js$': ['babel-jest', { rootMode: 'upward' }]
    },
    moduleNameMapper: {
        '^/js/(.*)$': '<rootDir>/js/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    transformIgnorePatterns: [
        'node_modules/(?!(module-that-needs-to-be-transformed)/)'
    ]
}; 