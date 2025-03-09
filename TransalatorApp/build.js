const fs = require('fs');
const path = require('path');

// Read the translator.js file
const translatorPath = path.join(__dirname, 'js', 'pages', 'translator.js');
let content = fs.readFileSync(translatorPath, 'utf8');

// Replace the API key placeholder with the actual value
content = content.replace(
    'OPENAI_API_KEY',
    `"${process.env.OPENAI_API_KEY}"`
);

// Write the modified content back
fs.writeFileSync(translatorPath, content); 