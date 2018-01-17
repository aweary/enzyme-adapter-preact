module.exports = {
    setupFiles : ['./__tests__/index.js'],
    testMatch: ['**/__tests__/*.spec.js'],
    moduleNameMapper : {
        'preact-enzyme-adapter' : `<rootDir>/src/index.js`
    }
};
