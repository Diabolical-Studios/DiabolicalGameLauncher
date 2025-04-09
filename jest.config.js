module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/',
    ],
    moduleNameMapper: {
        '^electron$': '<rootDir>/tests/mocks/electron.js',
    },
    setupFiles: ['<rootDir>/tests/setup.js'],
}; 