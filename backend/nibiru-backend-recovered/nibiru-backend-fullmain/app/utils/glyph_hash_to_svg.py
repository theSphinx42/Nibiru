from typing import Optional
from pathlib import Path
import cairosvg
from .glyph_seed_utils import generate_visual_seed, generate_svg_glyph

def glyph_hash_to_svg(
    glyph_hash: str,
    output_path: Optional[Path] = None,
    size: int = 400,
    salt: Optional[str] = None,
    creator_signature: Optional[str] = None,
    format: str = 'svg'
) -> str:
    """
    Convert a glyph hash to SVG and optionally save it to a file.
    
    Args:
        glyph_hash: The glyph hash to convert
        output_path: Optional path to save the output
        size: The desired size of the glyph
        salt: Optional salt to shift glyph visuals
        creator_signature: Optional creator signature for versioning
        format: Output format ('svg', 'png', or 'pdf')
        
    Returns:
        The generated SVG content as a string
    """
    # Generate visual seed
    seed = generate_visual_seed(glyph_hash, salt, creator_signature)
    
    # Generate SVG content
    svg_content = generate_svg_glyph(seed, size)
    
    # Save to file if output path is provided
    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        if format == 'svg':
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
        elif format == 'png':
            cairosvg.svg2png(
                bytestring=svg_content.encode('utf-8'),
                write_to=str(output_path),
                output_width=size,
                output_height=size
            )
        elif format == 'pdf':
            cairosvg.svg2pdf(
                bytestring=svg_content.encode('utf-8'),
                write_to=str(output_path),
                output_width=size,
                output_height=size
            )
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    return svg_content

def glyph_hash_to_ascii(
    glyph_hash: str,
    output_path: Optional[Path] = None,
    salt: Optional[str] = None,
    creator_signature: Optional[str] = None
) -> str:
    """
    Convert a glyph hash to ASCII art and optionally save it to a file.
    
    Args:
        glyph_hash: The glyph hash to convert
        output_path: Optional path to save the output
        salt: Optional salt to shift glyph visuals
        creator_signature: Optional creator signature for versioning
        
    Returns:
        The ASCII art as a string
    """
    # Generate visual seed
    seed = generate_visual_seed(glyph_hash, salt, creator_signature)
    
    # Generate ASCII content
    ascii_content = '\n'.join(seed.ascii_pattern)
    
    # Save to file if output path is provided
    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(ascii_content)
    
    return ascii_content 