#!/usr/bin/env python3
"""
Test script to demonstrate emotional TTS capabilities
"""
import os
from dotenv import load_dotenv
from tts_converter import TTSConverter

load_dotenv()

# Test script with various emotions
test_script = """
Host 1: [excited] Hey everyone! Welcome to today's episode! This is going to be AMAZING!

Host 2: [laughs] I can tell you're pumped. What's got you so energized today?

Host 1: [calm] Well, let me tell you... we just discovered something incredible about AI and emotions.

Host 2: [curious] Oh? Do tell!

Host 1: [whispers] It turns out... [pauses] our TTS system can now actually express real emotions!

Host 2: [shocked] No way! That's incredible!

Host 1: [nervous] I know right? I was skeptical at first too...

Host 2: [frustrated] Why didn't we have this earlier?! This changes everything!

Host 1: [sighs] I know... but hey, better late than never, right?

Host 2: [cheerfully] Absolutely! This is going to make our podcasts so much more engaging!
"""

def main():
    print("🎭 Testing Emotional TTS Capabilities\n")
    print("=" * 60)
    
    # Check if API keys are set
    if not os.getenv('CARTESIA_API_KEY'):
        print("⚠️  WARNING: CARTESIA_API_KEY not set!")
        print("   Set it in your .env file for best emotional results")
    
    if not os.getenv('ELEVENLABS_API_KEY'):
        print("⚠️  INFO: ELEVENLABS_API_KEY not set (optional)")
        print("   ElevenLabs v3 also supports great emotions")
    
    print("\n" + "=" * 60)
    print("\n🎬 Generating emotional podcast segments...\n")
    
    converter = TTSConverter()
    output_dir = "test_emotional_output"
    
    try:
        audio_files = converter.convert(test_script, output_dir=output_dir)
        
        print("\n" + "=" * 60)
        print(f"\n✅ SUCCESS! Generated {len(audio_files)} emotional segments")
        print(f"📁 Output directory: {output_dir}/")
        print("\nGenerated files:")
        for speaker, filepath in audio_files:
            file_size = os.path.getsize(filepath)
            print(f"  • {filepath} ({file_size:,} bytes) - {speaker}")
        
        print("\n🎧 Listen to the files to hear the emotional differences!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
