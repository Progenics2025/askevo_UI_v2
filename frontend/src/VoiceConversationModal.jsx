import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { ttsService } from './lib/tts';
import { useTranslation } from 'react-i18next';

import { ollamaService } from './lib/ollamaService';

export default function VoiceConversationModal({ open, onOpenChange }) {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [recognition, setRecognition] = useState(null);

  const processVoiceInput = async (text) => {
    try {
      // Add placeholder for AI response
      setConversation(prev => [...prev, { type: 'ai', text: '...' }]);

      const messages = [
        { role: 'user', content: text }
      ];

      let fullResponse = '';

      for await (const chunk of ollamaService.streamResponse(messages)) {
        fullResponse += chunk;

        setConversation(prev => {
          const newConv = [...prev];
          newConv[newConv.length - 1] = { type: 'ai', text: fullResponse };
          return newConv;
        });
      }

      await speakResponse(fullResponse);

    } catch (error) {
      console.error('AI Processing Error:', error);
      toast.error('Failed to get AI response');
      setConversation(prev => {
        const newConv = [...prev];
        newConv[newConv.length - 1] = { type: 'ai', text: 'Sorry, I encountered an error.' };
        return newConv;
      });
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = i18n.language;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast.info(t('listening'));
      };

      recognitionInstance.onresult = async (event) => {
        const transcriptText = event.results[0][0].transcript;
        setTranscript(transcriptText);
        setConversation(prev => [...prev, { type: 'user', text: transcriptText }]);
        setIsListening(false);

        await processVoiceInput(transcriptText);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        let errorMessage = t('speechError');
        if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech detected';
        } else if (event.error === 'network') {
          errorMessage = 'Network error. Check AdBlocker/Brave Shields.';
        } else if (event.error === 'service-not-allowed') {
          errorMessage = 'Speech service not allowed.';
        }
        toast.error(errorMessage);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.start();
      setRecognition(recognitionInstance);
    } else {
      toast.error(t('speechNotSupported'));
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    toast.success('Stopped listening');
  };

  const speakResponse = async (text) => {
    setIsSpeaking(true);
    try {
      await ttsService.speak(text, i18n.language);
    } catch (error) {
      console.error("TTS Error:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    ttsService.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (!open) {
      setIsListening(false);
      setIsSpeaking(false);
      setTranscript('');
      setConversation([]);
      ttsService.cancel();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="voice-conversation-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
            {t('voiceConversation')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Visualization */}
          <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-br from-cyan-50 to-violet-50 rounded-2xl">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isListening
                ? 'bg-gradient-to-br from-cyan-500 to-violet-500 listening-pulse'
                : isSpeaking
                  ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse'
                  : 'bg-gradient-to-br from-slate-300 to-slate-400'
                }`}
            >
              {isListening ? (
                <Mic className="h-16 w-16 text-white" />
              ) : isSpeaking ? (
                <Volume2 className="h-16 w-16 text-white animate-wave" />
              ) : (
                <MicOff className="h-16 w-16 text-white" />
              )}
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-700">
              {isListening ? t('listening') : isSpeaking ? t('aiSpeaking') : t('conversationStarted')}
            </p>
          </div>

          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversation.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl ${item.type === 'user'
                    ? 'bg-gradient-to-r from-fuchsia-100 to-pink-100 ml-8'
                    : 'bg-gradient-to-r from-cyan-100 to-violet-100 mr-8'
                    }`}
                >
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    {item.type === 'user' ? 'You' : 'AI Assistant'}
                  </p>
                  <p className="text-sm text-slate-800">{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isListening && !isSpeaking && (
              <Button
                onClick={startListening}
                className="px-8 py-6 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-bold text-lg shadow-lg transition-all hover:scale-105"
                data-testid="start-voice-button"
              >
                <Mic className="mr-2 h-6 w-6" />
                {t('startConversation')}
              </Button>
            )}

            {isListening && (
              <Button
                onClick={stopListening}
                variant="destructive"
                className="px-8 py-6 font-bold text-lg shadow-lg"
                data-testid="stop-listening-button"
              >
                <MicOff className="mr-2 h-6 w-6" />
                {t('stopConversation')}
              </Button>
            )}

            {isSpeaking && (
              <Button
                onClick={stopSpeaking}
                variant="destructive"
                className="px-8 py-6 font-bold text-lg shadow-lg"
                data-testid="stop-speaking-button"
              >
                <VolumeX className="mr-2 h-6 w-6" />
                {t('stopConversation')}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-slate-500">
            This is a conversational voice interface. The AI will speak responses aloud.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
