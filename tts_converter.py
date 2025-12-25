import os
import requests
from dotenv import load_dotenv
from cartesia import Cartesia

load_dotenv()


class TTSConverter:
    def __init__(self):
        self.api_key = os.getenv('CARTESIA_API_KEY')
        self.client = None
        if self.api_key:
            self.client = Cartesia(api_key=self.api_key)
        
        # Default voice embeddings or IDs (will be replaced by clones)
        self.voices = {
            "male": "228fca29-3a0a-435c-8728-5cb483251068", # Kiefer (Sonic 3)
            "female": "f786b574-daa5-4673-aa0c-cbe3e8534c02", # Katie (Sonic 3)
            "guest": "6926713b-d0c5-4a6d-867f-033857403eac"  # Baritono (Sonic 3) - using a distinct voice
        }
        
    def convert(self, script: str, output_dir: str = "audio_segments") -> list:
        """Convert script to speech using Cartesia."""
        if not self.api_key:
            raise Exception("CARTESIA_API_KEY not found. Please add it to your .env file.")
        
        if not self.client:
            self.client = Cartesia(api_key=self.api_key)

        # 1. Setup/Clone voices from your files
        self._setup_cartesia_voices()

        segments = self._parse_script(script)
        os.makedirs(output_dir, exist_ok=True)
        
        audio_files = []
        for i, (speaker, text) in enumerate(segments, 1):
            print(f"  Generating segment {i}/{len(segments)} ...")
            voice_id = self.voices.get(speaker)
            audio_file = os.path.join(output_dir, f"segment_{i:03d}.mp3")
            
            self._generate_and_save_speech(text, voice_id, audio_file)
            audio_files.append((speaker, audio_file))
            print(f"  ✓ Saved to {audio_file}")
        
        return audio_files

    def _setup_cartesia_voices(self):
        """Clones voices using Cartesia if samples exist."""
        samples = {
            "male": "test_audio/1754476089398011524-298693777248327.mp3",
            "female": "test_audio/1754476231322799699-298694229168254.mp3"
        }
        
        try:
            # client.voices.list() returns a Pager object, iterate over it
            voices_pager = self.client.voices.list()
            existing_voices = []
            for voice in voices_pager:
                existing_voices.append(voice)
            
            for speaker, sample_path in samples.items():
                if not os.path.exists(sample_path):
                    continue

                voice_name = f"Podcast {speaker.capitalize()} Clone"
                
                # Check if already cloned
                found_voice = next((v for v in existing_voices if v.get('name') == voice_name), None)
                
                if found_voice:
                    self.voices[speaker] = found_voice['id']
                    print(f"  ✓ Using existing Cartesia clone: {voice_name}")
                else:
                    # Create new clone
                    print(f"  + Cloning {speaker} voice with Cartesia...")
                    with open(sample_path, 'rb') as f:
                        new_voice = self.client.voices.clone(
                            name=voice_name,
                            filepath=sample_path,
                            description=f"Cloned for podcast {speaker}"
                        )
                        self.voices[speaker] = new_voice['id']
                        print(f"  ✨ Successfully cloned {speaker} in Cartesia!")

        except Exception as e:
            print(f"  ⚠️ Cartesia cloning failed: {str(e)}. Using default voices.")

    def _parse_script(self, script: str) -> list:
        segments = []
        for line in script.strip().split('\n'):
            line = line.strip()
            if line.startswith("Host 1:"):
                segments.append(("male", line.replace("Host 1:", "").strip()))
            elif line.startswith("Host 2:"):
                segments.append(("female", line.replace("Host 2:", "").strip()))
            elif line.startswith("Guest:"):
                segments.append(("guest", line.replace("Guest:", "").strip()))
        return segments

    def _generate_and_save_speech(self, text: str, voice_id: str, output_file: str):
        """Generate audio using Cartesia and save to file."""
        try:
            # Use the bytes endpoint for simple file generation
            # Output format: mp3, 44100Hz
            # tts.bytes returns a generator of bytes chunks
            output = self.client.tts.bytes(
                model_id="sonic-english",
                transcript=text,
                voice={
                    "mode": "id",
                    "id": voice_id
                },
                output_format={
                    "container": "mp3",
                    "encoding": "mp3",
                    "sample_rate": 44100
                }
            )
            
            with open(output_file, 'wb') as f:
                for chunk in output:
                    f.write(chunk)
                
        except Exception as e:
            raise Exception(f"Cartesia TTS Error: {str(e)}")