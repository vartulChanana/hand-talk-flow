
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
    <div className="h-full bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Translation</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 rounded-xl"
            disabled={!currentWord && translatedWords.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Word Being Formed */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
              Current Word
            </h3>
          </div>
          <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl px-6 py-4 min-h-[80px] flex items-center border border-slate-600/30">
            <span className="text-3xl font-bold text-white">
              {currentWord || (
                <span className="text-slate-400 text-xl">
                  Start signing...
                </span>
              )}
            </span>
            {currentWord && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speakWord(currentWord)}
                className="ml-auto hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 rounded-xl"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Translated Words History */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              History
            </h3>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
              {translatedWords.length} words
            </span>
          </div>
          
          <ScrollArea className="h-[320px] bg-slate-700/30 rounded-2xl border border-slate-600/30">
            <div className="p-4 space-y-3">
              {translatedWords.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No words yet</p>
                  <p className="text-sm mt-1 opacity-75">
                    Completed words will appear here
                  </p>
                </div>
              ) : (
                translatedWords.map((word, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between bg-slate-600/30 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-slate-600/50 transition-all duration-300 border border-slate-500/20"
                  >
                    <span className="font-semibold text-white">{word}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakWord(word)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg"
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
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 bg-slate-700/30 rounded-full px-4 py-2 inline-block">
            🔊 Words are automatically spoken when completed
          </p>
        </div>
      </div>
    </div>
  );
};
