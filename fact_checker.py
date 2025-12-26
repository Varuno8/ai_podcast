import os
import requests
import json
from scraper import WebScraper

class FactChecker:
    def __init__(self):
        self.scraper = WebScraper()
        self.gemini_key = os.environ.get('GEMINI_API_KEY')
        self.openrouter_key = os.environ.get('OPENROUTER_API_KEY')
        self.cerebras_key = os.environ.get('CEREBRAS_API_KEY')
        
    def check_claim(self, claim, context):
        """Verify a claim using a tiered AI strategy."""
        if not claim:
            return None
            
        # Tier 1: Gemini 3 Flash
        if self.gemini_key:
            res = self._check_via_gemini(claim, context)
            if res: return res
            
        # Tier 2: OpenRouter (Qwen thinking)
        if self.openrouter_key:
            res = self._check_via_openrouter(claim, context)
            if res: return res

        # Tier 3: Cerebras
        return self._check_via_cerebras(claim, context)

    def _check_via_gemini(self, claim, context):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={self.gemini_key}"
            prompt = f"Fact-check this: {claim}\nContext: {context[:2000]}\nOutput JSON: status, rating, explanation, source_snippet."
            data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            response = requests.post(url, json=data, timeout=10)
            if response.status_code == 200:
                return json.loads(response.json()['candidates'][0]['content']['parts'][0]['text'])
        except Exception as e:
            print(f"Gemini Fact-Check error: {e}")
        return None

    def _check_via_openrouter(self, claim, context):
        try:
            headers = {"Authorization": f"Bearer {self.openrouter_key}", "Content-Type": "application/json"}
            prompt = f"Fact-check this: {claim}\nContext: {context[:2000]}\nOutput JSON: status, rating, explanation, source_snippet."
            data = {
                "model": "qwen/qwen3-4b:free",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            }
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data, timeout=10)
            if response.status_code == 200:
                content = response.json()['choices'][0]['message']['content']
                return json.loads(content)
        except Exception as e:
            print(f"OpenRouter Fact-Check error: {e}")
        return None

    def _check_via_cerebras(self, claim, context):
        try:
            headers = {"Authorization": f"Bearer {self.cerebras_key}", "Content-Type": "application/json"}
            prompt = f"Fact-check the claim: {claim}\nContext: {context[:1000]}"
            data = {
                "model": "llama3.1-8b",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            }
            response = requests.post("https://api.cerebras.ai/v1/chat/completions", headers=headers, json=data)
            if response.status_code == 200:
                return json.loads(response.json()['choices'][0]['message']['content'])
            return {"status": "unverifiable", "explanation": "Backup engine offline."}
        except Exception as e:
            return {"status": "error", "explanation": str(e)}
