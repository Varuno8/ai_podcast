from PIL import Image, ImageDraw, ImageFont
import textwrap
from pathlib import Path

class ImageGenerator:
    def __init__(self, assets_dir="images"):
        self.assets_dir = Path(__file__).resolve().parent / assets_dir
        self.font_path = "/System/Library/Fonts/Helvetica.ttc" # Default Mac font

    def create_quote_card(self, text, author, output_path):
        # Create a dark background
        img = Image.new('RGB', (1080, 1080), color=(10, 10, 10))
        draw = ImageDraw.Draw(img)
        
        # Load fonts
        try:
            font_text = ImageFont.truetype(self.font_path, 60)
            font_author = ImageFont.truetype(self.font_path, 40)
        except:
            font_text = ImageFont.load_default()
            font_author = ImageFont.load_default()

        # Wrap text
        lines = textwrap.wrap(text, width=30)
        
        # Draw Text
        y_text = 300
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font_text)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            draw.text(((1080 - w) / 2, y_text), line, font=font_text, fill=(255, 255, 255))
            y_text += h + 20

        # Draw Author
        draw.text(((1080 - 300) / 2, y_text + 100), f"- {author}", font=font_author, fill=(255, 77, 0)) # Brand color
        
        # Add Logo/Brand (Simple text for now)
        draw.text((50, 1000), "PODMASTER AI", font=font_author, fill=(255, 255, 255))

        img.save(output_path)
        return output_path
