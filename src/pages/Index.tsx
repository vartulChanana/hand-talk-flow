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
    <div className="min-h-screen bg-background font-inter">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Vocalize
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time American Sign Language to Text & Speech
          </p>
          <StatusIndicator status={appStatus} />
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {/* Camera Panel - 60% on desktop */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
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

          {/* Translation Panel - 40% on desktop */}
          <div className="lg:col-span-2">
            <TranslationPanel
              currentWord={currentWord}
              translatedWords={translatedWords}
              onClear={handleClearTranslation}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-muted-foreground">
          <p className="text-sm">
            Empowering communication through technology • Built with accessibility in mind
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;