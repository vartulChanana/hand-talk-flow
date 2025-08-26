
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
    <div className="border-t border-white/10 p-6 bg-black">
      <div className="flex items-center justify-between">
        {/* Camera Control */}
        <Button
          onClick={onCameraToggle}
          disabled={disabled}
          variant="outline"
          size="lg"
          className={`
            min-w-[160px] px-8 py-3 font-semibold border-white/20 text-white hover:bg-white/10 text-sm uppercase tracking-widest
            ${isVideoActive ? 'bg-red-500/20 border-red-500/50' : ''}
          `}
        >
          {isVideoActive ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              STOP CAMERA
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              START CAMERA
            </>
          )}
        </Button>

        {/* Landmark Toggle */}
        <div className="flex items-center gap-4">
          <Label htmlFor="landmarks-toggle" className="text-sm font-semibold uppercase tracking-widest">
            LANDMARKS
          </Label>
          <div className="flex items-center gap-3 border border-white/20 rounded px-4 py-2">
            <EyeOff className="w-4 h-4" />
            <Switch
              id="landmarks-toggle"
              checked={showLandmarks}
              onCheckedChange={onLandmarksToggle}
              disabled={disabled || !isVideoActive}
              className="data-[state=checked]:bg-white"
            />
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-white/50 border border-white/10 rounded px-4 py-2 inline-block uppercase tracking-wider">
          {isVideoActive 
            ? "Hold your hand steady in front of the camera"
            : "Enable camera access to start recognition"
          }
        </p>
      </div>
    </div>
  );
};
