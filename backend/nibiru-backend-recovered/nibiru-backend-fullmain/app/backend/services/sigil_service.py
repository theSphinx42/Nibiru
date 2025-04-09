from typing import Dict, Any, Optional
import hashlib
import json
from datetime import datetime
import logging
from ..models.user import User
from ..services.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)

class SigilService:
    def __init__(self):
        self.analytics_service = AnalyticsService()

    def _generate_base_sigil(self, internal_name: str) -> str:
        """Generate a base sigil from the internal name."""
        # Create a deterministic hash from the internal name
        name_hash = hashlib.sha256(internal_name.encode()).hexdigest()
        
        # Use first 16 characters for the base sigil
        return name_hash[:16]

    def _apply_affinity_modifiers(self, base_sigil: str, affinity: Dict[str, float]) -> str:
        """Apply affinity-based modifications to the sigil."""
        # Convert affinity values to hex and apply them to the sigil
        affinity_hash = hashlib.sha256(json.dumps(affinity).encode()).hexdigest()
        
        # Combine base sigil with affinity hash
        modified_sigil = ""
        for i in range(len(base_sigil)):
            # XOR the base sigil with affinity hash
            modified_sigil += chr(ord(base_sigil[i]) ^ ord(affinity_hash[i]))
        
        return modified_sigil

    def _apply_quantum_modifiers(self, sigil: str, quantum_score: float) -> str:
        """Apply quantum score-based modifications to the sigil."""
        # Convert quantum score to a deterministic modifier
        score_hash = hashlib.sha256(str(quantum_score).encode()).hexdigest()
        
        # Apply quantum score influence
        modified_sigil = ""
        for i in range(len(sigil)):
            # Add quantum influence while maintaining sigil structure
            modified_sigil += chr((ord(sigil[i]) + ord(score_hash[i])) % 256)
        
        return modified_sigil

    def _apply_network_modifiers(
        self,
        sigil: str,
        network_metrics: Dict[str, Any]
    ) -> str:
        """Apply network-based modifications to the sigil."""
        # Convert network metrics to a deterministic modifier
        network_hash = hashlib.sha256(json.dumps(network_metrics).encode()).hexdigest()
        
        # Apply network influence
        modified_sigil = ""
        for i in range(len(sigil)):
            # Combine network influence with existing sigil
            modified_sigil += chr((ord(sigil[i]) ^ ord(network_hash[i])) % 256)
        
        return modified_sigil

    async def generate_user_sigil(self, user: User) -> Dict[str, Any]:
        """Generate a complete sigil for a user."""
        try:
            # Get user metrics
            affinity = await self.analytics_service.get_user_affinity(user.id)
            quantum_score = await self.analytics_service.get_user_quantum_score(user.id)
            network_metrics = await self.analytics_service.get_user_network(user.id)

            # Generate base sigil
            base_sigil = self._generate_base_sigil(user.internal_name)
            
            # Apply modifiers
            affinity_sigil = self._apply_affinity_modifiers(base_sigil, affinity)
            quantum_sigil = self._apply_quantum_modifiers(affinity_sigil, quantum_score)
            final_sigil = self._apply_network_modifiers(quantum_sigil, network_metrics)

            # Create sigil metadata
            sigil_data = {
                "sigil": final_sigil,
                "base_sigil": base_sigil,
                "affinity_hash": hashlib.sha256(json.dumps(affinity).encode()).hexdigest(),
                "quantum_hash": hashlib.sha256(str(quantum_score).encode()).hexdigest(),
                "network_hash": hashlib.sha256(json.dumps(network_metrics).encode()).hexdigest(),
                "generated_at": datetime.utcnow().isoformat(),
                "version": "1.0"
            }

            return sigil_data

        except Exception as e:
            logger.error(f"Error generating user sigil: {str(e)}")
            return None

    def verify_sigil(
        self,
        sigil_data: Dict[str, Any],
        user: User,
        affinity: Dict[str, float],
        quantum_score: float,
        network_metrics: Dict[str, Any]
    ) -> bool:
        """Verify if a sigil matches the user's current state."""
        try:
            # Regenerate sigil components
            base_sigil = self._generate_base_sigil(user.internal_name)
            affinity_sigil = self._apply_affinity_modifiers(base_sigil, affinity)
            quantum_sigil = self._apply_quantum_modifiers(affinity_sigil, quantum_score)
            current_sigil = self._apply_network_modifiers(quantum_sigil, network_metrics)

            # Compare hashes
            current_affinity_hash = hashlib.sha256(json.dumps(affinity).encode()).hexdigest()
            current_quantum_hash = hashlib.sha256(str(quantum_score).encode()).hexdigest()
            current_network_hash = hashlib.sha256(json.dumps(network_metrics).encode()).hexdigest()

            return (
                sigil_data["sigil"] == current_sigil and
                sigil_data["affinity_hash"] == current_affinity_hash and
                sigil_data["quantum_hash"] == current_quantum_hash and
                sigil_data["network_hash"] == current_network_hash
            )

        except Exception as e:
            logger.error(f"Error verifying sigil: {str(e)}")
            return False 