import i18n from './i18n';

class TextToSpeechService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.init();
    }

    init() {
        if (this.synth) {
            // Chrome loads voices asynchronously
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => {
                    this.voices = this.synth.getVoices();
                };
            }
            this.voices = this.synth.getVoices();
        }
    }

    getVoices() {
        if (!this.voices.length && this.synth) {
            this.voices = this.synth.getVoices();
        }
        return this.voices;
    }

    getVoiceForLanguage(langCode) {
        const voices = this.getVoices();
        // Try to find an exact match first (e.g., 'en-US' or 'fr-FR')
        let voice = voices.find(v => v.lang === langCode || v.lang.startsWith(langCode));

        // If no match, try to find a voice that contains the language code
        if (!voice) {
            voice = voices.find(v => v.lang.includes(langCode));
        }

        return voice;
    }

    speak(text, langCode = i18n.language) {
        if (!this.synth) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Cancel any current speaking
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.getVoiceForLanguage(langCode);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            console.warn(`No voice found for language: ${langCode}, using default.`);
            utterance.lang = langCode;
        }

        return new Promise((resolve, reject) => {
            utterance.onend = () => resolve();
            utterance.onerror = (error) => reject(error);
            this.synth.speak(utterance);
        });
    }

    cancel() {
        if (this.synth) {
            this.synth.cancel();
        }
    }

    isSupported() {
        return !!this.synth;
    }
}

export const ttsService = new TextToSpeechService();
