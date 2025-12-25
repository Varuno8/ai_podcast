import os
import json
import datetime
from pathlib import Path

class HistoryManager:
    def __init__(self, history_dir="history"):
        self.history_dir = Path(__file__).resolve().parent / history_dir
        self.history_dir.mkdir(exist_ok=True)
        self.index_file = self.history_dir / "index.json"
        
    def _load_index(self):
        if self.index_file.exists():
            with open(self.index_file, "r") as f:
                return json.load(f)
        return []

    def _save_index(self, index):
        with open(self.index_file, "w") as f:
            json.dump(index, f, indent=4)

    def save_generation(self, url, content, script):
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        entry_id = f"gen_{timestamp}"
        
        # Save content and script to files
        content_path = self.history_dir / f"{entry_id}_content.txt"
        script_path = self.history_dir / f"{entry_id}_script.txt"
        
        with open(content_path, "w") as f:
            f.write(content)
        with open(script_path, "w") as f:
            f.write(script)
            
        # Update index
        index = self._load_index()
        new_entry = {
            "id": entry_id,
            "url": url,
            "timestamp": datetime.datetime.now().isoformat(),
            "content_file": str(content_path.name),
            "script_file": str(script_path.name)
        }
        index.insert(0, new_entry) # Add to top
        self._save_index(index)
        return entry_id

    def get_history(self):
        return self._load_index()

    def get_generation_detail(self, entry_id):
        index = self._load_index()
        entry = next((item for item in index if item["id"] == entry_id), None)
        if entry:
            content_path = self.history_dir / entry["content_file"]
            script_path = self.history_dir / entry["script_file"]
            
            with open(content_path, "r") as f:
                content = f.read()
            with open(script_path, "r") as f:
                script = f.read()
                
            return {
                **entry,
                "content": content,
                "script": script
            }
        return None
