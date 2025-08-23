import { useState, useEffect } from 'react';
import { CameraView } from '@/components/CameraView';
import { TranslationPanel } from '@/components/TranslationPanel';
import { ControlBar } from '@/components/ControlBar';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useToast } from '@/hooks/use-toast';

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
    // Simulate model loading
    const loadModels = async () => {
      try {
        setAppStatus('LOADING');
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAppStatus('READY');
        toast({
          title: "Vocalize Ready",
          description: "ASL recognition models loaded successfully!",
        });
      } catch (error) {
        setAppStatus('ERROR');
        toast({
          title: "Loading Error",
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
      
      // Text-to-speech
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
    <div className="min-h-screen bg-gradient-hero bg-gradient-mesh font-inter relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-primary rounded-full opacity-5 blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Modern Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <div className="w-6 h-6 bg-white rounded-sm opacity-90"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Vocalize
              </h1>
            </div>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Experience the future of communication with real-time American Sign Language translation
            </p>
            <StatusIndicator status={appStatus} />
          </div>

          {/* Main Layout with Glass Morphism */}
          <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
            {/* Camera Panel - Enhanced with glass morphism */}
            <div className="lg:col-span-3 animate-scale-in">
              <div className="bg-gradient-glass backdrop-blur-xl rounded-2xl shadow-glass border border-glass-border/20 overflow-hidden">
                <div className="p-2">
                  <div className="rounded-xl overflow-hidden shadow-camera border border-teal/20">
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

            {/* Translation Panel - Enhanced styling */}
            <div className="lg:col-span-2 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <TranslationPanel
                currentWord={currentWord}
                translatedWords={translatedWords}
                onClear={handleClearTranslation}
              />
            </div>
          </div>

          {/* Modern Footer */}
          <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-glass backdrop-blur-sm rounded-full border border-glass-border/20">
              <div className="w-2 h-2 bg-gradient-primary rounded-full animate-glow-pulse"></div>
              <p className="text-sm text-muted-foreground">
                Empowering communication through technology • Built with accessibility in mind
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;