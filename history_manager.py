from sqlalchemy.orm import Session
import datetime
from pathlib import Path
from models import Episode, ListenLaterItem, User, Comment
from database import SessionLocal

class HistoryManager:
    def __init__(self, history_dir="history"):
        self.history_dir = Path(__file__).resolve().parent / history_dir
        self.history_dir.mkdir(exist_ok=True)
        # We don't need index_file anymore with DB
        
    def _get_db(self):
        return SessionLocal()

    def save_generation(self, url, content, script, persona="investigator", depth="deep_dive", metadata=None):
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        entry_id = f"gen_{timestamp}"
        
        # Save files to disk (keep file storage for large text/audio)
        content_path = self.history_dir / f"{entry_id}_content.txt"
        script_path = self.history_dir / f"{entry_id}_script.txt"
        
        with open(content_path, "w") as f:
            f.write(str(content))
        with open(script_path, "w") as f:
            if isinstance(script, list):
                # Handle list of strings or list of dicts
                processed_lines = []
                for item in script:
                    if isinstance(item, str):
                        processed_lines.append(item)
                    elif isinstance(item, dict):
                        # Try to find a 'text' or 'dialogue' key, otherwise stringify
                        processed_lines.append(item.get('text') or item.get('line') or str(item))
                    else:
                        processed_lines.append(str(item))
                f.write("\n".join(processed_lines))
            elif isinstance(script, dict):
                # If the whole script is a dict, it might be keyed by line number or speaker
                # We'll try to join values if they look like strings
                if all(isinstance(v, str) for v in script.values()):
                    f.write("\n".join(script.values()))
                else:
                    import json
                    f.write(json.dumps(script, indent=2))
            else:
                f.write(str(script))
            
        # Save metadata to DB
        import json
        db = self._get_db()
        try:
            episode = Episode(
                url=url,
                content_file=content_path.name,
                script_file=script_path.name,
                persona=persona,
                depth=depth,
                show_notes=metadata.get('show_notes') if metadata else None,
                chapters=json.dumps(metadata.get('chapters')) if metadata and metadata.get('chapters') else None,
                social_assets=json.dumps(metadata.get('social_assets')) if metadata and metadata.get('social_assets') else None,
                guest_persona=json.dumps(metadata.get('guest_persona')) if metadata and metadata.get('guest_persona') else None
            )
            db.add(episode)
            db.commit()
            db.refresh(episode)
            return episode.id
        finally:
            db.close()

    def get_history(self):
        db = self._get_db()
        try:
            # Return list reversed (newest first)
            episodes = db.query(Episode).order_by(Episode.timestamp.desc()).all()
            return [
                {
                    "id": str(ep.id),
                    "url": ep.url,
                    "timestamp": ep.timestamp.isoformat(),
                    "audio_url": f"/history_files/{ep.audio_file}" if ep.audio_file else None,
                    "script_url": f"/history_files/{ep.script_file}" if ep.script_file else None,
                    "content_url": f"/history_files/{ep.content_file}" if ep.content_file else None,
                    "persona": ep.persona,
                    "depth": ep.depth
                } for ep in episodes
            ]
        finally:
            db.close()

    def get_generation_detail(self, entry_id):
        # entry_id matches the DB ID
        db = self._get_db()
        try:
            ep = db.query(Episode).filter(Episode.id == int(entry_id)).first()
            if not ep:
                return None
            
            content_path = self.history_dir / ep.content_file
            script_path = self.history_dir / ep.script_file
            
            content = ""
            script = ""
            
            if content_path.exists():
                with open(content_path, "r") as f: content = f.read()
            if script_path.exists():
                with open(script_path, "r") as f: script = f.read()
                
            import json
            return {
                "id": str(ep.id),
                "url": ep.url,
                "timestamp": ep.timestamp.isoformat(),
                "content": content,
                "script": script,
                "audio_url": f"/history_files/{ep.audio_file}" if ep.audio_file else None,
                "script_url": f"/history_files/{ep.script_file}" if ep.script_file else None,
                "content_url": f"/history_files/{ep.content_file}" if ep.content_file else None,
                "persona": ep.persona,
                "depth": ep.depth,
                "show_notes": ep.show_notes,
                "chapters": json.loads(ep.chapters) if ep.chapters else [],
                "social_assets": json.loads(ep.social_assets) if ep.social_assets else {},
                "guest_persona": json.loads(ep.guest_persona) if ep.guest_persona else None
            }
        except ValueError:
             return None # Handle legacy ID or error
        finally:
            db.close()

    def update_audio_path(self, entry_id, filename):
        db = self._get_db()
        try:
             ep = db.query(Episode).filter(Episode.id == int(entry_id)).first()
             if ep:
                 ep.audio_file = filename
                 db.commit()
        except:
            pass
        finally:
            db.close()

    # Listen Later Methods
    def add_listen_later(self, url, title, source, summary=""):
        db = self._get_db()
        try:
            existing = db.query(ListenLaterItem).filter(ListenLaterItem.url == url).first()
            if existing: return # Skip duplicates
            
            item = ListenLaterItem(
                url=url,
                title=title,
                source=source,
                summary=summary
            )
            db.add(item)
            db.commit()
        finally:
            db.close()
            
    def get_listen_later(self):
        db = self._get_db()
        try:
            items = db.query(ListenLaterItem).filter(ListenLaterItem.is_processed == False).order_by(ListenLaterItem.added_at.desc()).all()
            return [{"id": item.id, "url": item.url, "title": item.title, "source": item.source} for item in items]
        finally:
             db.close()

    # Social Methods
    def get_or_create_user(self, username):
        db = self._get_db()
        try:
            user = db.query(User).filter(User.username == username).first()
            if not user:
                user = User(username=username)
                db.add(user)
                db.commit()
                db.refresh(user)
            return user.id
        finally:
            db.close()

    def add_comment(self, episode_id, username, text, timestamp_seconds):
        db = self._get_db()
        try:
            user_id = self.get_or_create_user(username)
            comment = Comment(
                episode_id=int(episode_id),
                user_id=user_id,
                text=text,
                timestamp_seconds=int(timestamp_seconds)
            )
            db.add(comment)
            db.commit()
            return True
        finally:
            db.close()

    def get_comments(self, episode_id):
        db = self._get_db()
        try:
            comments = db.query(Comment).filter(Comment.episode_id == int(episode_id)).order_by(Comment.timestamp_seconds.asc()).all()
            return [
                {
                    "id": c.id,
                    "user": c.user.username,
                    "text": c.text,
                    "timestamp": c.timestamp_seconds,
                    "created_at": c.created_at.isoformat()
                } for c in comments
            ]
        finally:
            db.close()

