require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const http = require('http');
const url = require('url');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "AIzaSyADFe53Ylvemv2AxklcaPJTOTn7-_JNUkE");

// Create simple HTML display
const createDisplayHTML = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎧 Voice Assistant</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .status {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 10px;
            background: #f8f9fa;
        }
        
        .mic-button {
            width: 180px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 30px auto;
            display: block;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        .mic-button:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(0,0,0,0.3);
        }
        
        .mic-button.listening {
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            color: #333;
        }
        
        .mic-button:active {
            transform: translateY(0);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .question-section, .answer-section {
            margin: 20px 0;
            padding: 20px;
            border-radius: 15px;
            border-left: 5px solid #667eea;
        }
        
        .question-section {
            background: #e3f2fd;
        }
        
        .answer-section {
            background: #f3e5f5;
        }
        
        .label {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
        }
        
        .timestamp {
            font-size: 12px;
            color: #888;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎧 Voice Assistant</h1>
            <p>Question puchiye, 10 line me simple answer milega</p>
        </div>
        
        <div class="status">
            <span id="status-text">🎤 Click microphone to start</span>
        </div>
        
        <div class="question-section">
            <div class="label">🎤 Question:</div>
            <div class="content" id="current-question">Koi question puchiye...</div>
            <div class="timestamp" id="question-time"></div>
        </div>
        
        <div class="answer-section">
            <div class="label">🧠 Answer:</div>
            <div class="content" id="current-answer">Jawab yahan show hoga...</div>
            <div class="timestamp" id="answer-time"></div>
        </div>
    </div>

    <button class="mic-button" id="mic-button" onclick="toggleListening()">🎤 Interview Mode</button>

    <script>
        let isListening = false;
        let isProcessing = false;
        let recognition;
        
        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'hi-IN'; // Hindi language support
            recognition.maxAlternatives = 3; // Get multiple alternatives
            recognition.grammars = null; // No grammar restrictions
            
            let listeningTimeout;
            let silenceTimeout;
            
            recognition.onstart = function() {
                console.log('🎤 Speech recognition started');
                updateStatus('🎤 Sun raha hun... 15 seconds ke liye');
                document.getElementById('mic-button').classList.add('listening');
                
                // Set timeout to stop listening after 15 seconds
                listeningTimeout = setTimeout(() => {
                    if (isListening) {
                        stopListening();
                    }
                }, 15000);
            };
            
            recognition.onresult = function(event) {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Show interim results in real-time
                if (interimTranscript) {
                    document.getElementById('current-question').textContent = interimTranscript;
                }
                
                if (finalTranscript) {
                    console.log('🎤 Heard:', finalTranscript);
                    updateQuestion(finalTranscript);
                    processQuestion(finalTranscript);
                    stopListening(); // Stop listening after getting final result
                }
                
                // Reset silence timeout when speech is detected
                clearTimeout(silenceTimeout);
                if (isListening && !finalTranscript) {
                    silenceTimeout = setTimeout(() => {
                        if (isListening) {
                            console.log('🎤 No speech detected, stopping...');
                            stopListening();
                        }
                    }, 3000); // Stop after 3 seconds of silence
                }
            };
            
            recognition.onaudiostart = function() {
                console.log('🎤 Audio capturing started');
            };
            
            recognition.onaudioend = function() {
                console.log('🎤 Audio capturing ended');
            };
            
            recognition.onsoundstart = function() {
                console.log('🎤 Sound detected');
            };
            
            recognition.onsoundend = function() {
                console.log('🎤 Sound ended');
            };
            
            recognition.onspeechstart = function() {
                console.log('🎤 Speech started');
            };
            
            recognition.onspeechend = function() {
                console.log('🎤 Speech ended');
            };
            
            recognition.onerror = function(event) {
                console.error('❌ Speech recognition error:', event.error);
                updateStatus('❌ Error: ' + event.error);
                document.getElementById('mic-button').classList.remove('listening');
                clearTimeout(listeningTimeout);
                clearTimeout(silenceTimeout);
                
                // Try to restart if it's a network error
                if (event.error === 'network' && isListening) {
                    setTimeout(() => {
                        if (isListening) {
                            console.log('🔄 Retrying speech recognition...');
                            recognition.start();
                        }
                    }, 1000);
                }
            };
            
            recognition.onend = function() {
                console.log('🎤 Speech recognition ended');
                isListening = false;
                document.getElementById('mic-button').classList.remove('listening');
                clearTimeout(listeningTimeout);
                clearTimeout(silenceTimeout);
                if (!isProcessing) {
                    updateStatus('🎤 Click "Interview Mode" to start');
                }
            };
        } else {
            updateStatus('❌ Speech recognition not supported');
        }
        
        function toggleListening() {
            if (!recognition) {
                alert('Speech recognition not supported in this browser');
                return;
            }

            if (isProcessing) {
                console.log('Still processing previous question.');
                return;
            }
            
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        }
        
        function startListening() {
            isListening = true;
            recognition.start();
        }
        
        function stopListening() {
            isListening = false;
            recognition.stop();
        }
        
        function updateQuestion(question) {
            document.getElementById('current-question').textContent = question;
            document.getElementById('question-time').textContent = new Date().toLocaleTimeString();
        }
        
        function updateAnswer(answer) {
            document.getElementById('current-answer').textContent = answer;
            document.getElementById('answer-time').textContent = new Date().toLocaleTimeString();
        }
        
        function updateStatus(status) {
            document.getElementById('status-text').textContent = status;
        }
        
        async function processQuestion(question) {
            updateStatus('🧠 AI se jawab maang raha hun...');
            isProcessing = true;
            
            try {
                const response = await fetch('/process-question', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: question })
                });
                
                const data = await response.json();
                const answer = data.answer;
                
                updateAnswer(answer);
                updateStatus('🎤 Ready. Click "Interview Mode" to ask a new question.');
                
            } catch (error) {
                console.error('❌ Error processing question:', error);
                updateAnswer('Sorry, I could not process your question.');
                updateStatus('❌ Error. Click "Interview Mode" to try again.');
            } finally {
                isProcessing = false;
            }
        }
    </script>
</body>
</html>`;

  fs.writeFileSync('voice-display.html', htmlContent);
  console.log('📄 Voice display HTML file created: voice-display.html');
};

// Function to generate AI response
async function generateAIResponse(question) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Question: ${question}\n\nPlease provide a helpful answer in exactly 10 lines. Keep it simple and easy to understand. Use simple language and clear explanations.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ AI Response Error:', error);
    return 'Sorry, I could not generate a response at the moment.';
  }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const html = fs.readFileSync('voice-display.html', 'utf8');
    res.end(html);
  } else if (req.method === 'POST' && parsedUrl.pathname === '/process-question') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { question } = JSON.parse(body);
        const answer = await generateAIResponse(question);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ answer: answer }));
      } catch (error) {
        console.error('❌ Server Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process question' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the application
async function startVoiceAssistant() {
  console.log('🎧 Voice Assistant Starting...');
  
  // Create display HTML
  createDisplayHTML();
  
  // Get port from environment variable (for Render) or use 3000
  const PORT = process.env.PORT || 3000;
  
  server.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🚀 Your voice assistant is ready!`);
    
    // Only open browser locally (not on Render)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📄 Opening voice assistant in browser...');
      require('child_process').exec(`start http://localhost:${PORT}`);
    }
  });
}

startVoiceAssistant().catch(console.error); 