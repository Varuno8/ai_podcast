import os
from dotenv import load_dotenv
from cartesia import Cartesia

load_dotenv()

def test_cartesia():
    api_key = os.getenv('CARTESIA_API_KEY')
    if not api_key:
        print("❌ Error: CARTESIA_API_KEY not found in .env")
        return

    print(f"Connecting to Cartesia with key: {api_key[:10]}...")
    client = Cartesia(api_key=api_key)
    
    # Using specific Sonic 3 English voice IDs from documentation
    voice_id = "f786b574-daa5-4673-aa0c-cbe3e8534c02" # Katie (Sonic 3)
    
    try:
        print("Sending TTS request...")
        output = client.tts.bytes(
            model_id="sonic-english",
            transcript="Hello! This is a test of the Cartesia API using a validated Sonic voice ID.",
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
        
        with open("test_cartesia_output.mp3", "wb") as f:
            for chunk in output:
                f.write(chunk)
            
        print("✅ Success! Audio saved to test_cartesia_output.mp3")
        
        # Check cloning capability list
        print("Checking voices library...")
        voices = client.voices.list()
        print(f"Found {len(voices)} voices in your library.")
        for v in voices:
            if "Clone" in v['name']:
                print(f" - Cloned Voice: {v['name']} (ID: {v['id']})")
        
    except Exception as e:
        print(f"❌ Test Failed: {str(e)}")

if __name__ == "__main__":
    test_cartesia()
