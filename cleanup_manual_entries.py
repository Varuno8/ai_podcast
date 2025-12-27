#!/usr/bin/env python3
"""
Clean up manual entries from podcast history
"""
import sqlite3
import os
from pathlib import Path

# Connect to database
db_path = "podcast_ai.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all manual entries
cursor.execute("SELECT id, content_file, script_file, audio_file FROM episodes WHERE url = 'manual_entry'")
manual_entries = cursor.fetchall()

print(f"🔍 Found {len(manual_entries)} manual entries to delete:\n")

history_dir = Path("history")
files_deleted = []
files_not_found = []

for entry_id, content_file, script_file, audio_file in manual_entries:
    print(f"  Episode {entry_id}:")
    print(f"    Content: {content_file}")
    print(f"    Script:  {script_file}")
    print(f"    Audio:   {audio_file}")
    
    # Delete content file
    if content_file:
        content_path = history_dir / content_file
        if content_path.exists():
            os.remove(content_path)
            files_deleted.append(str(content_path))
            print(f"    ✓ Deleted {content_file}")
        else:
            files_not_found.append(str(content_path))
    
    # Delete script file
    if script_file:
        script_path = history_dir / script_file
        if script_path.exists():
            os.remove(script_path)
            files_deleted.append(str(script_path))
            print(f"    ✓ Deleted {script_file}")
        else:
            files_not_found.append(str(script_path))
    
    # Delete audio file and directory
    if audio_file:
        audio_path = history_dir / audio_file
        if audio_path.exists():
            os.remove(audio_path)
            files_deleted.append(str(audio_path))
            print(f"    ✓ Deleted {audio_file}")
            
            # Try to delete the audio directory if empty
            audio_dir = audio_path.parent
            try:
                if audio_dir.exists() and not any(audio_dir.iterdir()):
                    audio_dir.rmdir()
                    print(f"    ✓ Deleted empty directory {audio_dir.name}")
            except:
                pass
        else:
            files_not_found.append(str(audio_path))
    
    print()

# Delete from database
cursor.execute("DELETE FROM episodes WHERE url = 'manual_entry'")
deleted_count = cursor.rowcount
conn.commit()
conn.close()

print("=" * 60)
print(f"\n✅ Deleted {deleted_count} manual entries from database")
print(f"✅ Deleted {len(files_deleted)} files")
if files_not_found:
    print(f"ℹ️  {len(files_not_found)} files were already missing")

print("\n📊 Remaining episodes:")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT id, url FROM episodes ORDER BY id")
remaining = cursor.fetchall()
for ep_id, url in remaining:
    print(f"  {ep_id}. {url[:80]}...")
conn.close()

print("\n🎉 Cleanup complete!")
