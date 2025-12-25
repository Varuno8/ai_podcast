from pydub import AudioSegment
from pydub.generators import Sine, Pulse, Square, Sawtooth, WhiteNoise
import os

def generate_loop(vibe, duration_ms=10000):
    if vibe == "LOFI":
        # Soft sine wave + white noise
        gen = Sine(110).to_audio_segment(duration=duration_ms).apply_gain(-20)
        noise = WhiteNoise().to_audio_segment(duration=duration_ms).apply_gain(-40)
        loop = gen.overlay(noise)
    elif vibe == "TENSE":
        # Low pulse wave
        loop = Pulse(60).to_audio_segment(duration=duration_ms).apply_gain(-15)
    elif vibe == "EXCITED":
        # Fast sawtooth
        loop = Sawtooth(220).to_audio_segment(duration=duration_ms).apply_gain(-25)
    elif vibe == "CORPORATE":
        # Mid sine wave
        loop = Sine(440).to_audio_segment(duration=duration_ms).apply_gain(-25)
    else:
        loop = AudioSegment.silent(duration=duration_ms)
    
    # Simple fade to allow looping without pops
    loop = loop.fade_in(50).fade_out(50)
    return loop

music_dir = "music"
if not os.path.exists(music_dir):
    os.makedirs(music_dir)

vibes = ["LOFI", "TENSE", "EXCITED", "CORPORATE"]
for v in vibes:
    path = os.path.join(music_dir, f"{v.lower()}.mp3")
    print(f"Generating {path}...")
    generate_loop(v).export(path, format="mp3")
