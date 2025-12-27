import os
import requests
import shutil
from dotenv import load_dotenv
from cartesia import Cartesia
from pydub import AudioSegment
import subprocess

load_dotenv()


class TTSConverter:
    def __init__(self):
        self.cartesia_key = os.getenv('CARTESIA_API_KEY')
        self.elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
        self.resemble_key = os.getenv('RESEMBLE_API_KEY')
        self.resemble_project_id = "dd6cd421"
        
        # Cartesia Voice IDs
        self.cartesia_voices = {
            "male": "228fca29-3a0a-435c-8728-5cb483251068", # Kiefer
            "female": "f786b574-daa5-4673-aa0c-cbe3e8534c02", # Katie
            "guest": "6926713b-d0c5-4a6d-867f-033857403eac"  # Baritono
        }

        # ElevenLabs Voice IDs
        self.eleven_voices = {
            "male": "pNInz6obpgDQGcFmaJgB", # Adam
            "female": "EXAVITQu4vr4xnSDxMaL", # Sarah
            "guest": "JBFqnCBsd6RMkjVDRZzb"  # George
        }

        # Resemble Voice IDs (Fallback Tier 3)
        self.resemble_voices = {
            "male": "e7e459d6",   # Ulrich
            "female": "fb2d2858", # Lucy (en-US)
            "guest": "a253156d"   # Jota
        }

        self.cartesia_client = None
        if self.cartesia_key:
            self.cartesia_client = Cartesia(api_key=self.cartesia_key)

    @property
    def voices(self):
        return self.cartesia_voices
        
    def convert(self, script: str, output_dir: str = "audio_segments") -> list:
        """Convert script to speech with multiple fallbacks."""
        if self.cartesia_client:
            self._setup_cartesia_voices()

        segments = self._parse_script(script)
        os.makedirs(output_dir, exist_ok=True)
        
        audio_files = []
        for i, (speaker, text) in enumerate(segments, 1):
            print(f"  Generating segment {i}/{len(segments)} ...")
            audio_file = os.path.join(output_dir, f"segment_{i:03d}.mp3")
            
            self._generate_and_save_speech(text, speaker, audio_file)
            audio_files.append((speaker, audio_file))
            print(f"  ✓ Saved to {audio_file}")
        
        return audio_files

    def _setup_cartesia_voices(self):
        """Attempts to clone voices in Cartesia if samples exist."""
        samples = {
            "male": "test_audio/1754476089398011524-298693777248327.mp3",
            "female": "test_audio/1754476231322799699-298694229168254.mp3"
        }
        try:
            voices_pager = self.cartesia_client.voices.list()
            existing_voices = [v for v in voices_pager]
            
            for speaker, sample_path in samples.items():
                if not os.path.exists(sample_path): continue
                voice_name = f"Podcast {speaker.capitalize()} Clone"
                found = next((v for v in existing_voices if v.get('name') == voice_name), None)
                
                if found:
                    self.cartesia_voices[speaker] = found['id']
                else:
                    new_voice = self.cartesia_client.voices.clone(
                        name=voice_name,
                        filepath=sample_path,
                        description=f"Cloned for podcast {speaker}"
                    )
                    self.cartesia_voices[speaker] = new_voice['id']
        except Exception as e:
            print(f"  ⚠️ Cartesia setup failed: {e}. Using defaults.")

    def _parse_script(self, script) -> list:
        segments = []
        if isinstance(script, list):
            lines = [str(item.get('text') if isinstance(item, dict) else item) for item in script]
        elif isinstance(script, dict):
            lines = [str(v) for v in script.values()]
        else:
            lines = str(script).strip().split('\n')
            
        for line in lines:
            line = line.strip()
            if line.startswith("Host 1:"):
                segments.append(("male", line.replace("Host 1:", "").strip()))
            elif line.startswith("Host 2:"):
                segments.append(("female", line.replace("Host 2:", "").strip()))
            elif line.startswith("Guest:"):
                segments.append(("guest", line.replace("Guest:", "").strip()))
        return segments

    def _extract_emotion_context(self, text: str) -> dict:
        """Extract emotional cues from text and map to Cartesia controls."""
        import re
        
        # Default emotional state
        emotion_controls = {
            "speed": "normal",
            "emotion": []
        }
        
        text_lower = text.lower()
        
        # Detect laughter/joy
        if re.search(r'\[laugh', text_lower) or re.search(r'\[chuckle', text_lower):
            emotion_controls["emotion"].append("positivity:high")
            
        # Detect excitement/energy
        if re.search(r'\[excit', text_lower) or re.search(r'\[energet', text_lower):
            emotion_controls["emotion"].append("curiosity:high")
            emotion_controls["speed"] = "fast"
            
        # Detect sadness/sorrow
        if re.search(r'\[sad', text_lower) or re.search(r'\[sorrow', text_lower) or re.search(r'\[sigh', text_lower):
            emotion_controls["emotion"].append("sadness:high")
            emotion_controls["speed"] = "slow"
            
        # Detect anger/frustration
        if re.search(r'\[angr', text_lower) or re.search(r'\[frustrat', text_lower):
            emotion_controls["emotion"].append("anger:high")
            
        # Detect calmness
        if re.search(r'\[calm', text_lower) or re.search(r'\[whisper', text_lower):
            emotion_controls["emotion"].append("positivity:low")
            emotion_controls["speed"] = "slow"
            
        # Detect nervousness/fear
        if re.search(r'\[nervous', text_lower) or re.search(r'\[scar', text_lower):
            emotion_controls["emotion"].append("anger:lowest")
            emotion_controls["speed"] = "fast"
        
        # If no specific emotion detected, use neutral positive
        if not emotion_controls["emotion"]:
            emotion_controls["emotion"] = ["positivity:medium", "curiosity:medium"]
        
        return emotion_controls


    def _generate_and_save_speech(self, text: str, speaker: str, output_file: str):
        """Core generation logic with 5-tier automatic fallback."""
        speaker = speaker.lower()
        import re
        
        # Extract emotional context for Cartesia emotional controls
        emotion_context = self._extract_emotion_context(text)
        
        # For Cartesia: KEEP emotional tags - it supports them natively!
        # Only clean for non-Cartesia fallbacks
        cartesia_text = re.sub(r'\*.*?\*', '', text).strip()  # Remove markdown only
        
        # For other services: clean all emotional markers
        clean_text = re.sub(r'\[.*?\]', '', text).strip()
        clean_text = re.sub(r'\*.*?\*', '', clean_text).strip()
        if not clean_text: return 
        
        # Step 1: Try Cartesia with EMOTIONAL CONTROLS
        if self.cartesia_client and self.cartesia_key:
            try:
                voice_id = self.cartesia_voices.get(speaker, self.cartesia_voices["male"])
                
                # Build voice config with emotional controls
                voice_config = {
                    "mode": "id",
                    "id": voice_id,
                    "__experimental_controls": emotion_context
                }
                
                print(f"  🎭 Cartesia generating with emotions: {emotion_context}")
                
                output = self.cartesia_client.tts.bytes(
                    model_id="sonic-english",
                    transcript=cartesia_text,  # Keep emotion tags!
                    voice=voice_config,
                    output_format={"container": "mp3", "encoding": "mp3", "sample_rate": 44100}
                )
                with open(output_file, 'wb') as f:
                    for chunk in output: f.write(chunk)
                return 
            except Exception as e:
                print(f"  ⚠️ Cartesia failed for {speaker}: {e}. Falling back to ElevenLabs...")

        # Step 2: Try ElevenLabs v3 (supports emotion tags!)
        if self.elevenlabs_key:
            try:
                voice_id = self.eleven_voices.get(speaker)
                if not voice_id:
                     voice_id = self.eleven_voices["male"]
                
                print(f"  -🎭 ElevenLabs v3 generating with emotions for {speaker} using voice {voice_id}")
                
                # ElevenLabs v3 supports emotion tags like [laughs], [whispers], [angry], etc.
                # Keep the emotional tags in the text!
                elevenlabs_text = re.sub(r'\*.*?\*', '', text).strip()  # Remove markdown only
                
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                headers = {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": self.elevenlabs_key
                }
                data = {
                    "text": elevenlabs_text,  # Keep emotion tags!
                    "model_id": "eleven_turbo_v2_5",  # v3 model with emotion support
                    "voice_settings": {
                        "stability": 0.5, 
                        "similarity_boost": 0.75,
                        "style": 0.5,  # Enable expressive delivery
                        "use_speaker_boost": True
                    }
                }
                response = requests.post(url, json=data, headers=headers)
                if response.status_code == 200:
                    with open(output_file, 'wb') as f:
                        f.write(response.content)
                    print(f"  ✨ ElevenLabs saved emotional audio for {speaker}")
                    return 
                else:
                    print(f"  ⚠️ ElevenLabs API Error: {response.text}")
            except Exception as e:
                print(f"  ⚠️ ElevenLabs failed for {speaker}: {e}")


        # Step 3: Try Resemble AI API
        if self.resemble_key:
            try:
                voice_uuid = self.resemble_voices.get(speaker, self.resemble_voices["female"])
                print(f"  -> Resemble AI generating for {speaker} using voice {voice_uuid}")
                
                url = f"https://app.resemble.ai/api/v2/projects/{self.resemble_project_id}/clips"
                headers = {
                    "Authorization": f"Token token={self.resemble_key}",
                    "Content-Type": "application/json"
                }
                data = {
                    "title": f"Podcast Segment {speaker}",
                    "body": clean_text,
                    "voice_uuid": voice_uuid,
                    "is_public": False,
                    "is_archived": False
                }
                
                res = requests.post(url, json=data, headers=headers)
                if res.status_code == 200:
                    clip_data = res.json().get("item")
                    audio_src = clip_data.get("audio_src")
                    if audio_src:
                        audio_res = requests.get(audio_src)
                        with open(output_file, 'wb') as f:
                            f.write(audio_res.content)
                        print(f"  ✨ Resemble AI saved audio for {speaker}")
                        return
                else:
                    print(f"  ⚠️ Resemble API Error: {res.text}")
            except Exception as e:
                print(f"  ⚠️ Resemble AI failed: {e}")

        # Step 4: Try Resemble Chatterbox
        try:
            from gradio_client import Client, handle_file
            print(f"  -> Resemble Chatterbox generating for {speaker} (final fallback)")
            
            sample_path = None
            if speaker == "male":
                sample_path = "test_audio/1754476089398011524-298693777248327.mp3"
            elif speaker == "female":
                sample_path = "test_audio/1754476231322799699-298694229168254.mp3"
            
            sample_arg = None
            if sample_path and os.path.exists(sample_path):
                 sample_arg = handle_file(os.path.abspath(sample_path))

            client = Client("ResembleAI/Chatterbox")
            result = client.predict(
                text_input=clean_text[:300],  
                audio_prompt_path_input=sample_arg,
                exaggeration_input=0.5,
                temperature_input=0.8,
                seed_num_input=0,
                cfgw_input=0.5,
                vad_trim_input=False,
                api_name="/generate_tts_audio"
            )
            
            if result and os.path.exists(result):
                ffmpeg_path = shutil.which("ffmpeg") or "ffmpeg"
                try:
                    subprocess.run(
                        [ffmpeg_path, "-y", "-i", result, "-f", "mp3", output_file],
                        check=True,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    print(f"  ✨ Resemble Chatterbox saved audio (converted) for {speaker}")
                    return
                except subprocess.CalledProcessError as e:
                    print(f"  ⚠️ FFmpeg failed: {e.stderr}")
                    try:
                        with open("last_ffmpeg_error.txt", "w") as log: log.write(e.stderr)
                    except: pass
        except Exception as e:
            print(f"  ⚠️ Resemble Chatterbox failed: {e}")

        # Step 5: Try Edge TTS (Free Neural - Ultimate Backup)
        try:
            import sys
            print(f"  -> Edge TTS generating for {speaker} (ultimate backup)")
            edge_voice = "en-US-GuyNeural" # Default Male
            if speaker == "female":
                edge_voice = "en-US-AriaNeural"
            elif speaker == "guest":
                edge_voice = "en-US-EricNeural"
            
            edge_bin = shutil.which("edge-tts")
            if not edge_bin:
                # Fallback to venv bin
                edge_bin = os.path.join(os.path.dirname(sys.executable), "edge-tts")
            
            subprocess.run(
                [edge_bin, "--text", clean_text, "--voice", edge_voice, "--write-media", output_file],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            if os.path.exists(output_file) and os.path.getsize(output_file) > 0:
                print(f"  ✨ Edge TTS saved audio for {speaker}")
                return
        except Exception as e:
            print(f"  ⚠️ Edge TTS failed: {e}")

        # Step 6: If all 5 engines fail
        if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
            raise Exception(f"All 5 TTS Engines failed for speaker: {speaker}")