import i18n from './i18n';

class TextToSpeechService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.voicesLoaded = false;
        this.init();
    }

    init() {
        if (this.synth) {
            // Chrome loads voices asynchronously
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => {
                    this.voices = this.synth.getVoices();
                    this.voicesLoaded = true;
                    console.log(`Loaded ${this.voices.length} voices`);
                };
            }

            // Try to load voices immediately
            this.voices = this.synth.getVoices();
            if (this.voices.length > 0) {
                this.voicesLoaded = true;
            }

            // Force voice loading after 100ms if still empty
            setTimeout(() => {
                if (this.voices.length === 0) {
                    this.voices = this.synth.getVoices();
                    this.voicesLoaded = this.voices.length > 0;
                }
            }, 100);
        }
    }

    async waitForVoices(timeout = 2000) {
        if (this.voicesLoaded) return true;

        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            this.voices = this.synth.getVoices();
            if (this.voices.length > 0) {
                this.voicesLoaded = true;
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return false;
    }

    getVoices() {
        if (!this.voices.length && this.synth) {
            this.voices = this.synth.getVoices();
        }
        return this.voices;
    }

    getVoiceForLanguage(langCode) {
        const voices = this.getVoices();

        // Try exact match first (e.g., 'en-US')
        let voice = voices.find(v => v.lang === langCode);

        // Try language prefix match (e.g., 'en' matches 'en-US')
        if (!voice) {
            const langPrefix = langCode.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langPrefix));
        }

        // Try any voice containing the language code
        if (!voice) {
            voice = voices.find(v => v.lang.includes(langCode));
        }

        return voice;
    }

    async speak(text, langCode = i18n.language) {
        if (!text || text.trim().length === 0) return;

        if (!this.synth) {
            console.error('Speech synthesis not supported');
            return this.fallbackToCloudTTS(text, langCode);
        }

        // Cancel any current speaking
        this.synth.cancel();

        // Wait for voices to load
        await this.waitForVoices();

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.getVoiceForLanguage(langCode);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
            console.log(`Using voice: ${voice.name} (${voice.lang})`);
        } else {
            // No voice found, use browser's default for the language
            utterance.lang = langCode;
            console.warn(`No voice found for ${langCode}, using default voice`);

            // If still no voices after waiting, try cloud fallback
            if (this.voices.length === 0) {
                console.warn('No browser voices available, trying cloud TTS');
                return this.fallbackToCloudTTS(text, langCode);
            }
        }

        return new Promise((resolve, reject) => {
            utterance.onend = () => resolve();
            utterance.onerror = (event) => {
                if (event.error === 'interrupted' || event.error === 'canceled') {
                    resolve();
                } else {
                    console.error('TTS Error:', event);
                    // Try cloud fallback on error
                    this.fallbackToCloudTTS(text, langCode).then(resolve).catch(reject);
                }
            };

            try {
                this.synth.speak(utterance);
            } catch (error) {
                console.error('Speech synthesis error:', error);
                this.fallbackToCloudTTS(text, langCode).then(resolve).catch(reject);
            }
        });
    }

    async fallbackToCloudTTS(text, langCode) {
        // Use ResponsiveVoice free tier as fallback
        // Note: Limited to 300 characters and non-commercial use
        if (window.responsiveVoice) {
            return new Promise((resolve) => {
                window.responsiveVoice.speak(text, this.mapLangToResponsiveVoice(langCode), {
                    onend: resolve,
                    onerror: (error) => {
                        console.error('ResponsiveVoice error:', error);
                        resolve();
                    }
                });
            });
        }

        // If no cloud TTS available, just log
        console.warn('No TTS service available for this text');
        return Promise.resolve();
    }

    mapLangToResponsiveVoice(langCode) {
        // Map language codes to ResponsiveVoice voice names
        const voiceMap = {
            'en': 'UK English Female',
            'en-US': 'US English Female',
            'en-GB': 'UK English Female',
            'hi': 'Hindi Female',
            'hi-IN': 'Hindi Female',
            'bn': 'Bengali Female',
            'ta': 'Tamil Female',
            'te': 'Telugu Female',
            'mr': 'Marathi Female',
            'gu': 'Gujarati Female',
            'kn': 'Kannada Female',
            'ml': 'Malayalam Female',
            'pa': 'Punjabi Female',
            'fr': 'French Female',
            'es': 'Spanish Female',
            'de': 'German Female',
            'it': 'Italian Female',
            'pt': 'Portuguese Female',
            'ru': 'Russian Female',
            'ja': 'Japanese Female',
            'ko': 'Korean Female',
            'zh': 'Chinese Female',
            'ar': 'Arabic Female'
        };

        return voiceMap[langCode] || voiceMap[langCode.split('-')[0]] || 'UK English Female';
    }

    cancel() {
        if (this.synth) {
            this.synth.cancel();
        }
        if (window.responsiveVoice) {
            window.responsiveVoice.cancel();
        }
    }

    isSupported() {
        return !!this.synth || !!window.responsiveVoice;
    }
}

export const ttsService = new TextToSpeechService();
