from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class AudioEngine:
    """
    Audio navigation instruction generator.
    Creates SSML-compatible instructions for text-to-speech.
    """

    CARDINAL_DIRECTIONS = {
        "N": "north", "NE": "northeast", "E": "east",
        "SE": "southeast", "S": "south", "SW": "southwest",
        "W": "west", "NW": "northwest"
    }

    def generate_turn_by_turn(
        self,
        segments: List[Dict],
        profile: str = "general"
    ) -> List[Dict]:
        """
        Generate turn-by-turn navigation instructions with SSML.
        """
        instructions = []
        turns = ["straight", "right", "left", "slight right", "slight left",
                 "sharp right", "sharp left", "U-turn"]

        # Start instruction
        instructions.append({
            "step": 0,
            "text": self._format_start(profile),
            "ssml": f"<speak><prosody rate='medium'>{self._format_start(profile)}</prosody></speak>",
            "distance_m": 0,
            "type": "start"
        })

        for i, seg in enumerate(segments[:8]):
            turn = turns[i % len(turns)] if i > 0 else "straight"
            street = seg.get("street_name", "the street")
            distance = int(seg.get("distance_m", 100))
            lighting = seg.get("lighting_level", "MODERATE")

            text = f"In {distance} meters, turn {turn} onto {street}."

            if lighting == "DIM" and profile in ["woman", "elderly"]:
                text += " Caution: low lighting ahead."

            if seg.get("has_cctv"):
                text += " CCTV monitored area."

            instructions.append({
                "step": i + 1,
                "text": text,
                "ssml": f"<speak><prosody rate='slow'>{text}</prosody></speak>",
                "distance_m": distance,
                "street": street,
                "turn": turn,
                "type": "turn"
            })

        # Arrival instruction
        instructions.append({
            "step": len(instructions),
            "text": "You have arrived at your destination. You are safe.",
            "ssml": "<speak><prosody rate='slow' pitch='+2st'>You have arrived at your destination. You are safe.</prosody></speak>",
            "distance_m": 0,
            "type": "arrival"
        })

        return instructions

    def _format_start(self, profile: str) -> str:
        starters = {
            "woman": "Starting safe navigation. Your route prioritizes well-lit, monitored streets.",
            "elderly": "Starting navigation. This route avoids stairs and has rest points along the way.",
            "wheelchair": "Starting accessible navigation. This route uses ramps and smooth surfaces.",
            "visually_impaired": "Starting audio navigation. Listen carefully for all instructions. Haptic feedback enabled.",
            "general": "Starting navigation. Route optimized for your safety and comfort.",
        }
        return starters.get(profile, starters["general"])


# Singleton
audio_engine = AudioEngine()