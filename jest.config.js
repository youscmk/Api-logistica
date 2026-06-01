module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!src/tests/**',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    testMatch: ['**/src/tests/**/*.test.js'],
    verbose: true,
};
