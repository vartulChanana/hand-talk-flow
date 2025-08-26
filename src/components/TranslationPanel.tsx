
import { Trash2, Volume2, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranslationPanelProps {
  currentWord: string;
  translatedWords: string[];
  onClear: () => void;
}

export const TranslationPanel = ({ 
  currentWord, 
  translatedWords, 
  onClear 
}: TranslationPanelProps) => {
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-full border border-white/10 rounded-lg overflow-hidden bg-black">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold uppercase tracking-widest">TRANSLATION</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="border-white/20 text-white hover:bg-white/10"
            disabled={!currentWord && translatedWords.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Word Being Formed */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 text-white/70">
            CURRENT WORD
          </h3>
          <div className="border border-white/10 rounded px-6 py-4 min-h-[80px] flex items-center">
            <span className="text-3xl font-bold">
              {currentWord || (
                <span className="text-white/50 text-xl">
                  START SIGNING...
                </span>
              )}
            </span>
            {currentWord && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakWord(currentWord)}
                className="ml-auto border-white/20 text-white hover:bg-white/10"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Translated Words History */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/70">
              HISTORY
            </h3>
            <span className="text-xs text-white/50 border border-white/10 px-3 py-1 rounded">
              {translatedWords.length} WORDS
            </span>
          </div>
          
          <ScrollArea className="h-[320px] border border-white/10 rounded">
            <div className="p-4 space-y-2">
              {translatedWords.length === 0 ? (
                <div className="text-center text-white/50 py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium uppercase tracking-wide">NO WORDS YET</p>
                  <p className="text-sm mt-1 opacity-75">
                    Completed words will appear here
                  </p>
                </div>
              ) : (
                translatedWords.map((word, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between border border-white/10 rounded px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold uppercase tracking-wide">{word}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakWord(word)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity border-white/20 text-white hover:bg-white/10"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/50 border border-white/10 rounded px-4 py-2 inline-block uppercase tracking-wider">
            WORDS ARE AUTOMATICALLY SPOKEN
          </p>
        </div>
      </div>
    </div>
  );
};
