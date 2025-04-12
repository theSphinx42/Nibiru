from typing import Dict, Any, Tuple, List
import math
import colorsys
from PIL import Image, ImageDraw, ImageEnhance
import io
import base64
import logging
import random

logger = logging.getLogger(__name__)

class SigilImageService:
    def __init__(self):
        self.image_size = (512, 512)
        self.background_color = (0, 0, 0)
        self.foreground_color = (255, 255, 255)
        self.accent_color = (255, 215, 0)  # Gold
        self.animation_frames = 30  # Number of frames for animation

    def _calculate_color_from_affinity(self, affinity: Dict[str, float]) -> Tuple[int, int, int]:
        """Calculate a unique color based on affinity values."""
        # Convert affinity values to a single number
        affinity_sum = sum(affinity.values())
        hue = (affinity_sum % 1.0)  # Use sum as hue
        saturation = 0.8
        value = 0.9

        # Convert HSV to RGB
        rgb = colorsys.hsv_to_rgb(hue, saturation, value)
        return tuple(int(x * 255) for x in rgb)

    def _calculate_shape_points(
        self,
        sigil_data: str,
        quantum_score: float,
        network_metrics: Dict[str, Any],
        frame: int = 0
    ) -> List[Tuple[float, float]]:
        """Calculate points for the sigil shape based on user data."""
        points = []
        num_points = 8  # Base number of points
        
        # Adjust number of points based on quantum score
        num_points += int(math.log10(quantum_score + 1))
        
        # Calculate radius based on network impact
        network_impact = network_metrics.get('network_impact', 0.5)
        base_radius = 200
        radius = base_radius * (0.5 + network_impact)
        
        # Add animation phase
        phase = (2 * math.pi * frame) / self.animation_frames
        
        # Generate points in a star pattern with animation
        for i in range(num_points):
            angle = (2 * math.pi * i) / num_points + phase
            # Add some randomness based on sigil data
            random_factor = (ord(sigil_data[i % len(sigil_data)]) % 100) / 100
            radius_variation = radius * (0.8 + 0.4 * random_factor)
            
            # Add pulsing effect based on quantum score
            pulse = 1.0 + 0.1 * math.sin(phase + i * math.pi / num_points)
            radius_variation *= pulse
            
            x = radius_variation * math.cos(angle)
            y = radius_variation * math.sin(angle)
            points.append((x, y))
        
        return points

    def _draw_sigil(
        self,
        points: List[Tuple[float, float]],
        color: Tuple[int, int, int],
        quantum_score: float,
        frame: int = 0
    ) -> Image.Image:
        """Draw the sigil image with enhanced effects."""
        # Create new image with transparent background
        image = Image.new('RGBA', self.image_size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # Calculate center point
        center_x, center_y = self.image_size[0] // 2, self.image_size[1] // 2
        
        # Draw main shape with gradient effect
        points_centered = [(x + center_x, y + center_y) for x, y in points]
        draw.polygon(points_centered, fill=color)
        
        # Add quantum score rings with animation
        num_rings = int(math.log10(quantum_score + 1))
        phase = (2 * math.pi * frame) / self.animation_frames
        
        for i in range(num_rings):
            # Add pulsing effect to rings
            pulse = 1.0 + 0.05 * math.sin(phase + i * math.pi / num_rings)
            ring_radius = (150 - (i * 20)) * pulse
            
            # Draw ring with varying opacity
            opacity = int(255 * (0.8 + 0.2 * math.sin(phase + i * math.pi / num_rings)))
            ring_color = (*self.accent_color, opacity)
            
            draw.ellipse(
                [
                    center_x - ring_radius,
                    center_y - ring_radius,
                    center_x + ring_radius,
                    center_y + ring_radius
                ],
                outline=ring_color,
                width=2
            )
        
        # Add glow effect
        glow_radius = 20 + 5 * math.sin(phase)
        glow_color = (*color, int(100 * (0.5 + 0.5 * math.sin(phase))))
        draw.ellipse(
            [
                center_x - glow_radius,
                center_y - glow_radius,
                center_x + glow_radius,
                center_y + glow_radius
            ],
            fill=glow_color
        )
        
        return image

    def _apply_effects(self, image: Image.Image, quantum_score: float, frame: int) -> Image.Image:
        """Apply additional visual effects to the sigil."""
        # Add brightness variation
        brightness = ImageEnhance.Brightness(image)
        phase = (2 * math.pi * frame) / self.animation_frames
        brightness_factor = 1.0 + 0.1 * math.sin(phase)
        image = brightness.enhance(brightness_factor)
        
        # Add contrast variation
        contrast = ImageEnhance.Contrast(image)
        contrast_factor = 1.0 + 0.05 * math.sin(phase + math.pi / 2)
        image = contrast.enhance(contrast_factor)
        
        return image

    def generate_sigil_image(
        self,
        sigil_data: Dict[str, Any],
        affinity: Dict[str, float],
        quantum_score: float,
        network_metrics: Dict[str, Any],
        animated: bool = False
    ) -> bytes:
        """Generate a complete sigil image or animation."""
        try:
            # Calculate color from affinity
            color = self._calculate_color_from_affinity(affinity)
            
            if animated:
                # Generate animation frames
                frames = []
                for frame in range(self.animation_frames):
                    # Calculate shape points for this frame
                    points = self._calculate_shape_points(
                        sigil_data['sigil'],
                        quantum_score,
                        network_metrics,
                        frame
                    )
                    
                    # Draw the sigil for this frame
                    image = self._draw_sigil(points, color, quantum_score, frame)
                    
                    # Apply additional effects
                    image = self._apply_effects(image, quantum_score, frame)
                    
                    frames.append(image)
                
                # Save as animated GIF
                buffered = io.BytesIO()
                frames[0].save(
                    buffered,
                    format="GIF",
                    save_all=True,
                    append_images=frames[1:],
                    duration=50,  # 50ms per frame
                    loop=0
                )
                return buffered.getvalue()
            else:
                # Generate single frame
                points = self._calculate_shape_points(
                    sigil_data['sigil'],
                    quantum_score,
                    network_metrics
                )
                
                image = self._draw_sigil(points, color, quantum_score)
                image = self._apply_effects(image, quantum_score, 0)
                
                # Save as PNG
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                return buffered.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating sigil image: {str(e)}")
            return None 