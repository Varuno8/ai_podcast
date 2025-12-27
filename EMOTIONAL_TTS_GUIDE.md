# 🎭 Emotional TTS Guide

## Overview
Your AI Podcast Generator now supports **advanced emotional expression** in speech synthesis! This means your podcasts will sound more natural, engaging, and human-like.

---

## 🎯 Supported Emotions

### Available Emotion Tags
Use these tags in your script to control how the voice sounds:

#### **Positive Emotions**
- `[laughs]` / `[chuckles]` - Joyful laughter
- `[excited]` - High energy, enthusiastic
- `[cheerfully]` - Happy, upbeat tone
- `[calm]` - Peaceful, relaxed delivery

#### **Thoughtful Emotions**
- `[curious]` - Inquisitive, interested
- `[whispers]` - Soft, intimate delivery
- `[pauses]` - Thoughtful hesitation

#### **Negative Emotions**
- `[sighs]` - Disappointment, resignation
- `[frustrated]` - Annoyance, irritation
- `[angry]` - Strong negative emotion
- `[nervous]` - Anxious, uncertain
- `[sad]` / `[sorrowful]` - Melancholic tone

#### **Neutral/Special**
- `[deadpan]` - Flat, expressionless
- `[stammers]` - Hesitant speech
- `[hesitates]` - Brief uncertainty

---

## 🔧 How It Works

### Engine Hierarchy (with Emotional Support)

1. **Cartesia Sonic** (Primary)
   - ✅ Native emotion tag support
   - ✅ Emotional controls: `positivity`, `curiosity`, `anger`, `sadness`
   - ✅ Speed modulation based on emotion
   - ✅ Ultra-low latency (40ms)
   - 💰 **$4/month** for Pro plan

2. **ElevenLabs v3** (Fallback)
   - ✅ Audio tag support: `[laughs]`, `[whispers]`, `[angry]`, etc.
   - ✅ Advanced expressive delivery
   - ✅ 70+ languages
   - 💰 **$22/month** for Creator plan

3. **Resemble AI** (Fallback)
   - ⚠️ Limited emotion support
   - Processes clean text only

4. **Resemble Chatterbox** (Fallback)
   - ⚠️ Limited emotion support
   - Free Gradio API

5. **Edge TTS** (Final Backup)
   - ❌ No emotion support
   - Free and unlimited
   - Basic neural voices

---

## 💡 Usage Examples

### Example 1: Basic Emotional Script
```
Host 1: [excited] Welcome to the show! Today we have something amazing!

Host 2: [laughs] I can tell you're pumped! What's the big news?

Host 1: [whispers] It's a secret... but I'll tell you anyway. [pauses]

Host 2: [curious] Come on, spill it!

Host 1: [cheerfully] We just hit 10,000 downloads!
```

### Example 2: Dramatic Story
```
Host 1: [calm] Let me take you back to 1969...

Host 2: [curious] The moon landing?

Host 1: [excited] Exactly! But here's what most people don't know...

Host 2: [shocked] Wait, are you serious?

Host 1: [deadpan] Completely serious.

Host 2: [sighs] That changes everything we thought we knew.
```

### Example 3: Comedy/Roast Mode
```
Host 1: [laughs] Did you actually just say that?

Host 2: [defensive, nervous] I mean... technically it's true!

Host 1: [sarcastic] Oh yeah, "technically." That's like saying a hot dog is a sandwich.

Host 2: [frustrated] But it IS a sandwich!

Host 1: [exasperated, sighs] We're not doing this again...
```

---

## 🎚️ Cartesia Emotional Controls

Cartesia uses these internal mappings:

| Emotion Tag | Cartesia Control | Speed |
|-------------|------------------|-------|
| `[laughs]`, `[chuckles]` | `positivity:high` | normal |
| `[excited]`, `[energetic]` | `curiosity:high` | fast |
| `[sad]`, `[sorrow]`, `[sighs]` | `sadness:high` | slow |
| `[angry]`, `[frustrated]` | `anger:high` | normal |
| `[calm]`, `[whispers]` | `positivity:low` | slow |
| `[nervous]`, `[scared]` | `anger:lowest` | fast |
| *No tag* | `positivity:medium`, `curiosity:medium` | normal |

---

## 🚀 Quick Start

### 1. Set Up API Keys
Add to your `.env` file:
```bash
# Primary (Recommended)
CARTESIA_API_KEY=your_key_here

# Fallback (Optional but recommended)
ELEVENLABS_API_KEY=your_key_here
```

### 2. Enable Improv Mode in Script Generator
When generating podcasts, enable `improv=True` to automatically inject emotional tags:

```python
script_generator.generate(
    content,
    persona="comedian",  # or "investigator", "friend"
    depth="deep_dive",
    improv=True  # ← This enables emotional tags!
)
```

### 3. Test Emotional TTS
```bash
# Run the test script
python test_emotional_tts.py
```

---

## 📊 Pricing Comparison

### Cartesia (Recommended)
- **Free**: 20,000 credits
- **Pro**: $4/month - 100,000 credits ✅ **BEST VALUE**
- **Startup**: $39/month
- Fast generation, great emotions

### ElevenLabs
- **Free**: 10,000 chars/month
- **Starter**: $5/month - 30,000 chars
- **Creator**: $22/month - 100,000 chars ✅ **BEST QUALITY**
- **Pro**: $99/month - 500,000 chars
- Premium quality, rich emotions

### Edge TTS
- **Free**: Unlimited ❌ **NO EMOTIONS**
- Good for fallback only

---

## 🎬 Best Practices

### 1. **Use Emotions Sparingly**
Don't overdo it. Natural conversation has emotion, but not every line needs a tag.

✅ Good:
```
Host 1: So here's what happened...
Host 2: [curious] What?
Host 1: [laughs] You won't believe it!
```

❌ Too much:
```
Host 1: [excited] So [nervous] here's [laughs] what happened...
```

### 2. **Match Persona to Emotions**
- **Investigator**: Use `[serious]`, `[skeptical]`, minimal laughter
- **Comedian**: Use `[laughs]`, `[sarcastic]`, `[deadpan]` heavily
- **Friend**: Use `[excited]`, `[calm]`, `[curious]` naturally

### 3. **Combine with Improv Mode**
Enable `improv=True` in script generation to get:
- Natural `[Laughs]`, `[Sighs]` insertions
- Interruptions ("Wait—")
- Self-corrections ("I mean...")
- Fillers ("Umm", "Uh")

### 4. **Test Different Voices**
Different Cartesia voices have different emotional ranges:
- **Leo, Jace, Kyle**: Strong emotional responses
- **Katie**: Good for female host
- **Kiefer**: Good for male host

---

## 🔍 Troubleshooting

### Emotions Not Working?
1. **Check API keys**: Make sure `CARTESIA_API_KEY` is set
2. **Verify tags**: Use supported tags like `[laughs]`, not custom ones
3. **Check logs**: Look for "🎭 Cartesia generating with emotions" in output
4. **Test script**: Run `python test_emotional_tts.py`

### Audio Sounds Flat?
1. **Enable improv mode**: Set `improv=True` in script generation
2. **Use stronger tags**: Try `[excited]` instead of `[happy]`
3. **Upgrade to ElevenLabs**: v3 has richer emotional range
4. **Check voice selection**: Some voices are more expressive

### Cartesia Errors?
- Falls back to ElevenLabs automatically
- Check credit balance at cartesia.ai
- Verify voice IDs are valid

---

## 🎯 What's Next?

### Immediate Actions:
1. ✅ Run `python test_emotional_tts.py` to test emotions
2. ✅ Set `CARTESIA_API_KEY` in your `.env` file
3. ✅ Enable `improv=True` when generating podcasts
4. ✅ Listen to the difference!

### Future Improvements:
- [ ] Add more emotion detection patterns
- [ ] Support custom emotion intensity levels
- [ ] Add voice cloning with emotional preservation
- [ ] Create emotion presets for different podcast styles

---

## 📚 Resources

- [Cartesia Documentation](https://docs.cartesia.ai/)
- [ElevenLabs API Docs](https://elevenlabs.io/docs/)
- [Cartesia Emotion Controls](https://github.com/cartesia-ai/cartesia-python)

---

## 💬 Questions?

Check the emotion examples in `test_emotional_tts.py` or review the implementation in `tts_converter.py`.

**Enjoy creating emotionally rich, engaging podcasts! 🎙️✨**
