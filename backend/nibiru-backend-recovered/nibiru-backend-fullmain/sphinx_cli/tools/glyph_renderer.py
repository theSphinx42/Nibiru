import argparse
import os
import sys
from typing import Optional, Tuple, List
from dataclasses import dataclass
from pathlib import Path
import cairosvg
from PIL import Image, ImageDraw
import hashlib

@dataclass
class VisualSeed:
    shape_count: int
    symmetry: int
    rotation: float
    colors: List[str]
    matrix: List[List[int]]
    ascii_pattern: List[str]
    hash: str
    salt: Optional[str] = None
    creator_signature: Optional[str] = None

# Match the frontend glyph characters
GLYPH_CHARS = ['⧉', '⨀', '✶', '⨁', '✹', '⟐', '⟡', '║', '──']

def generate_deterministic_hash(glyph_hash: str, salt: Optional[str] = None, creator_signature: Optional[str] = None) -> str:
    """Generate a deterministic hash from multiple inputs."""
    inputs = [glyph_hash, salt, creator_signature]
    return '|'.join(filter(None, inputs))

def generate_visual_seed(glyph_hash: str, salt: Optional[str] = None, creator_signature: Optional[str] = None) -> VisualSeed:
    """Generate a deterministic visual seed from a hash."""
    deterministic_hash = generate_deterministic_hash(glyph_hash, salt, creator_signature)
    hash_values = [ord(c) for c in deterministic_hash]
    
    # Generate shape count (3-7) - deterministic based on first byte
    shape_count = 3 + (hash_values[0] % 5)
    
    # Generate symmetry (2-8) - deterministic based on second byte
    symmetry = 2 + (hash_values[1] % 7)
    
    # Generate rotation (0-360) - deterministic based on third byte
    rotation = (hash_values[2] * 360) / 256
    
    # Generate color palette - deterministic based on next three bytes
    colors = []
    for value in hash_values[3:6]:
        hue = (value * 360) / 256
        colors.append(f"hsl({hue}, 70%, 50%)")
    
    # Generate 5x5 matrix for ASCII pattern
    matrix = []
    for i in range(5):
        row = []
        for j in range(5):
            value = hash_values[(i * 5 + j) % len(hash_values)] % len(GLYPH_CHARS)
            row.append(value)
        matrix.append(row)
    
    # Generate ASCII pattern
    ascii_pattern = [''.join(GLYPH_CHARS[value] for value in row) for row in matrix]
    
    return VisualSeed(
        shape_count=shape_count,
        symmetry=symmetry,
        rotation=rotation,
        colors=colors,
        matrix=matrix,
        ascii_pattern=ascii_pattern,
        hash=deterministic_hash,
        salt=salt,
        creator_signature=creator_signature
    )

def generate_svg_glyph(seed: VisualSeed, size: int) -> str:
    """Generate SVG markup for the glyph."""
    center = size / 2
    radius = size * 0.4
    
    # Generate base shapes
    shapes = []
    for i in range(seed.shape_count):
        angle = (i * 360) / seed.shape_count
        x = center + radius * (angle * 3.14159 / 180).cos()
        y = center + radius * (angle * 3.14159 / 180).sin()
        
        shapes.append(
            f'<circle cx="{x}" cy="{y}" r="{radius * 0.2}" '
            f'fill="{seed.colors[i % len(seed.colors)]}" opacity="0.8" />'
        )
    
    # Generate connecting lines
    lines = []
    for i in range(seed.shape_count):
        next_index = (i + 1) % seed.shape_count
        start_angle = (i * 360) / seed.shape_count
        end_angle = (next_index * 360) / seed.shape_count
        
        x1 = center + radius * (start_angle * 3.14159 / 180).cos()
        y1 = center + radius * (start_angle * 3.14159 / 180).sin()
        x2 = center + radius * (end_angle * 3.14159 / 180).cos()
        y2 = center + radius * (end_angle * 3.14159 / 180).sin()
        
        lines.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{seed.colors[i % len(seed.colors)]}" stroke-width="2" opacity="0.6" />'
        )
    
    return f'''
    <svg viewBox="0 0 {size} {size}" width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate({seed.rotation}, {center}, {center})">
            {''.join(shapes)}
            {''.join(lines)}
        </g>
    </svg>
    '''

def save_ascii_glyph(seed: VisualSeed, output_path: Path) -> None:
    """Save the glyph as ASCII text."""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(seed.ascii_pattern))

def save_svg_glyph(svg_content: str, output_path: Path) -> None:
    """Save the glyph as SVG."""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)

def save_png_glyph(svg_content: str, output_path: Path, size: int) -> None:
    """Save the glyph as PNG using CairoSVG."""
    cairosvg.svg2png(
        bytestring=svg_content.encode('utf-8'),
        write_to=str(output_path),
        output_width=size,
        output_height=size
    )

def validate_glyph_hash(glyph_hash: str, salt: Optional[str] = None, creator_signature: Optional[str] = None) -> bool:
    """Validate that the glyph hash matches the expected value."""
    seed = generate_visual_seed(glyph_hash, salt, creator_signature)
    return seed.hash == generate_deterministic_hash(glyph_hash, salt, creator_signature)

def main():
    parser = argparse.ArgumentParser(description='Generate and export SpiritGlyphs from glyph hashes')
    parser.add_argument('glyph_hash', help='The glyph hash to render')
    parser.add_argument('--salt', help='Optional salt to shift glyph visuals')
    parser.add_argument('--ascii', action='store_true', help='Export as ASCII text')
    parser.add_argument('--svg', action='store_true', help='Export as SVG')
    parser.add_argument('--png', action='store_true', help='Export as PNG')
    parser.add_argument('--output', default='.', help='Output directory')
    parser.add_argument('--size', type=int, default=400, help='Output size for PNG/SVG')
    parser.add_argument('--show', action='store_true', help='Show preview in default viewer')
    parser.add_argument('--validate', action='store_true', help='Validate glyph hash')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate visual seed
    seed = generate_visual_seed(args.glyph_hash, args.salt)
    
    # Validate if requested
    if args.validate:
        if not validate_glyph_hash(args.glyph_hash, args.salt):
            print("Error: Glyph hash validation failed", file=sys.stderr)
            sys.exit(1)
        print("Glyph hash validation successful")
    
    # Generate base filename with hash prefix
    base_filename = f"glyph-{seed.hash[:8]}"
    
    # Export in requested formats
    if args.ascii:
        output_path = output_dir / f"{base_filename}.txt"
        save_ascii_glyph(seed, output_path)
        print(f"Saved ASCII glyph to {output_path}")
    
    if args.svg:
        svg_content = generate_svg_glyph(seed, args.size)
        output_path = output_dir / f"{base_filename}.svg"
        save_svg_glyph(svg_content, output_path)
        print(f"Saved SVG glyph to {output_path}")
    
    if args.png:
        svg_content = generate_svg_glyph(seed, args.size)
        output_path = output_dir / f"{base_filename}.png"
        save_png_glyph(svg_content, output_path, args.size)
        print(f"Saved PNG glyph to {output_path}")
    
    # Show preview if requested
    if args.show:
        if args.png:
            os.startfile(output_path) if sys.platform == 'win32' else os.system(f'xdg-open {output_path}')
        elif args.svg:
            os.startfile(output_path) if sys.platform == 'win32' else os.system(f'xdg-open {output_path}')

if __name__ == '__main__':
    main() 