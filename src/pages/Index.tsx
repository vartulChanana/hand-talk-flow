
import { useState, useEffect, useRef } from 'react';
import { CameraView } from '@/components/CameraView';
import { TranslationPanel } from '@/components/TranslationPanel';
import { ControlBar } from '@/components/ControlBar';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useToast } from '@/hooks/use-toast';
import { User, Menu, Camera, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type AppStatus = 'LOADING' | 'READY' | 'RECOGNIZING' | 'ERROR';

const Index = () => {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [currentWord, setCurrentWord] = useState('');
  const [translatedWords, setTranslatedWords] = useState<string[]>([]);
  const [appStatus, setAppStatus] = useState<AppStatus>('LOADING');
  const [recognizedLetter, setRecognizedLetter] = useState<string>('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const { toast } = useToast();

  // Refs for smooth scrolling
  const demoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

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

  // Navigation functions
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigation = (section: string) => {
    switch (section) {
      case 'home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'demo':
        scrollToSection(demoRef);
        break;
      case 'about':
        scrollToSection(aboutRef);
        break;
      case 'contact':
        scrollToSection(contactRef);
        break;
    }
  };

  // Action button functions
  const handleCameraAction = () => {
    handleCameraToggle();
    scrollToSection(demoRef);
    toast({
      title: isVideoActive ? "Camera Stopped" : "Camera Started",
      description: isVideoActive ? "ASL recognition stopped" : "ASL recognition active",
    });
  };

  const handleTranslationAction = () => {
    scrollToSection(demoRef);
    toast({
      title: "Translation Panel",
      description: "View your translated words and speech output",
    });
  };

  const handleSpeechAction = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    toast({
      title: isSpeechEnabled ? "Speech Disabled" : "Speech Enabled",
      description: isSpeechEnabled ? "Auto-speech is now off" : "Auto-speech is now on",
    });
  };

  // Login function
  const handleLogin = (email: string, password: string) => {
    toast({
      title: "Login Attempted",
      description: `Login with ${email} - Demo mode active`,
    });
    setIsLoginOpen(false);
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
              <button onClick={() => handleNavigation('home')} className="hover:text-white/70 transition-colors">HOME</button>
              <button onClick={() => handleNavigation('demo')} className="hover:text-white/70 transition-colors">DEMO</button>
              <button onClick={() => handleNavigation('about')} className="hover:text-white/70 transition-colors">ABOUT</button>
              <button onClick={() => handleNavigation('contact')} className="hover:text-white/70 transition-colors">CONTACT</button>
            </div>
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <User className="w-4 h-4 mr-2" />
                  LOGIN
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="uppercase tracking-widest">LOGIN</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Access your ASL translation dashboard
                  </DialogDescription>
                </DialogHeader>
                <LoginForm onLogin={handleLogin} />
              </DialogContent>
            </Dialog>
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
              onClick={handleCameraAction}
              variant="outline" 
              size="lg"
              className={`border-white/20 text-white hover:bg-white/10 px-8 py-3 text-sm uppercase tracking-widest transition-all
                ${isVideoActive ? 'bg-green-500/20 border-green-500/50' : ''}`}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isVideoActive ? 'STOP CAMERA' : 'START CAMERA'}
            </Button>
            <Button 
              onClick={handleTranslationAction}
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-sm uppercase tracking-widest"
            >
              VIEW TRANSLATION
            </Button>
            <Button 
              onClick={handleSpeechAction}
              variant="outline" 
              size="lg"
              className={`border-white/20 text-white hover:bg-white/10 px-8 py-3 text-sm uppercase tracking-widest transition-all
                ${isSpeechEnabled ? 'bg-blue-500/20 border-blue-500/50' : 'bg-red-500/20 border-red-500/50'}`}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {isSpeechEnabled ? 'SPEECH ON' : 'SPEECH OFF'}
            </Button>
          </div>

          {/* Main Content Grid */}
          <div ref={demoRef} className="grid xl:grid-cols-3 gap-8 max-w-7xl mx-auto text-left">
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

          {/* About Section */}
          <div ref={aboutRef} className="max-w-4xl mx-auto text-center mt-32 mb-32">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">ABOUT VOCALIZE</h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              Vocalize uses advanced AI and computer vision to translate American Sign Language in real-time. 
              Our system recognizes hand gestures, converts them to text, and provides speech synthesis for seamless communication.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold uppercase tracking-wide mb-4">REAL-TIME</h3>
                <p className="text-white/60">Instant ASL recognition and translation</p>
              </div>
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold uppercase tracking-wide mb-4">ACCURATE</h3>
                <p className="text-white/60">Advanced AI models for precise detection</p>
              </div>
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold uppercase tracking-wide mb-4">ACCESSIBLE</h3>
                <p className="text-white/60">Breaking communication barriers</p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div ref={contactRef} className="max-w-4xl mx-auto text-center mb-32">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">GET IN TOUCH</h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              Have questions about Vocalize? Want to contribute to accessibility technology? We'd love to hear from you.
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-12 py-4 text-sm uppercase tracking-widest"
              onClick={() => toast({
                title: "Contact Us",
                description: "Email: hello@vocalize.ai | Phone: +1-555-VOCALIZE"
              })}
            >
              CONTACT US
            </Button>
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

// Login Form Component
const LoginForm = ({ onLogin }: { onLogin: (email: string, password: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-white uppercase tracking-widest text-xs">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/5 border-white/20 text-white mt-2"
          placeholder="your@email.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-white uppercase tracking-widest text-xs">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/5 border-white/20 text-white mt-2"
          placeholder="••••••••"
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-white text-black hover:bg-white/90 uppercase tracking-widest"
      >
        LOGIN
      </Button>
    </form>
  );
};

export default Index;
