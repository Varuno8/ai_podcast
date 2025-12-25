import os
import requests
from scraper import WebScraper

class FactChecker:
    def __init__(self):
        self.scraper = WebScraper()
        self.api_key = os.environ.get('CEREBRAS_API_KEY')
        
    def check_claim(self, claim, context):
        """Verify a claim using search data and LLM reasoning."""
        if not claim:
            return None
            
        try:
            # Step 1: Search and scrape related info (Mocking a secondary search here for now)
            # In a real scenario, we'd use a Search API + WebScraper
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            prompt = f"""
            Fact-check the following claim made during a podcast episode.
            
            CLAIM: {claim}
            CONTEXT: {context[:2000]}
            
            Analyze the claim for accuracy. 
            Return a JSON object:
            - "status": "verified" | "disputed" | "unverifiable"
            - "rating": 1-10 (Confidence)
            - "explanation": Short corrective note or confirmation.
            - "source_snippet": A relevant fact to backup your finding.
            """
            
            data = {
                "model": "llama3.1-8b",
                "messages": [
                    {"role": "system", "content": "You are a specialized fact-checking agent."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            
            response = requests.post("https://api.cerebras.ai/v1/chat/completions", headers=headers, json=data)
            if response.status_code == 200:
                import json
                return json.loads(response.json()['choices'][0]['message']['content'])
            else:
                return {"status": "unverifiable", "explanation": "Fact-check engine offline."}
        except Exception as e:
            print(f"Fact-check error: {e}")
            return {"status": "error", "explanation": str(e)}
