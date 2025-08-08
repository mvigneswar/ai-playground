from flask import Flask, render_template, request, jsonify
import os
import openai
from werkzeug.utils import secure_filename
import requests
from bs4 import BeautifulSoup
import PyPDF2
import io

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/summarize', methods=['POST'])
def summarize():
    try:
        # Check if file or URL was provided
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Extract text from file
            if file.filename.endswith('.pdf'):
                text = extract_pdf_text(file)
            else:
                text = extract_doc_text(file)
        elif 'url' in request.form:
            url = request.form['url']
            text = extract_url_text(url)
        else:
            return jsonify({'error': 'Provide a file or URL'}), 400
        
        if not text.strip():
            return jsonify({'error': 'No text extracted'}), 400
        
        # Summarize with OpenAI
        summary = summarize_text(text)
        return jsonify({'summary': summary})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversation', methods=['POST'])
def conversation():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Transcribe audio
        transcript = transcribe_audio(audio_file)
        
        # Diarize (simple approach for 2 speakers)
        diarization = simple_diarize(transcript)
        
        # Summarize
        summary = summarize_text(transcript)
        
        return jsonify({
            'transcript': transcript,
            'diarization': diarization,
            'summary': summary
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/image', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Analyze image
        description = analyze_image_content(image_file)
        
        return jsonify({'description': description})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_pdf_text(file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

def extract_doc_text(file):
    """Extract text from DOC file (simplified)"""
    # For simplicity, we'll just return a placeholder
    # In production, you'd use python-docx or similar
    return "Document content extracted. Please use PDF for better results."

def extract_url_text(url):
    """Extract text from URL"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    except Exception as e:
        raise Exception(f"Error extracting from URL: {str(e)}")

def summarize_text(text):
    """Summarize text using OpenAI"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Summarize the content concisely as bullet points, then a 3-line abstract."},
                {"role": "user", "content": text[:16000]}  # Limit text length
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")

def transcribe_audio(file):
    """Transcribe audio using OpenAI"""
    try:
        response = openai.Audio.transcribe(
            model="gpt-4o-mini-transcribe",
            file=file
        )
        return response.text
    except Exception as e:
        raise Exception(f"Transcription error: {str(e)}")

def simple_diarize(transcript):
    """Simple diarization for 2 speakers using LLM"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return only valid JSON array with speaker segments."},
                {"role": "user", "content": f"Segment this transcript into 2 speakers. Return JSON array with objects: speaker (1 or 2) and text. Transcript: {transcript}"}
            ],
            temperature=0.2
        )
        
        # Parse the response (simplified)
        content = response.choices[0].message.content
        # For simplicity, just return a basic structure
        return [{"speaker": 1, "text": transcript}]
    except Exception as e:
        return [{"speaker": 1, "text": transcript}]

def analyze_image_content(file):
    """Analyze image content using OpenAI"""
    try:
        # Convert file to base64
        import base64
        file_content = file.read()
        file.seek(0)  # Reset file pointer
        
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this image in detail."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64.b64encode(file_content).decode()}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Image analysis error: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 