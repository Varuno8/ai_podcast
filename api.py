import os
import shutil
import tempfile
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
from pathlib import Path

from scraper import WebScraper
from script_generator import ScriptGenerator
from tts_converter import TTSConverter
from history_manager import HistoryManager
from pydub import AudioSegment

app = FastAPI()
history_mgr = HistoryManager()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve paths relative to the script location
BASE_DIR = Path(__file__).resolve().parent
images_dir = BASE_DIR / "images"
history_dir = BASE_DIR / "history"

if not images_dir.exists():
    images_dir.mkdir(exist_ok=True)

if not history_dir.exists():
    history_dir.mkdir(exist_ok=True)

app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")
app.mount("/history_files", StaticFiles(directory=str(history_dir)), name="history_files")

class GenerateRequest(BaseModel):
    url: str
    crawlbase_key: Optional[str] = None
    cerebras_key: Optional[str] = None
    cartesia_key: Optional[str] = None

class HistoryGenerateRequest(BaseModel):
    script: str
    url: str
    cartesia_key: Optional[str] = None

@app.get("/api/history")
async def get_history():
    return history_mgr.get_history()

@app.get("/api/history/{entry_id}")
async def get_history_detail(entry_id: str):
    detail = history_mgr.get_generation_detail(entry_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Entry not found")
    return detail

@app.post("/api/generate")
async def generate_podcast(req: GenerateRequest):
    # Set keys in environment for the session
    if req.crawlbase_key: os.environ['CRAWLBASE_API_KEY'] = req.crawlbase_key
    if req.cerebras_key: os.environ['CEREBRAS_API_KEY'] = req.cerebras_key
    if req.cartesia_key: os.environ['CARTESIA_API_KEY'] = req.cartesia_key

    try:
        # Step 1: Scrape
        scraper = WebScraper()
        content = scraper.scrape(req.url)

        # Step 2: Script
        generator = ScriptGenerator()
        script = generator.generate(content)
        
        # Save to history
        history_mgr.save_generation(req.url, content, script)

        # Step 3 & 4: Audio & Merge
        audio_url = await run_full_audio_flow(script)
        
        return {
            "status": "success",
            "script": script,
            "content": content,
            "audio_url": audio_url,
            "url": req.url
        }
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-from-history")
async def generate_from_history(req: HistoryGenerateRequest):
    if req.cartesia_key: os.environ['CARTESIA_API_KEY'] = req.cartesia_key
    try:
        audio_url = await run_full_audio_flow(req.script)
        return {
            "status": "success",
            "audio_url": audio_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_full_audio_flow(script: str):
    converter = TTSConverter()
    segments = converter._parse_script(script)
    
    # Use a persistent temp folder that we can serve
    audio_dir_path = history_dir / "temp_audio"
    audio_dir_path.mkdir(exist_ok=True)
    
    valid_files = []
    
    for i, (speaker, text) in enumerate(segments, 1):
        voice = converter.voices.get(speaker, converter.voices["male"])
        audio_file = audio_dir_path / f"segment_{i:03d}.mp3"
        converter._generate_and_save_speech(text, voice, str(audio_file))
        
        if audio_file.exists() and audio_file.stat().st_size > 0:
            valid_files.append(audio_file)
    
    if not valid_files:
        raise Exception("No audio segments generated")

    combined = AudioSegment.empty()
    for filepath in valid_files:
        audio = AudioSegment.from_mp3(filepath)
        combined += audio
    
    output_filename = f"podcast_{tempfile.mktemp().split('/')[-1]}.mp3"
    output_path = Path("history") / output_filename
    combined.export(output_path, format="mp3")
    
    # Cleanup temp segments
    for f in valid_files:
        try: os.remove(f)
        except: pass
        
    return f"/history_files/{output_filename}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
