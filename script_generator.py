import os
import requests
from dotenv import load_dotenv

load_dotenv()


class ScriptGenerator:
    def __init__(self):
        self.api_key = os.getenv('CEREBRAS_API_KEY')
        self.api_url = "https://api.cerebras.ai/v1/chat/completions"
        self.model = "qwen-2.5-72b" # Using Qwen model on Cerebras
    
    def generate(self, content: str) -> str:
        """Generate podcast script from content using Cerebras with Qwen."""
        prompt = self._create_prompt(content)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a professional podcast script writer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        
        try:
            response = requests.post(self.api_url, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            script = result['choices'][0]['message']['content']
            return script
        except Exception as e:
            # Try a fallback model if qwen-2.5-72b fails
            try:
                payload["model"] = "llama-3.3-70b"
                response = requests.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                return response.json()['choices'][0]['message']['content']
            except:
                raise Exception(f"Script generation failed: {str(e)}")
    
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