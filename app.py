import os
import tempfile
import streamlit as st
from pathlib import Path
from pydub import AudioSegment

from scraper import WebScraper
from script_generator import ScriptGenerator
from tts_converter import TTSConverter
from history_manager import HistoryManager

history_mgr = HistoryManager()

# Page config
st.set_page_config(
    page_title="AI Podcast Generator",
    page_icon="🎙️",
    layout="wide"
)

# Custom CSS
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    .stApp {
        background: radial-gradient(circle at top right, #1e293b, #0f172a);
    }
    
    .main-header {
        font-size: 4rem;
        font-weight: 800;
        text-align: center;
        background: linear-gradient(to right, #60a5fa, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
    }
    
    div[data-testid="stSidebar"] {
        background-color: #0f172a;
        border-right: 1px solid rgba(255,255,255,0.1);
    }
    
    .stButton>button {
        border-radius: 0.75rem;
        font-weight: 600;
        transition: all 0.2s;
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
        border-color: #60a5fa;
    }
    
    .stTextInput>div>div>input {
        background-color: rgba(255,255,255,0.05);
        color: white;
        border-radius: 0.75rem;
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .status-box {
        padding: 1.5rem;
        border-radius: 1rem;
        margin: 1.5rem 0;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
    }
    
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
        background-color: transparent;
    }
    
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        background-color: transparent;
        border-radius: 4px 4px 0 0;
        gap: 1rem;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    </style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 3rem; border-radius: 1.5rem; margin-bottom: 2.5rem; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <h1 style="color: white; font-size: 3.5rem; margin-bottom: 0.5rem; text-align: center; font-weight: 800; letter-spacing: -0.025em;">
            🎙️ PodMaster AI
        </h1>
        <p style="color: #94a3b8; font-size: 1.25rem; text-align: center; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            The ultimate studio for transforming any URL into a high-production podcast featuring the world's most iconic voices.
        </p>
    </div>
""", unsafe_allow_html=True)

# Influencer Inspiration
st.image("hosts_collage.png", use_container_width=True, caption="Inspiration: Raj Shamani, Joe Rogan, and Prakhar Pravachan")

st.markdown('<div class="sub-header" style="color: #cbd5e1; font-weight: 500;">Ready to create your next viral episode?</div>', unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.header("⚙️ Configuration")
    
    st.subheader("API Keys")
    crawlbase_key = st.text_input("Crawlbase Token", type="password", value=os.getenv('CRAWLBASE_API_KEY', ''))
    cerebras_key = st.text_input("Cerebras API Key", type="password", value=os.getenv('CEREBRAS_API_KEY', ''))
    cartesia_key = st.text_input("Cartesia API Key", type="password", value=os.getenv('CARTESIA_API_KEY', ''))
    
    st.divider()
    
    st.subheader("📝 Input")
    url = st.text_input("Article URL", placeholder="https://example.com/article")
    
    st.divider()
    
    generate_btn = st.button("🚀 Generate Podcast", type="primary", use_container_width=True)
    
    st.divider()
    st.header("🕒 History")
    history = history_mgr.get_history()
    
    if history:
        for entry in history:
            with st.container():
                st.markdown(f"""
                    <div style="background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="color: #e2e8f0; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {entry['url']}
                        </div>
                        <div style="color: #94a3b8; font-size: 0.7rem;">
                            {entry['timestamp'][:16].replace('T', ' ')}
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                if st.button("Open Project", key=entry['id'], use_container_width=True):
                    st.session_state.view_history_id = entry['id']
                    st.rerun()
    else:
        st.caption("No history yet")

# Main area
if generate_btn or "use_script_from_history" in st.session_state:
    # Set environment variables from sidebar or current env
    os.environ['CRAWLBASE_API_KEY'] = crawlbase_key
    os.environ['CEREBRAS_API_KEY'] = cerebras_key
    os.environ['CARTESIA_API_KEY'] = cartesia_key

    # Check if we are using a history script
    is_history_mode = "use_script_from_history" in st.session_state
    current_script = st.session_state.get("use_script_from_history")
    current_url = url if not is_history_mode else st.session_state.get("use_url_from_history")

    progress_container = st.container()
    
    with progress_container:
        if not is_history_mode:
            # Step 1: Scraping
            with st.status("🌐 Scraping content from URL...", expanded=True) as status:
                try:
                    scraper = WebScraper()
                    content = scraper.scrape(url)
                    st.success(f"✅ Successfully scraped {len(content)} characters")
                    status.update(label="✅ Content scraped successfully!", state="complete")
                except Exception as e:
                    st.error(f"❌ Scraping failed: {str(e)}")
                    st.stop()
            
            # Step 2: Script Generation
            with st.status("✍️ Generating podcast script...", expanded=True) as status:
                try:
                    generator = ScriptGenerator()
                    script = generator.generate(content)
                    # Save to history
                    history_mgr.save_generation(url, content, script)
                    st.success("✅ Podcast script generated and saved to history")
                    status.update(label="✅ Script generated successfully!", state="complete")
                    current_script = script
                except Exception as e:
                    st.error(f"❌ Script generation failed: {str(e)}")
                    st.stop()
        else:
            st.info(f"📜 Using existing script from history for: {current_url}")
            script = current_script

        # Step 3: Audio Generation
        with st.status("🎙️ Converting script to audio...", expanded=True) as status:
            try:
                converter = TTSConverter()
                
                # Parse script to get segment count
                segments = converter._parse_script(script)
                total_segments = len(segments)
                
                st.info(f"Generating {total_segments} audio segments...")
                
                progress_bar = st.progress(0)
                progress_text = st.empty()
                
                # Create persistent audio directory
                audio_dir = tempfile.mkdtemp()
                audio_files = []
                
                for i, (speaker, text) in enumerate(segments, 1):
                    progress_text.text(f"Processing segment {i}/{total_segments} ...")
                    voice = converter.voices.get(speaker, converter.voices["male"])
                    audio_file = os.path.join(audio_dir, f"segment_{i:03d}.mp3")
                    
                    converter._generate_and_save_speech(text, voice, audio_file)
                    
                    # Verify file exists before adding to list
                    if os.path.exists(audio_file) and os.path.getsize(audio_file) > 0:
                        audio_files.append((speaker, audio_file))
                    else:
                        raise Exception(f"Failed to generate audio for segment {i}")
                    
                    progress_bar.progress(i / total_segments)
                
                progress_text.text("✅ All segments generated!")
                status.update(label="✅ Audio generated successfully!", state="complete")
                
            except Exception as e:
                st.error(f"❌ Audio generation failed: {str(e)}")
                st.stop()
        
        # Step 4: Merge Audio
        with st.status("🔗 Merging audio segments...", expanded=True) as status:
            try:
                # Verify all files exist and filter out corrupted ones
                st.info(f"Verifying {len(audio_files)} audio files...")
                valid_files = []
                corrupted_segments = []
                
                for i, (speaker, filepath) in enumerate(audio_files, 1):
                    if not os.path.exists(filepath):
                        corrupted_segments.append(i)
                        st.warning(f"⚠️ Segment {i} missing")
                        continue
                    
                    file_size = os.path.getsize(filepath)
                    if file_size < 1024:  # Less than 1KB is likely corrupted
                        corrupted_segments.append(i)
                        st.warning(f"⚠️ Segment {i} corrupted ({file_size} bytes)")
                        continue
                    
                    # Verify it's a valid MP3
                    try:
                        test_audio = AudioSegment.from_mp3(filepath)
                        if len(test_audio) < 100:  # Less than 100ms is suspicious
                            corrupted_segments.append(i)
                            st.warning(f"⚠️ Segment {i} too short")
                            continue
                    except Exception as e:
                        corrupted_segments.append(i)
                        st.warning(f"⚠️ Segment {i} invalid MP3: {str(e)}")
                        continue
                    
                    valid_files.append((speaker, filepath))
                    st.text(f"✓ Segment {i} verified ({file_size} bytes)")
                
                if corrupted_segments:
                    st.warning(f"⚠️ Skipping {len(corrupted_segments)} corrupted segments: {corrupted_segments}")
                
                if len(valid_files) == 0:
                    raise Exception("No valid audio segments to merge")
                
                st.info(f"Merging {len(valid_files)} valid audio segments...")
                combined = AudioSegment.empty()
                
                for i, (speaker, filepath) in enumerate(valid_files, 1):
                    st.text(f"Adding segment {i}/{len(valid_files)}...")
                    audio = AudioSegment.from_mp3(filepath)
                    combined += audio
                
                # Export merged audio
                output_path = os.path.join(audio_dir, "full_podcast.mp3")
                st.info("Exporting final podcast...")
                combined.export(output_path, format="mp3")
                
                # Verify output file
                if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                    raise Exception("Failed to create merged podcast file")
                
                st.success(f"✅ Podcast merged successfully ({os.path.getsize(output_path)} bytes)")
                if corrupted_segments:
                    st.info(f"ℹ️ Note: {len(corrupted_segments)} segments were skipped due to corruption")
                status.update(label="✅ Podcast ready!", state="complete")
                
                # Update audio_files to only include valid ones
                audio_files = valid_files
                
            except Exception as e:
                st.error(f"❌ Audio merging failed: {str(e)}")
                # st.write("Debug info:")
                # st.write(f"Audio directory: {audio_dir}")
                # st.write(f"Files in directory: {os.listdir(audio_dir) if os.path.exists(audio_dir) else 'Directory not found'}")
                st.stop()
        
        st.divider()
        st.header("📊 Results")
        
        tab1, tab2 = st.tabs(["🎧 Podcast", "📝 Script"])
        
        with tab1:
            st.subheader("Full Podcast")
            with open(output_path, "rb") as f:
                st.audio(f.read(), format="audio/mp3")
            
            with open(output_path, "rb") as f:
                st.download_button(
                    label="📥 Download Full Podcast",
                    data=f.read(),
                    file_name="podcast.mp3",
                    mime="audio/mp3",
                    use_container_width=True
                )
        
        with tab2:
            st.subheader("Podcast Script")
            st.text_area("", script, height=400)
            
            st.download_button(
                label="📥 Download Script",
                data=script,
                file_name="podcast_script.txt",
                mime="text/plain",
                use_container_width=True
            )
        
        if is_history_mode:
            # Clean up session state after generation
            del st.session_state.use_script_from_history
            del st.session_state.use_url_from_history
            if "view_history_id" in st.session_state:
                del st.session_state.view_history_id

        st.balloons()

if "view_history_id" in st.session_state:
    detail = history_mgr.get_generation_detail(st.session_state.view_history_id)
    if detail:
        st.divider()
        st.header(f"📜 Generation History: {detail['url']}")
        st.caption(f"Generated on: {detail['timestamp']}")
        
        tab_h1, tab_h2 = st.tabs(["📝 Script", "🌐 Scraped Content"])
        with tab_h1:
            st.text_area("Generated Script", detail['script'], height=400)
            if st.button("🎙️ Generate Audio from this Script", use_container_width=True):
                st.session_state.use_script_from_history = detail['script']
                st.session_state.use_url_from_history = detail['url']
                st.rerun()
        with tab_h2:
            st.text_area("Scraped Raw Content", detail['content'], height=400)
            
        if st.button("⬅️ Clear View"):
            del st.session_state.view_history_id
            st.rerun()

elif not generate_btn:
    st.info("👈 Get started by entering your API keys in the sidebar and providing an article URL")
    
    with st.expander("ℹ️ How it works"):
        st.markdown("""
        1. **Scraping**: We use Crawlbase to extract content from any URL
        2. **Script Generation**: Cerebras (Qwen) transforms the content into an engaging dialogue
        3. **Audio Synthesis**: Cartesia creates ultra-realistic voices with low latency
        4. **Merging**: All segments are combined into one seamless podcast
        """)
    
    with st.expander("🔑 Where to get API keys"):
        st.markdown("""
        - **Crawlbase**: [crawlbase.com](https://crawlbase.com)
        - **Cerebras**: [cerebras.ai](https://cerebras.ai)
        - **Cartesia**: [play.cartesia.ai](https://play.cartesia.ai)
        """)