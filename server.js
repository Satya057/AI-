require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "AIzaSyADFe53Ylvemv2AxklcaPJTOTn7-_JNUkE");

// Function to generate AI response
async function generateAIResponse(question, conversationHistory = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Build context from conversation history
    let contextPrompt = '';
    if (conversationHistory.length > 0) {
      contextPrompt = '\n\nPrevious conversation context:\n';
      conversationHistory.slice(-3).forEach((item, index) => {
        contextPrompt += `${index + 1}. Q: ${item.question}\n   A: ${item.answer}\n`;
      });
      contextPrompt += '\nBased on this context, ';
    }
    
    const prompt = `Question: ${question}${contextPrompt}First, determine if this is a technical question. If it is, provide an answer focused exclusively on JavaScript and related web technologies (like React, Node.js, Angular, HTML, CSS). If it is a general, non-technical question, provide a standard helpful answer. For all answers, keep them simple, easy to understand, and within 10 lines.`;
    
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
    const filePath = path.join(__dirname, 'voice-display.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading HTML file. Make sure voice-display.html is in the same directory.');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
  } else if (req.method === 'POST' && parsedUrl.pathname === '/process-question') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { question, conversationHistory = [] } = JSON.parse(body);
        const answer = await generateAIResponse(question, conversationHistory);
        
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
  
  const PORT = process.env.PORT || 3000;
  
  server.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🚀 Your voice assistant is ready at http://localhost:${PORT}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📄 Opening voice assistant in browser...');
      const { exec } = require('child_process');
      const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${command} http://localhost:${PORT}`);
    }
  });
}

startVoiceAssistant().catch(console.error); 