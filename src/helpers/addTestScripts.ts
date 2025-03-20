// This is a helper file for modifying package.json
// Normally in a real project, you'd directly modify package.json
// But for this demonstration, this file would be run manually

/*
Add these scripts to package.json:

"scripts": {
  // ... existing scripts
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
*/

console.log("Please add the following test scripts to your package.json:");
console.log(`
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
`);
