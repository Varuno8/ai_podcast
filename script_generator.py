import os
import requests
from dotenv import load_dotenv

load_dotenv()


class ScriptGenerator:
    PERSONA_PROMPTS = {
        "investigator": """
            Tone: Serious, skeptical, and analytical. 
            Style: Host 1 plays "The Detective", constantly questioning sources and looking for hidden motives. Host 2 provides the facts but gets grilled. 
            Focus: Uncover the "truth" behind the article. Use phrases like "But what aren't they telling us?" or "Follow the money."
        """,
        "comedian": """
            Tone: Witty, lighthearted, and punchy. 
            Style: Host 1 is the Setup, Host 2 is the Punchline (or vice versa). Use roasting, modern slang, and pop culture references.
            Focus: Make the content entertaining. If the article is dry, mock how dry it is. Use analogies like "That's like trying to download a car."
        """,
        "friend": """
            Tone: Casual, empathetic, and slang-heavy.
            Style: Two best friends chatting over coffee. Lots of "Dude," "No way," "That's crazy."
            Focus: How this affects regular people. Emotional connection and relatability.
        """
    }

    DEPTH_PROMPTS = {
        "summary": "Length: Short and punchy (max 5-7 exchanges). Focus ONLY on the headline and key takeaway. finish in 2 minutes.",
        "deep_dive": "Length: Detailed and comprehensive (15-20 exchanges). Explore nuances, background context, and implications. Take your time."
    }

    def __init__(self):
        # self.api_key = os.getenv('CEREBRAS_API_KEY') # No longer needed as it's fetched directly in generate
        # self.api_url = "https://api.cerebras.ai/v1/chat/completions" # No longer needed as it's hardcoded in generate
        # self.model = "qwen-2.5-72b" # No longer needed as it's hardcoded in generate
        pass
    
    def generate(self, content, persona="investigator", depth="deep_dive", improv=False, guest_persona=None):
        headers = {
            "Authorization": f"Bearer {os.environ.get('CEREBRAS_API_KEY')}",
            "Content-Type": "application/json"
        }

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
        You are a professional podcast script writer and content strategist. 
        Convert the following article into a structured podcast package.

        PERSONA:
        {persona_instruction}
        
        {guest_instruction}
        
        DEPTH/LENGTH:
        {depth_instruction}
        
        {f"IMPROV MODE ENABLED: Inject natural interruptions [Laughs], rhetorical questions, and human analogies." if improv else ""}

        OUTPUT SPECIFICATION:
        Return ONLY a JSON object with the following keys:
        1. "script": The full dialogue in "Host 1: [text]" format.
        2. "chapters": A list of {{"title": "Section Title", "estimate_seconds": N}} where N is the cumulative time.
        3. "show_notes": A 100-word professional summary of the episode.
        4. "social_assets": {{"linkedin": "long-form post", "twitter": "series of 3-5 punchy bullets"}}.
        5. "segments": A list of {{"start_line_index": N, "sentiment": "LOFI" | "TENSE" | "EXCITED" | "CORPORATE"}}. N is the 0-based index of the dialogue line where this mood starts. Use "LOFI" for casual/intro, "TENSE" for serious/mystery, "EXCITED" for debates/reveal, "CORPORATE" for ads/tech specs. Ensure at least one segment starts at index 0.

        Rules:
        - Format: JSON absolute. No markdown code blocks, just the raw json.
        - Engaging and natural dialogue.
        
        Article:
        {content[:4000]}...
        """

        data = {
            "model": "llama3.1-8b",
            "messages": [
                {"role": "system", "content": "You are an expert podcast strategist that outputs ONLY raw JSON."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 8192,
            "response_format": {"type": "json_object"}
        }

        try:
            response = requests.post("https://api.cerebras.ai/v1/chat/completions", headers=headers, json=data)
            if response.status_code == 200:
                import json
                result = response.json()['choices'][0]['message']['content']
                # Clean if model accidentally added markdown blocks
                if "```json" in result:
                    result = result.split("```json")[1].split("```")[0].strip()
                return json.loads(result)
            else:
                raise Exception(f"Script Generation failed: {response.text}")
        except Exception as e:
            raise Exception(f"Script generation error: {str(e)}")
    
    def _create_prompt(self, content: str) -> str:
        return f"""Convert the following content into an engaging podcast script between two hosts.

Format the script as a natural conversation with:
- Host 1 (Male): A curious and enthusiastic interviewer
- Host 2 (Female): A knowledgeable expert on the topic

Requirements:
- Break down complex topics into digestible segments
- Use conversational language
- Include natural transitions and reactions
- Keep it engaging, informative and concise. 
- Format each line as "Host 1:" or "Host 2:" followed by their dialogue

Content to convert:
{content}

Generate the podcast script now:"""