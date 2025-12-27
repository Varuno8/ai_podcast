import os
import shutil
import tempfile
import traceback
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
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
from persona_engine import PersonaEngine
from fact_checker import FactChecker

from news_aggregator import NewsAggregator
from database import engine, Base
from image_generator import ImageGenerator

# ... existing imports ...
from models import Episode

# ... existing code ...

class QuoteRequest(BaseModel):
    text: str
    author: str


# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
history_mgr = HistoryManager()
news_aggregator = NewsAggregator()
persona_engine = PersonaEngine()
fact_checker = FactChecker()

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
uploads_dir = BASE_DIR / "uploads"

if not images_dir.exists():
    images_dir.mkdir(exist_ok=True)

if not history_dir.exists():
    history_dir.mkdir(exist_ok=True)

if not uploads_dir.exists():
    uploads_dir.mkdir(exist_ok=True)

ads_dir = BASE_DIR / "ads"
if not ads_dir.exists():
    ads_dir.mkdir(exist_ok=True)

app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")
app.mount("/history_files", StaticFiles(directory=str(history_dir)), name="history_files")
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
app.mount("/ads", StaticFiles(directory=str(ads_dir)), name="ads")

class GenerateRequest(BaseModel):
    url: Optional[str] = None
    manual_content: Optional[str] = None
    manual_script: Optional[str] = None
    crawlbase_key: Optional[str] = None
    cerebras_key: Optional[str] = None
    cartesia_key: Optional[str] = None
    persona: Optional[str] = "investigator"
    depth: Optional[str] = "deep_dive"
    insert_ad: Optional[bool] = False
    ad_position: Optional[float] = 0.5 # 0.0 to 1.0
    ad_audio_file: Optional[str] = None
    improv: Optional[bool] = False
    user_intro_file: Optional[str] = None
    guest_url: Optional[str] = None

class SegmentRegenRequest(BaseModel):
    text: str
    voice: str # "male" or "female"
    cartesia_key: Optional[str] = None

class HistoryGenerateRequest(BaseModel):
    script: str
    url: str
    cartesia_key: Optional[str] = None

class PlaylistAddRequest(BaseModel):
    url: str
    title: str
    source: str
    summary: Optional[str] = ""

class CommentRequest(BaseModel):
    episode_id: str
    username: str
    text: str
    timestamp_seconds: int

@app.get("/api/history")
async def get_history():
    return history_mgr.get_history()

@app.get("/api/history/{entry_id}")
async def get_history_detail(entry_id: str):
    detail = history_mgr.get_generation_detail(entry_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Attach comments
    comments = history_mgr.get_comments(entry_id)
    detail["comments"] = comments
    return detail

@app.post("/api/comments/add")
async def add_comment(req: CommentRequest):
    history_mgr.add_comment(req.episode_id, req.username, req.text, req.timestamp_seconds)
    return {"status": "success"}

@app.get("/api/discovery/trending")
async def get_trending():
    return news_aggregator.get_trending()

@app.get("/api/playlist")
async def get_listen_later():
    return history_mgr.get_listen_later()

@app.post("/api/playlist/add")
async def add_listen_later(req: PlaylistAddRequest):
    history_mgr.add_listen_later(req.url, req.title, req.source, req.summary)
    return {"status": "success"}

@app.post("/api/trailer/{entry_id}")
async def create_trailer(entry_id: str):
    detail = history_mgr.get_generation_detail(entry_id)
    if not detail or not detail.get('audio_url'):
        raise HTTPException(status_code=404, detail="Audio not found")
        
    filename = detail['audio_url'].split('/')[-1]
    input_path = history_dir / filename
    
    try:
        audio = AudioSegment.from_mp3(input_path)
        # Slice first 60 seconds
        trailer = audio[:60000]
        # Fade out last 3 seconds
        trailer = trailer.fade_out(3000)
        
        output_filename = f"trailer_{filename}"
        output_path = history_dir / output_filename
        trailer.export(output_path, format="mp3")
        
        return {"audio_url": f"/history_files/{output_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/{entry_id}")
async def get_analytics(entry_id: str):
    # Mock Analytics Data Generator
    # In a real app, this would query the DB or an analytics service
    import random
    
    # "Episode DNA" - Semantic breakdown
    dna_sequence = "".join(random.choices(["A", "C", "G", "T"], k=20))
    
    # Listener Vibe
    vibe = {
        "Curious": random.randint(20, 50),
        "Skeptical": random.randint(10, 30),
        "Excited": random.randint(10, 40)
    }
    
    # Retention Curve (simulated)
    retention = [100]
    current = 100
    for _ in range(20):
        drop = random.uniform(0, 5)
        current = max(0, current - drop)
        retention.append(current)
        
    return {
        "dna_sequence": dna_sequence,
        "vibe": vibe,
        "retention": retention,
        "virality_score": random.randint(1, 100) / 10.0
    }

class InterrogateRequest(BaseModel):
    episode_id: str
    query: str
    context: str
    cartesia_key: Optional[str] = None
    cerebras_key: Optional[str] = None

@app.post("/api/interrogate")
async def interrogate_hosts(req: InterrogateRequest):
    if req.cerebras_key: os.environ['CEREBRAS_API_KEY'] = req.cerebras_key
    if req.cartesia_key: os.environ['CARTESIA_API_KEY'] = req.cartesia_key
    
    # 1. Fact Check
    fact_check = fact_checker.check_claim(req.query, req.context)
    
    # 2. Generate Host Response (Dialogue)
    generator = ScriptGenerator()
    headers = {
        "Authorization": f"Bearer {os.environ.get('CEREBRAS_API_KEY')}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    The listener is asking a question about the podcast.
    QUESTION: {req.query}
    CONTEXT/SCRIPT: {req.context[:4000]}
    FACT CHECK DATA: {fact_check['explanation']}
    
    Respond as the hosts (Host 1 and Host 2) in a short 2-3 line dialogue.
    If the fact check is important, mention it naturally.
    
    Format example:
    Host 1: Interesting question about X.
    Host 2: Well, {fact_check['explanation']}
    """
    
    # 2. Get LLM response for interrogation (Tiered: Gemini -> OpenRouter -> Cerebras)
    response_text = ""
    gemini_key = os.environ.get('GEMINI_API_KEY')
    openrouter_key = os.environ.get('OPENROUTER_API_KEY')
    
    # Tier 1: Gemini 3 Flash
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={gemini_key}"
            res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=15)
            if res.status_code == 200:
                response_text = res.json()['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print(f"Gemini Interrogate Error: {e}")

    # Tier 2: OpenRouter
    if not response_text and openrouter_key:
        try:
            or_headers = {"Authorization": f"Bearer {openrouter_key}", "Content-Type": "application/json"}
            or_data = {"model": "qwen/qwen3-4b:free", "messages": [{"role": "user", "content": prompt}]}
            res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=or_headers, json=or_data, timeout=15)
            if res.status_code == 200:
                response_text = res.json()['choices'][0]['message']['content']
        except Exception as e:
            print(f"OpenRouter Interrogate Error: {e}")

    # Tier 3: Cerebras Fallback
    if not response_text:
        try:
            cerebras_data = {
                "model": "llama3.1-8b",
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            }
            res = requests.post("https://api.cerebras.ai/v1/chat/completions", headers=headers, json=cerebras_data, timeout=15)
            if res.status_code == 200:
                response_text = res.json()['choices'][0]['message']['content']
        except Exception as e:
            print(f"Cerebras Interrogate Error: {e}")
    
    # If no response generated, use fallback
    if not response_text:
        response_text = "Host 1: That's an interesting question!\nHost 2: Unfortunately, we're having some technical difficulties accessing that information right now."
    
    # 3. Ensure interrogate directory exists
    interrogate_dir = history_dir / "interrogate"
    interrogate_dir.mkdir(exist_ok=True)
    
    # 4. TTS for response - Parse and generate audio
    tts = TTSConverter()
    segments = tts._parse_script(response_text)
    
    audio_segments = []
    for i, (speaker, text) in enumerate(segments):
        audio_file = interrogate_dir / f"interrogate_{tempfile.mktemp().split('/')[-1]}_{i}.mp3"
        tts._generate_and_save_speech(text, speaker, str(audio_file))
        
        if audio_file.exists() and audio_file.stat().st_size > 0:
            audio_segments.append(audio_file)
    
    # Merge all segments if multiple
    if len(audio_segments) > 1:
        from pydub import AudioSegment as AS
        combined = AS.empty()
        for seg_path in audio_segments:
            combined += AS.from_mp3(seg_path)
        
        final_path = interrogate_dir / f"response_{tempfile.mktemp().split('/')[-1]}.mp3"
        combined.export(final_path, format="mp3")
        
        # Clean up individual segments
        for seg_path in audio_segments:
            try: os.remove(seg_path)
            except: pass
            
        audio_url = f"/history_files/interrogate/{final_path.name}"
    elif len(audio_segments) == 1:
        audio_url = f"/history_files/interrogate/{audio_segments[0].name}"
    else:
        audio_url = None
    
    return {
        "response_text": response_text,
        "fact_check": fact_check,
        "audio_url": audio_url
    }

@app.post("/api/regenerate-segment")
async def regenerate_segment(req: SegmentRegenRequest):
    if req.cartesia_key: os.environ['CARTESIA_API_KEY'] = req.cartesia_key
    converter = TTSConverter()
    
    # Use a persistent temp folder
    regen_dir = history_dir / "regen"
    regen_dir.mkdir(exist_ok=True)
    
    output_filename = f"regen_{tempfile.mktemp().split('/')[-1]}.mp3"
    output_path = regen_dir / output_filename
    
    curr_text = req.text
    for prefix in ["Host 1:", "Host 2:", "Guest:"]:
        if curr_text.startswith(prefix):
            curr_text = curr_text.replace(prefix, "").strip()

    converter._generate_and_save_speech(curr_text, req.voice, str(output_path))
    
    return {"audio_url": f"/history_files/regen/{output_filename}"}
app.mount("/history_files/interrogate", StaticFiles(directory=str(history_dir / "interrogate")), name="interrogate")
app.mount("/history_files/regen", StaticFiles(directory=str(history_dir / "regen")), name="regen")

@app.post("/api/upload/audio")
async def upload_audio(file: UploadFile = File(...)):
    file_location = uploads_dir / file.filename
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    return {"filename": file.filename}

@app.post("/api/generate")
async def generate_podcast(req: GenerateRequest):
    # Ensure keys are loaded
    load_dotenv()
    
    # Set keys in environment for the session if provided (overrides .env)
    if req.crawlbase_key: os.environ['CRAWLBASE_API_KEY'] = req.crawlbase_key
    if req.cerebras_key: os.environ['CEREBRAS_API_KEY'] = req.cerebras_key
    if req.cartesia_key: os.environ['CARTESIA_API_KEY'] = req.cartesia_key

    # Validate required keys
    required_keys = ["CRAWLBASE_API_KEY", "CEREBRAS_API_KEY", "CARTESIA_API_KEY"]
    missing = [k for k in required_keys if not os.environ.get(k)]
    if missing:
        raise HTTPException(status_code=500, detail=f"Server Configuration Error: Missing API Keys: {', '.join(missing)}. Please check your .env file.")

    try:
        # Step 1: Content Acquisition
        content = req.manual_content
        if not content and not req.manual_script:
            if not req.url:
                raise HTTPException(status_code=400, detail="URL is required if manual content/script is not provided.")
            scraper = WebScraper()
            content = scraper.scrape(req.url)
        elif not content:
            content = "Manual Script / Content Entry"

        # Step 1.5: Guest Persona
        guest_persona = None
        if req.guest_url:
            guest_persona = persona_engine.extract_persona(req.guest_url)

        # Step 2: Scripting / Dialogue Generation
        if req.manual_script:
            script = req.manual_script
            gen_response = {
                "script": script,
                "chapters": [{"title": "Introduction", "estimate_seconds": 10}, {"title": "Discussion", "estimate_seconds": 60}],
                "show_notes": "A custom podcast generated from a manually provided script.",
                "social_assets": {"linkedin": "Check out our newest episode!", "twitter": "New episode just dropped! 🎙️"},
                "segments": [{"start_line_index": 0, "sentiment": "LOFI"}]
            }
        else:
            generator = ScriptGenerator()
            gen_response = generator.generate(content, persona=req.persona, depth=req.depth, improv=req.improv, guest_persona=guest_persona)
        
        script = gen_response['script']
        metadata = {
            "chapters": gen_response.get('chapters', []),
            "show_notes": gen_response.get('show_notes', ''),
            "social_assets": gen_response.get('social_assets', {}),
            "guest_persona": guest_persona
        }
        
        # Save to history (DB)
        display_url = req.url or "manual_entry"
        entry_id = history_mgr.save_generation(display_url, content, script, req.persona, req.depth, metadata=metadata)

        # Step 3 & 4: Audio & Merge
        segments_metadata = gen_response.get('segments', [])
        audio_url = await run_full_audio_flow(script, req.insert_ad, req.user_intro_file, segments_metadata, req.ad_position, req.ad_audio_file)
        
        # Update DB with audio path
        history_mgr.update_audio_path(entry_id, audio_url.split('/')[-1])
        
        return {
            "status": "success",
            "script": script,
            "content": content,
            "audio_url": audio_url,
            "url": req.url,
            "id": str(entry_id),
            "show_notes": metadata['show_notes'],
            "chapters": metadata['chapters'],
            "social_assets": metadata['social_assets']
        }
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-from-history")
async def generate_from_history(req: HistoryGenerateRequest):
    if req.cartesia_key: os.environ['CARTESIA_API_KEY'] = req.cartesia_key
    try:
        audio_url = await run_full_audio_flow(req.script)
        # Note: We can't update the audio path easily here without the ID passed in req
        # But for now we just return the URL
        return {
            "status": "success",
            "audio_url": audio_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_full_audio_flow(script, insert_ad=False, user_intro_file=None, segments_metadata=None, ad_position=0.5, ad_audio_file=None):
    converter = TTSConverter()
    segments = converter._parse_script(script)
    
    audio_dir_path = history_dir / "temp_audio"
    audio_dir_path.mkdir(exist_ok=True)
    
    speech_segments = []
    
    # Handle user intro
    if user_intro_file:
        intro_path = uploads_dir / user_intro_file
        if intro_path.exists():
            try:
                intro_audio = AudioSegment.from_mp3(intro_path)
                speech_segments.append(intro_audio)
            except Exception as e:
                print(f"Failed to load intro: {e}")

    # Generate speech segments
    for i, (speaker, text) in enumerate(segments):
        # Note: 'segments' is list of (speaker, text). 
        # API logic assumed 1-based index for naming, but list is 0-based.
        # segments_metadata uses 0-based index relative to the SCRIPT lines.
        # User intro adds an index 0 segment effectively? No, intro is separate.
        
        audio_file = audio_dir_path / f"segment_{i:03d}.mp3"
        converter._generate_and_save_speech(text, speaker, str(audio_file))
        
        if audio_file.exists() and audio_file.stat().st_size > 0:
            speech_segments.append(AudioSegment.from_mp3(audio_file))

    if not speech_segments:
        raise Exception("No audio segments generated")

    # Map segment index to vibe
    # segments_metadata indices refer to the *script* lines. 
    # If user intro was added at index 0 of speech_segments, 
    # the script segments start at index 1 (if intro exists).
    
    script_start_offset = 1 if user_intro_file else 0
    vibe_map = { (m['start_line_index'] + script_start_offset): m['sentiment'] for m in (segments_metadata or []) }
    
    # Pre-load music loops
    music_loops = {}
    music_dir = BASE_DIR / "music"
    for vibe in ["lofi", "tense", "excited", "corporate"]:
        p = music_dir / f"{vibe}.mp3"
        if p.exists():
            music_loops[vibe.upper()] = AudioSegment.from_mp3(p)

    # Insert Ad Logic
    if insert_ad:
        # Calculate insert index based on ad_position (0.0 to 1.0)
        # We ensure it's within bounds of the generated segments
        insert_idx = int(len(speech_segments) * ad_position)
        insert_idx = max(0, min(len(speech_segments), insert_idx))
        
        if ad_audio_file:
            ad_path = images_dir.parent / "uploads" / ad_audio_file
        else:
            ad_path = ads_dir / "default.mp3"
            
        if not ad_path.exists() and not ad_audio_file:
             print("Generating default ad...")
             converter._generate_and_save_speech("Stay tuned! We'll be right back after this short break.", "male", str(ad_path))
        
        if ad_path.exists():
            try:
                ad_audio = AudioSegment.from_mp3(ad_path)
                speech_segments.insert(insert_idx, ad_audio)
                
                # Shift vibe map keys
                new_vibe_map = {}
                for k, v in vibe_map.items():
                    if k >= insert_idx:
                        new_vibe_map[k + 1] = v
                    else:
                        new_vibe_map[k] = v
                new_vibe_map[insert_idx] = "CORPORATE"
                vibe_map = new_vibe_map
            except Exception as e:
                print(f"Ad audio error: {e}")
                print(f"Failed to load ad: {e}")

    # Build BG Track Grouping
    grouped_segments = []
    current_vibe = "LOFI"
    current_group_duration = 0
    
    for i, seg in enumerate(speech_segments):
        if i in vibe_map:
             if current_group_duration > 0:
                 grouped_segments.append({"vibe": current_vibe, "duration": current_group_duration})
             current_vibe = vibe_map[i]
             current_group_duration = 0
        current_group_duration += len(seg)
    
    # Last group
    if current_group_duration > 0:
        grouped_segments.append({"vibe": current_vibe, "duration": current_group_duration})

    # Construct Mix
    full_speech = AudioSegment.empty()
    for seg in speech_segments:
        full_speech += seg
        
    full_bg = AudioSegment.empty()
    
    for group in grouped_segments:
        vibe = group['vibe']
        duration = group['duration']
        loop = music_loops.get(vibe, music_loops.get("LOFI"))
        
        if not loop:
             # Silence if no loop found
             chunk = AudioSegment.silent(duration=duration)
        else:
            chunk = AudioSegment.empty()
            target_len = duration + 2000 # Buffer
            while len(chunk) < target_len:
                chunk += loop
            chunk = chunk[:duration] 
        
        if len(full_bg) > 0:
             # Crossfade
             full_bg = full_bg.append(chunk, crossfade=500)
        else:
             full_bg += chunk

    # Ducking
    full_bg = full_bg.apply_gain(-15)
    
    # Sync lengths
    if len(full_bg) < len(full_speech):
        full_speech = full_speech[:len(full_bg)]
    else:
        full_bg = full_bg[:len(full_speech)]
        
    final_mix = full_speech.overlay(full_bg)
    
    output_filename = f"podcast_{tempfile.mktemp().split('/')[-1]}.mp3"
    output_path = history_dir / output_filename
    final_mix.export(output_path, format="mp3")
    
    # Cleanup
    for f in audio_dir_path.glob("segment_*.mp3"):
        try: os.remove(f)
        except: pass
        
    return f"/history_files/{output_filename}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
