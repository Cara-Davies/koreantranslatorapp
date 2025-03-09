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