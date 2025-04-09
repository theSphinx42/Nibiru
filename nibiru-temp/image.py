from fastapi import APIRouter, Response
from PIL import Image, ImageDraw, ImageFont
import io

router = APIRouter()

@router.get("/image")
async def generate_image():
    # Create a simple black image with white text
    img = Image.new("RGB", (400, 200), color=(0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Load a default font
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()

    draw.text((50, 80), "🌀 Nibiru is Online", font=font, fill=(255, 255, 255))

    # Save image to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return Response(content=img_bytes.getvalue(), media_type="image/png")
