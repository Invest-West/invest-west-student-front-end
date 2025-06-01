const fs = require('fs');
const path = require('path');

// Function to remove or replace problematic source map references
function patchSourceMaps() {
  const firebaseAuthPath = path.join(__dirname, '../node_modules/@firebase/auth/dist/auth.esm.js');
  
  if (fs.existsSync(firebaseAuthPath)) {
    console.log('Patching Firebase auth source maps...');
    let content = fs.readFileSync(firebaseAuthPath, 'utf8');
    
    // Remove problematic source map comments
    content = content.replace(/\/\/# sourceMappingURL=.*synthetic.*$/gm, '');
    
    fs.writeFileSync(firebaseAuthPath, content);
    console.log('Firebase auth source maps patched successfully.');
  }
}

// Function to patch Bootstrap CSS to remove color-adjust warnings
function patchBootstrapCSS() {
  const bootstrapCSSPath = path.join(__dirname, '../node_modules/bootstrap/dist/css/bootstrap.min.css');
  
  if (fs.existsSync(bootstrapCSSPath)) {
    console.log('Patching Bootstrap CSS color-adjust properties...');
    let content = fs.readFileSync(bootstrapCSSPath, 'utf8');
    
    // Replace color-adjust with print-color-adjust
    content = content.replace(/color-adjust:/g, 'print-color-adjust:');
    
    fs.writeFileSync(bootstrapCSSPath, content);
    console.log('Bootstrap CSS patched successfully.');
  }
}

// Suppress console warnings for development
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const message = args[0] || '';
  
  // Skip Firebase and webpack deprecation warnings
  if (typeof message === 'string' && (
    message.includes('DEP_WEBPACK_DEV_SERVER') ||
    message.includes('Failed to parse source map') ||
    message.includes('autoprefixer') ||
    message.includes('color-adjust')
  )) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

patchSourceMaps();
patchBootstrapCSS();