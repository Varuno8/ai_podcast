# 🎙️ PodMaster AI: The Ultimate Neural Audio Platform

**PodMaster AI** is an advanced, agentic audio synthesis platform that transforms static web content into broadcast-quality podcasts. It leverages a multi-modal AI pipeline to scrape, script, voice, and mix professional audio experiences, complete with a "Netflix-style" discovery dashboard and real-time visualizers.

---

## 🌟 Key Features Overview

### 1. **Core Generation Engine**
- **URL-to-Podcast**: Instantly converts any article, blog, or documentation URL into a two-host discussion.
- **Smart Scraping**: Uses `Crawlbase` to extract clean text from complex web pages.
- **Intelligent Scripting**: `Cerebras (Llama 3.1)` generates engaging, natural dialogue with humor, debate, and insight.
- **Neural TTS**: `Cartesia Sonic` provides ultra-fast, emotive voices for "Host 1" (Male) and "Host 2" (Female).

### 2. **Professional Audio Engineering**
- **Dynamic Background Music**: Automatically selects backing tracks (`LOFI`, `TENSE`, `EXCITED`, `CORPORATE`) based on the script's sentiment.
- **Smart Mixing**: Implements crossfading (500ms) and ducking (lowering music volume during speech) for a radio-quality mix.
- **Voice Mashups**: Record your own intro using the "Studio Mic" feature, and the AI will stitch it seamlessly into the final episode.
- **Ad Insertion**: Toggle "Insert Ad Break" to simulate a monetized broadcast with synthesized sponsor messages.

### 3. **"Talking Heads" Visual AI**
- **Real-Time Visualization**: Replaces static waveforms with dynamic avatars specific to each host.
- **Reactive Animation**: Host avatars scale and glow in sync with the audio frequency and volume.
- **Immersive Environment**: A glass-morphic "Audio Environment" stage that feels alive.

### 4. **Interactive Studio Suite**
- **Interrogate Mode**: Chat with the AI hosts *after* the show. Ask questions about the content, and they respond in character with audio and text.
- **Script Doctor**: Click any line in the manuscript to **Re-Roll** the delivery or **Regenerate** the phrase if it sounds off.
- **Quote Cards**: One-click generation of shareable social media images featuring memorable quotes from the episode.
- **Episode DNA**: A visual breakdown of the episode's "genome"—sentiment flow, virality score, and topic sequence.

### 5. **Social & SEO Power Tools**
- **Social Artifacts**: Automatically generates ready-to-post content for **LinkedIn** (long-form professional) and **Twitter/X** (punchy threads).
- **Show Notes**: Creates an SEO-optimized executive summary and chapter markers with timestamps.
- **Trending Radar**: A live dashboard showing "trending" articles (mock feed) ready for instant synthesis.

### 6. **Advanced Configuration**
- **Persona Engine**: Choose your host vibe:
  - 🕵️ **The Investigator** (Serious, analytical)
  - 😂 **The Comedian** (Lighthearted, funny)
  - 🤝 **The Friend** (Casual, relatable)
- **Deep Dive Mode**: Toggle between "5-Min Summary" or "20-Min Deep Dive".
- **Improv Mode**: Inject theatrical elements like interruptions, analogies, and rhetorical questions for a less robotic feel.

### 7. **Architecture & Tech Stack**
- **Frontend**: React (Vite), Framer Motion (Animations), Lucide (Icons), TailwindCSS (Styling).
- **Backend**: FastAPI (Python), SQLAlchemy (SQLite DB), Pydub (Audio Processing).
- **Storage**: Local filesystem for media, SQLite for metadata history.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repo-url>
   cd ai-podcast-generator
   ```

2. **Backend Setup**
   ```bash
   # Create virtual env
   python3 -m venv venv
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt

   # Create .env file
   cp .env.example .env
   # Add your API keys: CEREBRAS_API_KEY, CARTESIA_API_KEY, CRAWLBASE_API_KEY
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Run the Application**
   ```bash
   # Terminal 1: Backend
   uvicorn app:app --reload

   # Terminal 2: Frontend
   npm run dev
   ```

5. **Open Studio**
   Navigate to `http://localhost:5173` to enter PodMaster HQ.

---

## 🔒 Privacy & Local First
All generations are stored locally in `history_files/`. Your API keys are kept secure in your server-side environment (`.env`), ensuring no leakage in client-side code.

---

**PodMaster AI — Redefining the Interface of Audio.**
