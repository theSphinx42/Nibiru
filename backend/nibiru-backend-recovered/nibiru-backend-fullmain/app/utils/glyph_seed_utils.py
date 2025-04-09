from typing import Optional, List, Tuple
from dataclasses import dataclass
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
    """
    Generate a deterministic hash from multiple inputs.
    
    Args:
        glyph_hash: The base glyph hash
        salt: Optional salt to shift glyph visuals
        creator_signature: Optional creator signature for versioning
        
    Returns:
        A deterministic hash string combining all inputs
    """
    inputs = [glyph_hash, salt, creator_signature]
    return '|'.join(filter(None, inputs))

def generate_visual_seed(glyph_hash: str, salt: Optional[str] = None, creator_signature: Optional[str] = None) -> VisualSeed:
    """
    Generate a deterministic visual seed from a hash.
    
    Args:
        glyph_hash: The base glyph hash
        salt: Optional salt to shift glyph visuals
        creator_signature: Optional creator signature for versioning
        
    Returns:
        A VisualSeed object containing all parameters for glyph generation
    """
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

def validate_glyph_hash(glyph_hash: str, salt: Optional[str] = None, creator_signature: Optional[str] = None) -> bool:
    """
    Validate that the glyph hash matches the expected value.
    
    Args:
        glyph_hash: The base glyph hash
        salt: Optional salt to shift glyph visuals
        creator_signature: Optional creator signature for versioning
        
    Returns:
        True if the hash is valid, False otherwise
    """
    seed = generate_visual_seed(glyph_hash, salt, creator_signature)
    return seed.hash == generate_deterministic_hash(glyph_hash, salt, creator_signature)

def generate_svg_glyph(seed: VisualSeed, size: int) -> str:
    """
    Generate SVG markup for the glyph.
    
    Args:
        seed: The VisualSeed object containing glyph parameters
        size: The desired size of the glyph
        
    Returns:
        SVG markup as a string
    """
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