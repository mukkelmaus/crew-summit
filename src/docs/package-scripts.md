# Package.json Scripts for Testing

Add the following scripts to your package.json file to enable testing functionality:

```json
"scripts": {
  // ... existing scripts
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

These scripts provide the following functionality:

- `npm test` - Run tests once and exit
- `npm run test:watch` - Run tests in watch mode, re-running when files change
- `npm run test:coverage` - Run tests with code coverage reporting

After adding these scripts, you can run tests with the commands shown above.
