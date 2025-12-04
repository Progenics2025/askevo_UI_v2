import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Globe, Mic, Server, Info, Volume2, AlertCircle } from 'lucide-react';
import { ttsService } from './lib/tts';

export default function SettingsDialog({ open, onOpenChange }) {
    const { t, i18n } = useTranslation();
    const [autoSpeak, setAutoSpeak] = useState(localStorage.getItem('autoSpeak') === 'true');
    const [ollamaUrl, setOllamaUrl] = useState(
        localStorage.getItem('ollamaUrl') || '/api/ollama'
    );
    const [apiUrl, setApiUrl] = useState(
        localStorage.getItem('genomicsApiUrl') || '/api'
    );
    const [currentVoice, setCurrentVoice] = useState(null);
    const [isTestingVoice, setIsTestingVoice] = useState(false);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français (French)' },
        { code: 'es', name: 'Español (Spanish)' },
        { code: 'de', name: 'Deutsch (German)' },
        { code: 'hi', name: 'हिन्दी (Hindi)' },
        { code: 'ta', name: 'தமிழ் (Tamil)' },
        { code: 'te', name: 'తెలుగు (Telugu)' },
        { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
        { code: 'ml', name: 'മലയാളം (Malayalam)' },
        { code: 'bn', name: 'বাংলা (Bengali)' },
        { code: 'mr', name: 'मराठी (Marathi)' },
        { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
        { code: 'od', name: 'ଓଡ଼ିଆ (Odia)' },
    ];

    useEffect(() => {
        const voice = ttsService.getVoiceForLanguage(i18n.language);
        setCurrentVoice(voice);
    }, [i18n.language, open]);

    const handleLanguageChange = (value) => {
        i18n.changeLanguage(value);
    };

    const handleTestVoice = async () => {
        setIsTestingVoice(true);
        try {
            const testText = t('welcome'); // Speak the "Welcome" text in the current language
            await ttsService.speak(testText, i18n.language);
        } catch (error) {
            console.error("TTS Error:", error);
        } finally {
            setIsTestingVoice(false);
        }
    };

    const handleSave = () => {
        localStorage.setItem('autoSpeak', autoSpeak);
        localStorage.setItem('ollamaUrl', ollamaUrl);
        localStorage.setItem('genomicsApiUrl', apiUrl);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" data-testid="settings-dialog">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
                        <Settings className="h-6 w-6 text-cyan-600" />
                        {t('settings')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Language Settings */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                            <Globe className="h-5 w-5 text-violet-500" />
                            <h3>{t('language')}</h3>
                        </div>
                        <div className="pl-7 space-y-2">
                            <Select value={i18n.language} onValueChange={handleLanguageChange}>
                                <SelectTrigger className="w-full border-2 border-cyan-100 focus:border-cyan-400">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Voice Status */}
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 text-sm">
                                    {currentVoice ? (
                                        <>
                                            <Volume2 className="h-4 w-4 text-green-600" />
                                            <span className="text-slate-700 font-medium truncate max-w-[200px]" title={currentVoice.name}>
                                                Voice: {currentVoice.name}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4 text-amber-500" />
                                            <span className="text-amber-600 font-medium">No detected voice for this language</span>
                                        </>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleTestVoice}
                                    disabled={isTestingVoice || !currentVoice}
                                    className="h-7 text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                                >
                                    {isTestingVoice ? 'Playing...' : 'Test Voice'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Voice Settings */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                            <Mic className="h-5 w-5 text-fuchsia-500" />
                            <h3>{t('voiceSettings')}</h3>
                        </div>
                        <div className="pl-7 flex items-center justify-between">
                            <Label htmlFor="auto-speak" className="text-slate-600 cursor-pointer">{t('autoSpeak')}</Label>
                            <Switch
                                id="auto-speak"
                                checked={autoSpeak}
                                onCheckedChange={setAutoSpeak}
                            />
                        </div>
                    </div>

                    {/* API Configuration */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                            <Server className="h-5 w-5 text-emerald-500" />
                            <h3>{t('apiConfiguration')}</h3>
                        </div>
                        <div className="pl-7 space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="ollama-url" className="text-sm font-medium text-slate-600">{t('ollamaUrl')}</Label>
                                <Input
                                    id="ollama-url"
                                    value={ollamaUrl}
                                    onChange={(e) => setOllamaUrl(e.target.value)}
                                    className="border-2 border-cyan-100 focus:border-cyan-400"
                                    placeholder="http://localhost:11434"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="api-url" className="text-sm font-medium text-slate-600">{t('genomicsApiUrl')}</Label>
                                <Input
                                    id="api-url"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    className="border-2 border-cyan-100 focus:border-cyan-400"
                                    placeholder="http://localhost:3001/api"
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 font-semibold text-slate-700">
                            <Info className="h-4 w-4" />
                            {t('about')}
                        </div>
                        <p className="text-sm text-slate-600">Progenics AI - Genomics Chat Assistant</p>
                        <p className="text-xs text-slate-500 mt-1">{t('version')} 1.0.0</p>
                        <p className="text-xs text-slate-500">{t('poweredBy')} Ollama (Gemma Model)</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold"
                    >
                        {t('save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
