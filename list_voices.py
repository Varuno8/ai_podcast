import requests
import json
import os

key = "sk_1c1533c3a6aca82a449829c23ff6444f40786cc15283de2a"
url = "https://api.elevenlabs.io/v1/voices"
headers = {"xi-api-key": key}

res = requests.get(url, headers=headers)
if res.status_code == 200:
    voices = res.json()["voices"]
    for v in voices[:50]:
        gender = v.get("labels", {}).get("gender", "N/A")
        print(f"{v['name']} | {v['voice_id']} | {gender}")
else:
    print(f"Error: {res.text}")
