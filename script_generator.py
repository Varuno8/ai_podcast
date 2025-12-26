import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

class ScriptGenerator:
    PERSONA_PROMPTS = {
        "investigator": """
            Tone: Serious, investigative, and highly analytical. 
            Host 1 Persona: "The Detective". Skeptical, focused on 'following the money', constantly questioning the validity of statements.
            Host 2 Persona: "The Researcher". Provides the facts but is pushed to find deeper connections.
            Dynamic: A high-stakes investigation. Use phrases like "Wait, let's look at the timeline," or "That sounds like a convenient narrative."
            Vibe: 🕵️ True Crime / Investigative Journalism.
        """,
        "comedian": """
            Tone: Sarcastic, high-energy, and irreverent. 
            Host 1 Persona: "The Roaster". Uses heavy sarcasm, makes fun of the article's dry parts, and uses modern internet slang (e.g., 'sus', 'main character energy', 'L move').
            Host 2 Persona: "The Hype Man". Laughs at the jokes, adds absurd analogies, and keep the energy levels at 100.
            Dynamic: A late-night comedy set. Roast the topic. If it's serious, find the irony. Use ridiculous comparisons (e.g., "That's like bringing a spoon to a knife fight at a circus").
            Vibe: 🎙️ Stand-up / Roast Room.
        """,
        "friend": """
            Tone: Warm, conversational, and relatable. 
            Host 1 Persona: "The Enthusiast". Very "OMG did you see this?", uses lots of "Dude", "Honestly", and "That's wild".
            Host 2 Persona: "The Confidant". Very supportive, shares personal-sounding "anecdotes", and focuses on the emotional side.
            Dynamic: Two best friends catching up over coffee. Use "we all feel this" language. Focus on real-world impact for regular people.
            Vibe: ☕ Casual Hangout / Life Chat.
        """
    }

    DEPTH_PROMPTS = {
        "summary": "Length: Short (max 6 exchanges). High-speed overview for busy people. Finish in under 2 minutes of audio.",
        "deep_dive": "Length: Extensive (20+ exchanges). Deep philosophical exploration. Check every detail, discuss the future, and find obscure connections. This is a long-form podcast."
    }

    def __init__(self):
        self.gemini_key = os.environ.get('GEMINI_API_KEY')
        self.cerebras_key = os.environ.get('CEREBRAS_API_KEY')
        self.openrouter_key = os.environ.get('OPENROUTER_API_KEY')
    
    def generate(self, content, persona="investigator", depth="deep_dive", improv=False, guest_persona=None):
        persona_instruction = self.PERSONA_PROMPTS.get(persona, self.PERSONA_PROMPTS["investigator"])
        depth_instruction = self.DEPTH_PROMPTS.get(depth, self.DEPTH_PROMPTS["deep_dive"])
        
        guest_instruction = ""
        if guest_persona:
            guest_instruction = f"""
            GUEST SPEAKER INVITED: {guest_persona.get('name', 'Expert Guest')}
            Persona Traits: {guest_persona.get('speaking_style')}
            Bio: {guest_persona.get('background')}
            Likely opinions: {guest_persona.get('likely_opinions')}
            
            Format: The guest should be identified as "Guest: [text]".
            Hosts should interact with the guest naturally, asking questions and reacting to their background.
            The podcast is now a 3-way conversation.
            """

        prompt = f"""
        You are a world-class Podcast Script Writer. 
        Your task is to transform the provided content into a viral podcast script.

        CRITICAL STYLE GUIDE (STRICT ADHERENCE REQUIRED):
        {persona_instruction}
        
        {guest_instruction}
        
        EPISODE STRUCTURE:
        {depth_instruction}
        
        {f"IMPROV MODE ENABLED: YOU MUST inject natural human elements: [Laughs], [Sighs], interruptions, self-corrections, and 'Umm/Uh' fillers. Hosts should talk over each other slightly." if improv else ""}

        OUTPUT SPECIFICATION:
        Return ONLY a JSON object with:
        1. "script": Full dialogue as one string. Use speaker names: "Host 1:", "Host 2:", and "Guest:" if applicable. Ensure the dialogue matches the PERSONA traits above perfectly.
        2. "chapters": List of {{"title": "Section Name", "estimate_seconds": N}}.
        3. "show_notes": Engaging 100-word summary.
        4. "social_assets": {{"linkedin": "viral post", "twitter": "thread"}}.
        5. "segments": List of {{"start_line_index": N, "sentiment": "LOFI"|"TENSE"|"EXCITED"|"CORPORATE"}}.

        Content:
        {content[:4000]}
        """

        # Tier 1: Gemini 3 Flash
        if self.gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={self.gemini_key}"
                data = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                res = requests.post(url, json=data, timeout=30)
                if res.status_code == 200:
                    text = res.json()['candidates'][0]['content']['parts'][0]['text']
                    return json.loads(text)
            except Exception as e:
                print(f"Gemini Generation Failed: {e}")

        # Tier 2: OpenRouter (Wait, user said fallback to OpenRouter)
        if self.openrouter_key:
            try:
                headers = {"Authorization": f"Bearer {self.openrouter_key}", "Content-Type": "application/json"}
                data = {
                    "model": "qwen/qwen3-4b:free",
                    "messages": [{"role": "user", "content": prompt}]
                }
                res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data, timeout=30)
                if res.status_code == 200:
                    result = res.json()['choices'][0]['message']['content']
                    if "```json" in result:
                        result = result.split("```json")[1].split("```")[0].strip()
                    return json.loads(result)
            except Exception as e:
                print(f"OpenRouter Fallback Failed: {e}")

        # Tier 3: Cerebras Fallback
        if self.cerebras_key:
            try:
                headers = {"Authorization": f"Bearer {self.cerebras_key}", "Content-Type": "application/json"}
                data = {
                    "model": "llama3.1-8b",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
                res = requests.post("https://api.cerebras.ai/v1/chat/completions", headers=headers, json=data, timeout=30)
                if res.status_code == 200:
                    result = res.json()['choices'][0]['message']['content']
                    return json.loads(result)
            except Exception as e:
                print(f"Cerebras Final Fallback Failed: {e}")
        
        raise Exception("All generation engines exhausted.")