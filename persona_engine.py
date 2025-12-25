import os
import requests
from scraper import WebScraper

class PersonaEngine:
    def __init__(self):
        self.scraper = WebScraper()
        self.api_key = os.environ.get('CEREBRAS_API_KEY')
        
    def extract_persona(self, url):
        if not url:
            return None
            
        try:
            # Step 1: Scrape content
            content = self.scraper.scrape(url)
            
            # Step 2: Extract traits using LLM
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            prompt = f"""
            Analyze the following text from a person's profile/wiki and extract their AI persona traits for a podcast.
            
            Content:
            {content[:3000]}
            
            Return ONLY a JSON object with:
            - "name": Full Name
            - "speaking_style": Description of their tone, vocabulary, and cadence.
            - "expertise": Key areas mention in the text.
            - "background": A 1-sentence bio.
            - "likely_opinions": 2-3 specific views they might hold based on the text.
            """
            
            data = {
                "model": "llama3.1-8b",
                "messages": [
                    {"role": "system", "content": "You are an expert profile analyst that outputs raw JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            
            response = requests.post("https://api.cerebras.ai/v1/chat/completions", headers=headers, json=data)
            if response.status_code == 200:
                import json
                return json.loads(response.json()['choices'][0]['message']['content'])
            else:
                return None
        except Exception as e:
            print(f"Persona extraction error: {e}")
            return None
