import { Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

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
    <Card className="h-full bg-gradient-panel border-border shadow-card">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Translation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="hover:bg-destructive hover:text-destructive-foreground transition-smooth"
            disabled={!currentWord && translatedWords.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Word Being Formed */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Current Word
          </h3>
          <div className="bg-secondary rounded-lg px-4 py-3 min-h-[60px] flex items-center">
            <span className="text-2xl font-bold text-primary">
              {currentWord || (
                <span className="text-muted-foreground">
                  Start signing...
                </span>
              )}
            </span>
            {currentWord && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speakWord(currentWord)}
                className="ml-auto hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Translated Words History */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Translated Words ({translatedWords.length})
          </h3>
          <ScrollArea className="h-[300px] bg-secondary rounded-lg">
            <div className="p-4 space-y-2">
              {translatedWords.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No words translated yet</p>
                  <p className="text-sm mt-1">
                    Completed words will appear here
                  </p>
                </div>
              ) : (
                translatedWords.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-card rounded-lg px-3 py-2 hover:bg-accent transition-smooth group"
                  >
                    <span className="font-medium">{word}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakWord(word)}
                      className="opacity-0 group-hover:opacity-100 transition-smooth hover:bg-primary hover:text-primary-foreground"
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Info */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>Words are automatically spoken when completed</p>
        </div>
      </div>
    </Card>
  );
};