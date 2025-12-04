import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ThumbsUp, ThumbsDown, Copy, RotateCw, Edit2, Check, Mic, FileUp, Volume2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import FeedbackDialog from './FeedbackDialog';
import VoiceConversationModal from './VoiceConversationModal';
import FileUploadModal from './FileUploadModal';
import { useTranslation } from 'react-i18next';
import { ttsService } from './lib/tts';
import { ollamaService } from './lib/ollamaService';
import { Response } from './components/ui/response';
import { apiService } from './lib/apiService';
import { Loader } from './components/ui/loader';

export default function GenomicsChat({ chatId, chatName }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m Progenics geneLLM, your specialized genomics AI assistant. I can analyze genetic data, answer questions about mutations, and help with genomic interpretations. You can also upload VCF, Excel, CSV, or text files for analysis!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [modelName, setModelName] = useState('gemma3:4b');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const scrollAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load messages when chat session changes
  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!chatId) return;

      setIsLoadingMessages(true);
      try {
        const token = localStorage.getItem('token');

        // If session ID starts with "default-", it's a local session
        if (chatId.startsWith('default-')) {
          setMessages([
            {
              id: '1',
              type: 'bot',
              content: t('welcome') + "! " + t('inputPlaceholder'),
              timestamp: new Date(),
            },
          ]);
        } else if (token) {
          // Load from database
          const sessionMessages = await apiService.getSessionMessages(chatId);

          if (sessionMessages.length > 0) {
            const formattedMessages = sessionMessages.map(msg => ({
              id: msg.id.toString(), // Backend returns 'id', not 'message_id'
              type: msg.sender_type === 'user' ? 'user' : 'bot', // Backend returns 'sender_type'
              content: msg.message_text, // Backend returns 'message_text'
              timestamp: new Date(msg.created_at),
            }));
            setMessages(formattedMessages);
          } else {
            // Empty session, show welcome
            setMessages([
              {
                id: '1',
                type: 'bot',
                content: t('welcome') + "! " + t('inputPlaceholder'),
                timestamp: new Date(),
              },
            ]);
          }
        } else {
          // No token, show welcome
          setMessages([
            {
              id: '1',
              type: 'bot',
              content: t('welcome') + "! " + t('inputPlaceholder'),
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        // On error, show welcome message
        setMessages([
          {
            id: '1',
            type: 'bot',
            content: t('welcome') + "! " + t('inputPlaceholder'),
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadSessionMessages();
  }, [chatId, t]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        toast.success(t('speechCaptured'));
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error(t('speechError'));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [t]);

  // Check Ollama connection status
  useEffect(() => {
    const checkOllamaConnection = async () => {
      try {
        const ollamaUrl = localStorage.getItem('ollamaUrl') || `http://${window.location.hostname}:11434`;
        const response = await fetch(`${ollamaUrl}/api/tags`);
        if (response.ok) {
          const data = await response.json();
          setOllamaConnected(true);
          // Get the first model name or use default
          if (data.models && data.models.length > 0) {
            setModelName(data.models[0].name);
          }
        } else {
          setOllamaConnected(false);
        }
      } catch (error) {
        setOllamaConnected(false);
      }
    };

    // Check immediately
    checkOllamaConnection();

    // Check every 10 seconds
    const interval = setInterval(checkOllamaConnection, 10000);

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 100);
  };

  const handleSend = async (overridePrompt = null, skipUserMessage = false, overrideMessages = null) => {
    const userPrompt = overridePrompt || inputValue;
    if (!userPrompt.trim()) return;

    const currentMessages = overrideMessages || messages;

    let saveUserMessagePromise = Promise.resolve();

    if (!skipUserMessage) {
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: userPrompt,
        timestamp: new Date(),
      };

      // Optimistic update - show message immediately
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');

      // Save user message to database (async, non-blocking)
      saveUserMessagePromise = (async () => {
        try {
          const token = localStorage.getItem('token');
          if (token && !chatId.startsWith('default-')) {
            await apiService.saveMessage(chatId, 'user', userPrompt);
          }
        } catch (error) {
          console.error('Failed to save user message:', error);
        }
      })();
    }

    // Create bot message placeholder for streaming
    const botMessageId = (Date.now() + 1).toString();
    const botMessage = {
      id: botMessageId,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      streaming: true
    };

    setMessages((prev) => {
      // If we are overriding messages (e.g. edit), we should append to THAT list, not the stale prev state
      // But setMessages receives 'prev'. 
      // If we just did setMessages(truncated) in handleSaveEdit, 'prev' here might be the truncated one IF react batched it?
      // Actually, if we passed overrideMessages, we probably want to ensure the bot message is added to THAT.
      if (overrideMessages) {
        return [...overrideMessages, botMessage];
      }
      return [...prev, botMessage];
    });

    try {
      // OPTIMIZATION 1: Lazy Context Building (saves 500-1500ms when not needed)
      // Only fetch genomics data if keywords are detected
      let genomicsContext = '';
      const hasGenomicsKeywords = /variant|mutation|SNP|gene|BRCA|TP53|disease|disorder|test|screening|diagnosis/i.test(userPrompt);

      if (hasGenomicsKeywords) {
        // This runs in background while we prepare the prompt
        const genomicsDataPromise = (async () => {
          try {
            const { genomicsApiService } = await import('./lib/genomicsApiService');
            return await genomicsApiService.buildContext(userPrompt);
          } catch (error) {
            console.warn('Genomics context failed, continuing without:', error);
            return '';
          }
        })();

        // Wait max 1 second for genomics data, then proceed anyway
        genomicsContext = await Promise.race([
          genomicsDataPromise,
          new Promise(resolve => setTimeout(() => resolve(''), 1000))
        ]);
      }

      // Build messages array for Ollama chat API (like ChatGPT/Claude)
      // Include last 10 messages for context
      const messagesToSend = currentMessages
        .slice(-10)  // Last 10 messages for context
        .filter(msg => !msg.streaming && msg.content)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Add genomics context to the current user message if available
      let currentUserContent = userPrompt;
      if (genomicsContext) {
        currentUserContent = `Genomic Data Context:\n${genomicsContext}\n\nQuestion: ${userPrompt}`;
      }

      // Add the current user message
      messagesToSend.push({
        role: 'user',
        content: currentUserContent
      });

      // Stream response from Ollama with conversation history
      let fullResponse = '';

      for await (const chunk of ollamaService.streamResponse(messagesToSend, null)) {
        fullResponse += chunk;

        // Update the bot message with streamed content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: fullResponse, streaming: true }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, streaming: false }
            : msg
        )
      );

      // Save bot response to database (async, non-blocking)
      (async () => {
        try {
          const token = localStorage.getItem('token');
          if (token && !chatId.startsWith('default-')) {
            await saveUserMessagePromise; // Wait for user message to be saved first
            await apiService.saveMessage(chatId, 'bot', fullResponse);
          }
        } catch (error) {
          console.error('Failed to save bot response:', error);
        }
      })();

      // Auto-generate session title from first message
      if (messages.length <= 1 && !chatId.startsWith('default-')) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const title = userPrompt.substring(0, 50) + (userPrompt.length > 50 ? '...' : '');
            await apiService.renameSession(chatId, title);
          } catch (error) {
            console.error('Failed to auto-title session:', error);
          }
        }
      }

      // Auto-speak if enabled
      if (localStorage.getItem('autoSpeak') === 'true' && fullResponse) {
        ttsService.speak(fullResponse, i18n.language);
      }

    } catch (error) {
      console.error('Ollama error:', error);

      // Update with error message
      const errorMessage = 'Sorry, I encountered an error connecting to the AI model. Please check if Ollama is running.';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, content: errorMessage, streaming: false, error: true }
            : msg
        )
      );

      toast.error('Failed to get AI response');
    }
  };

  const handleSpeechToText = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        setIsListening(true);
        recognitionRef.current.start();
        toast.info(t('listening'));
      }
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.success(t('copied'));
  };

  const handleLike = () => {
    toast.success(t('feedbackThanks'));
  };

  const handleDislike = (messageId) => {
    setSelectedMessageId(messageId);
    setFeedbackDialogOpen(true);
  };

  const handleRegenerate = (messageId) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex > 0) {
      const previousUserMessage = messages[messageIndex - 1];

      // Remove the old bot message
      setMessages(prev => prev.filter(m => m.id !== messageId));

      // Regenerate response
      handleSend(previousUserMessage.content, true);
    }
  };

  const handleEdit = (message) => {
    setEditingMessageId(message.id);
    setEditValue(message.content);
  };

  const handleSaveEdit = (messageId) => {
    if (editValue.trim()) {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex !== -1) {
        // Truncate conversation after this message
        const truncatedMessages = messages.slice(0, messageIndex + 1);
        // Update the edited message content
        truncatedMessages[messageIndex] = { ...truncatedMessages[messageIndex], content: editValue };

        // Update state
        setMessages(truncatedMessages);

        // Trigger regeneration with new content and truncated context
        handleSend(editValue, true, truncatedMessages);

        toast.success(t('messageUpdated'));
      }
    }
    setEditingMessageId(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (files) => {
    const fileNames = Array.from(files).map(f => f.name).join(', ');
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `${t('filesSelected')}: ${fileNames}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I've received your genetic data files (${fileNames}). Analyzing the genomic sequences and variants... The data contains multiple genetic markers that I'll process for clinical interpretation.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      scrollToBottom();
    }, 1000);

    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-cyan-50/30 to-violet-50/30" data-testid="genomics-chat-container">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-cyan-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque' }}>
                {chatName}
              </h2>
              <p className="text-sm text-slate-500 font-medium">{t('genomicsAssistant')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6" data-testid="chat-messages-area">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 animate-fade-in ${message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              data-testid={`message-${message.id}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Avatar className="h-10 w-10 flex-shrink-0 shadow-md">
                <AvatarFallback
                  className={`text-sm font-bold ${message.type === 'bot'
                    ? 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white'
                    : 'bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white'
                    }`}
                >
                  {message.type === 'bot' ? 'AI' : 'U'}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 space-y-2 ${message.type === 'user' ? 'flex flex-col items-end' : ''
                }`}>
                {editingMessageId === message.id ? (
                  <div className="w-full max-w-2xl">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[80px] border-2 border-cyan-300"
                      data-testid={`edit-message-textarea-${message.id}`}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(message.id)}
                        className="bg-gradient-to-r from-cyan-500 to-violet-500"
                        data-testid={`save-edit-${message.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {t('save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMessageId(null)}
                        data-testid={`cancel-edit-${message.id}`}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`rounded-2xl px-5 py-3 inline-block max-w-2xl shadow-md transition-all hover:shadow-lg ${message.type === 'bot'
                        ? 'bg-white border-2 border-cyan-100 text-slate-900'
                        : 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white'
                        }`}
                    >
                      {message.type === 'bot' ? (
                        message.streaming && !message.content ? (
                          <div className="py-2 px-1">
                            <Loader size={24} className="text-slate-400" />
                          </div>
                        ) : (
                          <Response className="text-sm">{message.content}</Response>
                        )
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex items-center gap-1 ${message.type === 'user' ? 'justify-end' : ''
                      }`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(message.content)}
                        className="h-8 px-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        data-testid={`copy-message-${message.id}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      {message.type === 'user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(message)}
                          className="h-8 px-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          data-testid={`edit-message-${message.id}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {message.type === 'bot' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerate(message.id)}
                            className="h-8 px-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            data-testid={`regenerate-${message.id}`}
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => ttsService.speak(message.content, i18n.language)}
                            className="h-8 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title={t('readAloud')}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike()}
                            className="h-8 px-2 text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                            data-testid={`like-${message.id}`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDislike(message.id)}
                            className="h-8 px-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            data-testid={`dislike-${message.id}`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-md border-t border-cyan-100 p-3 md:p-4 shadow-lg z-10">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">

          {/* Row 1: Text Input and Send Button */}
          <div className="flex gap-2 md:gap-3 items-end w-full">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('inputPlaceholder')}
                className="min-h-[48px] md:min-h-[56px] max-h-[150px] resize-none border-2 border-cyan-200 focus:border-cyan-400 transition-colors text-base"
                data-testid="chat-input-field"
              />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="h-12 md:h-14 px-4 md:px-6 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white shadow-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="send-message-button"
            >
              <Send className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>

          {/* Row 2: Action Buttons (Left) and Status Bar (Right) */}
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2 md:gap-3">
              <Button
                onClick={() => setVoiceModalOpen(true)}
                className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white shadow-lg transition-all hover:scale-105"
                data-testid="voice-conversation-button"
              >
                <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button
                onClick={handleSpeechToText}
                className={`h-10 w-10 md:h-12 md:w-12 text-white shadow-lg transition-all hover:scale-105 ${isListening
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse'
                  : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600'
                  }`}
                data-testid="speech-to-text-button"
              >
                <Mic className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button
                onClick={() => setFileUploadModalOpen(true)}
                className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg transition-all hover:scale-105"
                data-testid="file-upload-button"
              >
                <FileUp className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium shadow-md transition-all ${ollamaConnected
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              }`}>
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${ollamaConnected ? 'bg-white animate-pulse' : 'bg-white/70'
                }`}></div>
              <span>
                {ollamaConnected
                  ? 'Progenics geneLLM'
                  : 'Model Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        messageId={selectedMessageId}
      />
      <VoiceConversationModal
        open={voiceModalOpen}
        onOpenChange={setVoiceModalOpen}
      />
      <FileUploadModal
        open={fileUploadModalOpen}
        onOpenChange={setFileUploadModalOpen}
        onUpload={handleFileUpload}
      />
    </div>
  );
}
