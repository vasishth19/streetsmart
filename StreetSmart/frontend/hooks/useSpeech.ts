import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechReturn {
  speak: (text: string, lang?: string, rate?: number) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useSpeech(): UseSpeechReturn {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback((text: string, lang = 'en-US', rate = 0.9) => {
    if (!supported) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Prefer a natural voice
    const preferredVoice = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [supported, voices]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  const pause = useCallback(() => {
    if (supported) window.speechSynthesis.pause();
  }, [supported]);

  const resume = useCallback(() => {
    if (supported) window.speechSynthesis.resume();
  }, [supported]);

  return { speak, stop, pause, resume, speaking, supported, voices };
}
