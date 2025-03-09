# Korean Translator App

A modern web application for translating English to Korean with features like:
- Multiple formality levels
- Detailed grammar explanations
- Word bank functionality
- Modern, responsive UI

## Features
- Real-time translation using OpenAI's API
- Support for different Korean speech levels (casual, polite-informal, formal-polite, very-formal)
- Detailed grammar explanations and cultural notes
- Word bank for saving frequently used phrases
- Clean, modern user interface

## Setup
1. Clone the repository
```bash
git clone https://github.com/Cara-Davies/koreantranslatorapp.git
cd koreantranslatorapp
```

2. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

3. Open `index.html` in your browser or serve using a local server:
```bash
python3 -m http.server 8000
```

4. Visit `http://localhost:8000` in your browser

## Technologies Used
- HTML5/CSS3
- JavaScript (ES6+)
- OpenAI API
- Netlify for deployment 