
import { useState, useEffect } from 'react';
import { CameraView } from '@/components/CameraView';
import { TranslationPanel } from '@/components/TranslationPanel';
import { ControlBar } from '@/components/ControlBar';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useToast } from '@/hooks/use-toast';
import { User, Menu, Camera, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-wide">
              VOCALIZE
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-wider">
              <a href="#home" className="hover:text-white/70 transition-colors">HOME</a>
              <a href="#demo" className="hover:text-white/70 transition-colors">DEMO</a>
              <a href="#about" className="hover:text-white/70 transition-colors">ABOUT</a>
              <a href="#contact" className="hover:text-white/70 transition-colors">CONTACT</a>
            </div>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <User className="w-4 h-4 mr-2" />
              LOGIN
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          {/* Main Title */}
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter mb-8 leading-none">
            ASL TO SPEECH
            <br />
            TRANSLATOR
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/70 max-w-4xl mx-auto mb-16 leading-relaxed">
            The ASL translation system is designed to be versatile, with real-time recognition capabilities. 
            Its ability to detect and translate American Sign Language makes it an invaluable tool for accessibility.
          </p>

          {/* Status Indicator */}
          <div className="mb-16">
            <StatusIndicator status={appStatus} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-24">
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-sm uppercase tracking-widest"
            >
              <Camera className="w-4 h-4 mr-2" />
              CAMERA
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-sm uppercase tracking-widest"
            >
              TRANSLATION
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-sm uppercase tracking-widest"
            >
              <Mic className="w-4 h-4 mr-2" />
              SPEECH
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid xl:grid-cols-3 gap-8 max-w-7xl mx-auto text-left">
            {/* Camera Section - Takes 2 columns */}
            <div className="xl:col-span-2">
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <CameraView
                  isActive={isVideoActive}
                  showLandmarks={showLandmarks}
                  onLetterRecognized={handleLetterRecognized}
                  onWordComplete={handleWordComplete}
                  recognizedLetter={recognizedLetter}
                />
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

        {/* Brand Logos Section */}
        <div className="border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
              <div className="text-2xl font-bold">AI</div>
              <div className="text-2xl font-bold">ML</div>
              <div className="text-2xl font-bold">ASL</div>
              <div className="text-2xl font-bold">SPEECH</div>
              <div className="text-2xl font-bold">VISION</div>
              <div className="text-2xl font-bold">TECH</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
