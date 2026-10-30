/* ==========================================================================
   SHU ORIC AI – Multilingual Speech Recognition & Synthesis Engine
   English, Urdu, and Urdu-English Code-Switching
   ========================================================================== */

class VoiceController {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.continuousMode = false;
    this.language = 'en-US'; // 'en-US' or 'ur-PK'
    this.speechRate = 1.0;
    this.onTranscriptCallback = null;
    this.onStatusChangeCallback = null;

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API recognition not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback({ listening: true });
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (this.onTranscriptCallback) {
        this.onTranscriptCallback({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback({ listening: false });
      // Auto-restart if continuous mode active
      if (this.continuousMode) {
        try {
          this.recognition.start();
        } catch (e) {}
      }
    };
  }

  startListening(onTranscript, onStatusChange) {
    if (!this.recognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    // Interrupt any ongoing speech output when user speaks
    this.stopSpeaking();

    this.onTranscriptCallback = onTranscript;
    this.onStatusChangeCallback = onStatusChange;
    try {
      this.recognition.lang = this.language;
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already active", e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
  }

  toggleListening(onTranscript, onStatusChange) {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening(onTranscript, onStatusChange);
    }
  }

  speak(text, onEndCallback = null) {
    if (!this.synthesis) return;
    this.stopSpeaking();

    // Clean markdown symbols for natural speech synthesis
    const cleanText = text
      .replace(/###|\*\*|\*|`|\[|\]\(.*?\)/g, '')
      .replace(/\|.*?\|/g, '') // remove markdown tables
      .replace(/[-*]\s/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = this.speechRate;

    // Detect language or Urdu characters
    const hasUrdu = /[\u0600-\u06FF]/.test(cleanText);
    const voices = this.synthesis.getVoices();

    if (hasUrdu) {
      const urduVoice = voices.find(v => v.lang.startsWith('ur'));
      if (urduVoice) utterance.voice = urduVoice;
    } else {
      const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')));
      if (engVoice) utterance.voice = engVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback({ speaking: true });
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback({ speaking: false });
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback({ speaking: false });
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

window.VoiceController = new VoiceController();
