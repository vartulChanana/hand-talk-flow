
import { useState, useEffect } from 'react';
import { CameraView } from '@/components/CameraView';
import { TranslationPanel } from '@/components/TranslationPanel';
import { ControlBar } from '@/components/ControlBar';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Zap, Brain } from 'lucide-react';

export type AppStatus = 'LOADING' | 'READY' | 'RECOGNIZING' | 'ERROR';

const Index = () => {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [currentWord, setCurrentWord] = useState('');
  const [translatedWords, setTranslatedWords] = useState<string[]>([]);
  const [appStatus, setAppStatus] = useState<AppStatus>('LOADING');
  const [recognizedLetter, setRecognizedLetter] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      try {
        setAppStatus('LOADING');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAppStatus('READY');
        toast({
          title: "🚀 Vocalize Ready",
          description: "AI models loaded successfully. Ready to translate!",
        });
      } catch (error) {
        setAppStatus('ERROR');
        toast({
          title: "❌ Loading Error",
          description: "Failed to load ASL recognition models.",
          variant: "destructive",
        });
      }
    };

    loadModels();
  }, [toast]);

  const handleCameraToggle = () => {
    setIsVideoActive(!isVideoActive);
    if (!isVideoActive && appStatus === 'READY') {
      setAppStatus('RECOGNIZING');
    } else {
      setAppStatus('READY');
    }
  };

  const handleLetterRecognized = (letter: string) => {
    setRecognizedLetter(letter);
    setCurrentWord(prev => prev + letter);
  };

  const handleWordComplete = () => {
    if (currentWord.trim()) {
      setTranslatedWords(prev => [...prev, currentWord.trim()]);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentWord.trim());
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
      
      setCurrentWord('');
      setRecognizedLetter('');
    }
  };

  const handleClearTranslation = () => {
    setTranslatedWords([]);
    setCurrentWord('');
    setRecognizedLetter('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10">
        {/* Modern Header */}
        <header className="pt-16 pb-12">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">
                  Vocalize
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-purple-300 text-sm font-medium">AI-Powered Translation</span>
                </div>
              </div>
            </div>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Transform American Sign Language into text and speech with cutting-edge AI technology. 
              <span className="text-purple-300 font-semibold"> Real-time, accurate, accessible.</span>
            </p>

            <StatusIndicator status={appStatus} />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="container mx-auto px-6 pb-16">
          <div className="grid xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Camera Section - Takes 2 columns */}
            <div className="xl:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="p-2">
                  <div className="rounded-2xl overflow-hidden border border-slate-600/30 shadow-xl">
                    <CameraView
                      isActive={isVideoActive}
                      showLandmarks={showLandmarks}
                      onLetterRecognized={handleLetterRecognized}
                      onWordComplete={handleWordComplete}
                      recognizedLetter={recognizedLetter}
                    />
                  </div>
                </div>
                <ControlBar
                  isVideoActive={isVideoActive}
                  showLandmarks={showLandmarks}
                  onCameraToggle={handleCameraToggle}
                  onLandmarksToggle={() => setShowLandmarks(!showLandmarks)}
                  disabled={appStatus !== 'READY' && appStatus !== 'RECOGNIZING'}
                />
              </div>
            </div>

            {/* Translation Panel - Takes 1 column */}
            <div className="xl:col-span-1">
              <TranslationPanel
                currentWord={currentWord}
                translatedWords={translatedWords}
                onClear={handleClearTranslation}
              />
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <footer className="pb-16">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800/30 backdrop-blur-sm rounded-full border border-slate-700/50">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <p className="text-slate-300 font-medium">
                Empowering communication through AI • Built for accessibility
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
