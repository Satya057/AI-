# 🎧 Voice Assistant

An AI-powered voice assistant that uses Google's Gemini AI to answer questions in 10 simple lines.

## Features

- 🎤 Voice recognition using browser's Speech Recognition API
- 🧠 AI-powered responses using Google Gemini
- 🌐 Beautiful web interface
- 📱 Responsive design
- ⚡ Real-time processing

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd voice-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

## Deployment on Render

### Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with these files:
- `server.js` (main entry point)
- `package.json` (with proper start script)
- All dependencies installed

### Step 2: Deploy on Render

1. **Go to [Render.com](https://render.com)** and sign up/login

2. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your voice-assistant repository

3. **Configure the service**
   - **Name**: `voice-assistant` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you prefer)

4. **Add Environment Variables**
   - Click on "Environment" tab
   - Add these variables:
     - `GOOGLE_AI_API_KEY`: Your Google AI API key
     - `NODE_ENV`: `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Step 3: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to Render environment variables

## Usage

1. Open your deployed URL
2. Click "🎤 Interview Mode" button
3. Allow microphone access
4. Ask your question
5. Get AI-powered response in 10 lines!

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **AI**: Google Gemini AI
- **Speech Recognition**: Web Speech API
- **Deployment**: Render

## License

ISC 