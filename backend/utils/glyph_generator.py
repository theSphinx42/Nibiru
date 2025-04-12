from typing import Optional
from datetime import datetime
from app.models.glyph import ItemGlyph, GlyphTier
from app.utils.hash import generate_deterministic_hash

def generate_buyer_glyph(
    listing_id: str,
    buyer_id: str,
    transaction_id: str
) -> ItemGlyph:
    """Generate a Tier 3 glyph for a buyer's copy of an item."""
    # Create a deterministic hash based on listing, buyer, and transaction
    glyph_seed = generate_deterministic_hash(
        f"{listing_id}:{buyer_id}:{transaction_id}"
    )
    
    # Generate unique visual properties based on the seed
    visual_properties = {
        "color_scheme": f"scheme_{glyph_seed[:6]}",
        "pattern_type": f"pattern_{int(glyph_seed[6:8], 16) % 5}",
        "animation_speed": 0.8 + (int(glyph_seed[8:10], 16) / 255.0) * 0.4,
        "glow_intensity": 0.6 + (int(glyph_seed[10:12], 16) / 255.0) * 0.4
    }
    
    # Create the buyer's glyph with Tier 3 properties
    buyer_glyph = ItemGlyph(
        item_id=listing_id,
        owner_id=buyer_id,
        transaction_id=transaction_id,
        tier=GlyphTier.STANDARD,  # Tier 3
        complexity_score=65,  # Base score for Tier 3
        innovation_rating=60,  # Base innovation rating for purchased copies
        visual_properties=visual_properties,
        created_at=datetime.utcnow()
    )
    
    return buyer_glyph

def get_glyph_display_properties(glyph: ItemGlyph) -> dict:
    """Get the display properties for a glyph based on its tier."""
    base_properties = {
        "size": "medium",
        "animation": True,
        "glow": True,
        "particles": True
    }
    
    if glyph.tier == GlyphTier.ENHANCED:  # Tier 2
        return {
            **base_properties,
            "size": "large",
            "particle_count": 12,
            "glow_strength": 1.2,
            "animation_speed": 1.0
        }
    elif glyph.tier == GlyphTier.STANDARD:  # Tier 3
        visual_props = glyph.visual_properties or {}
        return {
            **base_properties,
            "particle_count": 8,
            "glow_strength": 0.8,
            "animation_speed": visual_props.get("animation_speed", 0.8),
            "color_scheme": visual_props.get("color_scheme", "default"),
            "pattern_type": visual_props.get("pattern_type", "standard"),
            "glow_intensity": visual_props.get("glow_intensity", 0.6)
        }
    else:  # Default/Tier 1
        return {
            **base_properties,
            "particle_count": 6,
            "glow_strength": 0.6,
            "animation_speed": 0.6
        } 