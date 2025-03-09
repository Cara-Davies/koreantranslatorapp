import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the translator.js file
const translatorPath = join(__dirname, 'js', 'pages', 'translator.js');
let content = readFileSync(translatorPath, 'utf8');

// Replace the API key placeholder with the actual value
content = content.replace(
    'OPENAI_API_KEY',
    `"${process.env.OPENAI_API_KEY}"`
);

// Write the modified content back
writeFileSync(translatorPath, content);

// Read the API key from environment variable
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    process.exit(1);
}

// Define the JavaScript code to inject
const injectedCode = `
// Injected during build
const OPENAI_API_KEY = "${apiKey}";
`;

// Function to inject code at the beginning of a file
function injectCodeIntoFile(filePath) {
    const fullPath = join(__dirname, filePath);
    
    try {
        let content = readFileSync(fullPath, 'utf8');
        
        // Add the injected code at the beginning of the file
        content = injectedCode + '\n' + content;
        
        // Write the modified content back to the file
        writeFileSync(fullPath, content);
        console.log(`Successfully injected API key into ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        process.exit(1);
    }
}

// Inject the code into the main JavaScript file
injectCodeIntoFile('js/config.js'); 