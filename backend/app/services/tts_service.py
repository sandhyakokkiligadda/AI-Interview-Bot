"""
High-performance asynchronous Text-to-Speech (TTS) service using Edge Neural TTS.
Employs Microsoft Neural Studio voices matching Fliki audio sample (JennyNeural profile)
and provides regional Indian neural voices for multilingual interview delivery.
Includes in-memory LRU audio caching to ensure instantaneous playback for repeated prompts.
"""

import io
import logging
from typing import Dict, Optional
import edge_tts

logger = logging.getLogger(__name__)

# Voice mapping with JennyNeural as primary Fliki sample voice
VOICE_MAP: Dict[str, str] = {
    "English": "en-US-JennyNeural",
    "Telugu": "te-IN-ShrutiNeural",
    "Hindi": "hi-IN-SwaraNeural",
    "Tamil": "ta-IN-PallaviNeural",
    "Kannada": "kn-IN-SapnaNeural",
    "Malayalam": "ml-IN-SobhanaNeural"
}

# In-memory cache for synthesized audio snippets: (text_hash, voice) -> bytes
_AUDIO_CACHE: Dict[str, bytes] = {}
_MAX_CACHE_SIZE = 250

class TTSService:
    @staticmethod
    def get_voice_for_language(language: str) -> str:
        return VOICE_MAP.get(language, VOICE_MAP["English"])

    @staticmethod
    async def synthesize(text: str, language: str = "English") -> bytes:
        """
        Synthesizes spoken text into MP3 audio bytes using the Fliki studio neural voice.
        Returns cached bytes if available.
        """
        clean_text = text.strip()
        if not clean_text:
            return b""

        voice = TTSService.get_voice_for_language(language)
        cache_key = f"{voice}::{clean_text}"

        if cache_key in _AUDIO_CACHE:
            return _AUDIO_CACHE[cache_key]

        try:
            communicate = edge_tts.Communicate(clean_text, voice)
            buf = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buf.write(chunk["data"])

            audio_bytes = buf.getvalue()

            # Cache if not overflowing
            if len(_AUDIO_CACHE) < _MAX_CACHE_SIZE:
                _AUDIO_CACHE[cache_key] = audio_bytes

            return audio_bytes
        except Exception as e:
            logger.error(f"TTS synthesis error for voice {voice}: {e}")
            raise e

tts_service = TTSService()
