
import { Camera, CameraOff, Eye, EyeOff, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ControlBarProps {
  isVideoActive: boolean;
  showLandmarks: boolean;
  onCameraToggle: () => void;
  onLandmarksToggle: () => void;
  disabled?: boolean;
}

export const ControlBar = ({
  isVideoActive,
  showLandmarks,
  onCameraToggle,
  onLandmarksToggle,
  disabled = false
}: ControlBarProps) => {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700/50 p-6">
      <div className="flex items-center justify-between">
        {/* Camera Control */}
        <Button
          onClick={onCameraToggle}
          disabled={disabled}
          variant={isVideoActive ? "destructive" : "default"}
          size="lg"
          className={`
            min-w-[160px] h-12 font-semibold transition-all duration-300 hover:scale-105
            ${isVideoActive 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25'
            }
          `}
        >
          {isVideoActive ? (
            <>
              <Square className="w-5 h-5 mr-2 fill-current" />
              Stop Camera
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2 fill-current" />
              Start Camera
            </>
          )}
        </Button>

        {/* Landmark Toggle */}
        <div className="flex items-center gap-4">
          <Label htmlFor="landmarks-toggle" className="text-sm font-semibold text-slate-200">
            Hand Landmarks
          </Label>
          <div className="flex items-center gap-3 bg-slate-700/50 rounded-full px-4 py-2">
            <EyeOff className="w-4 h-4 text-slate-400" />
            <Switch
              id="landmarks-toggle"
              checked={showLandmarks}
              onCheckedChange={onLandmarksToggle}
              disabled={disabled || !isVideoActive}
              className="data-[state=checked]:bg-purple-500"
            />
            <Eye className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 bg-slate-700/30 rounded-full px-4 py-2 inline-block">
          {isVideoActive 
            ? "✋ Hold your hand steady in front of the camera for ASL recognition"
            : "🎥 Enable camera access to start recognizing American Sign Language"
          }
        </p>
      </div>
    </div>
  );
};
