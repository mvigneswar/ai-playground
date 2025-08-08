# AI Playground - Python Version

A simple Flask app with AI capabilities for conversation analysis, image analysis, and document summarization.

## Features

- **Conversation Analysis**: Upload audio files for transcription, diarization, and summarization
- **Image Analysis**: Upload images for detailed descriptions
- **Document/URL Summarization**: Upload PDFs or provide URLs for summarization

## Quick Start

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Set your OpenAI API key
Create a `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the app
```bash
python app.py
```

### 4. Open in browser
Go to: http://localhost:5000

## Deploy to Render (Free)

1. **Create account** at https://render.com
2. **Connect your GitHub** repository
3. **Create new Web Service**
4. **Select your repository**
5. **Configure:**
   - **Name:** ai-playground
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
6. **Add Environment Variable:**
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key
7. **Deploy**

## Deploy to Railway (Free)

1. **Go to** https://railway.app
2. **Connect GitHub** repository
3. **Deploy** automatically
4. **Add environment variable** `OPENAI_API_KEY`

## Deploy to Heroku (Free tier ended)

1. **Install Heroku CLI**
2. **Login:** `heroku login`
3. **Create app:** `heroku create your-app-name`
4. **Set environment:** `heroku config:set OPENAI_API_KEY=your_key`
5. **Deploy:** `git push heroku main`

## Test the App

1. **Conversation Analysis**: Upload an audio file
2. **Image Analysis**: Upload an image
3. **Document Summarization**: Upload a PDF or enter a URL

## Files

- `app.py` - Main Flask application
- `templates/index.html` - Web interface
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (create this)

## Troubleshooting

- **"OpenAI API key not set"**: Make sure `OPENAI_API_KEY` is in your environment variables
- **"Module not found"**: Run `pip install -r requirements.txt`
- **Port already in use**: Change port in `app.py` or kill existing process

## API Endpoints

- `POST /api/conversation` - Audio analysis
- `POST /api/image` - Image analysis  
- `POST /api/summarize` - Document/URL summarization

All endpoints accept multipart form data and return JSON responses. 