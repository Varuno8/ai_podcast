import os
import requests
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()


class WebScraper:
    def __init__(self):
        self.token = os.getenv('CRAWLBASE_API_KEY')
        self.base_url = "https://api.crawlbase.com/"
        
    def scrape(self, url: str) -> str:
        """Scrape content from a given URL using Crawlbase."""
        try:
            # Encode the target URL
            encoded_url = quote(url, safe='')
            # format=text or format=json can be used. We'll use default which returns HTML
            # and then we could iterate, but simpler is to use Crawlbase's format=json if they support it
            # or just get the HTML. 
            # Actually, Crawlbase often returns the whole page.
            
            api_url = f"{self.base_url}?token={self.token}&url={encoded_url}"
            response = requests.get(api_url)
            response.raise_for_status()
            
            content = response.text
            
            if not content:
                raise ValueError("No content extracted from URL")
            
            # Since Crawlbase returns HTML, we might want to strip tags for the LLM
            # but usually modern LLMs handle HTML fine. For a cleaner prompt, we can do basic cleaning.
            return content
        except Exception as e:
            raise Exception(f"Scraping failed: {str(e)}")