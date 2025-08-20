import { Camera, CameraOff, Eye, EyeOff } from 'lucide-react';
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
    <div className="bg-secondary border-t border-border p-4">
      <div className="flex items-center justify-between">
        {/* Camera Control */}
        <Button
          onClick={onCameraToggle}
          disabled={disabled}
          variant={isVideoActive ? "destructive" : "default"}
          size="lg"
          className="min-w-[140px] transition-bounce hover:scale-105"
        >
          {isVideoActive ? (
            <>
              <CameraOff className="w-5 h-5 mr-2" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </>
          )}
        </Button>

        {/* Landmark Toggle */}
        <div className="flex items-center space-x-3">
          <Label htmlFor="landmarks-toggle" className="text-sm font-medium">
            Hand Landmarks
          </Label>
          <div className="flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-muted-foreground" />
            <Switch
              id="landmarks-toggle"
              checked={showLandmarks}
              onCheckedChange={onLandmarksToggle}
              disabled={disabled || !isVideoActive}
            />
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        <p>
          {isVideoActive 
            ? "Hold your hand steady in front of the camera to recognize ASL letters"
            : "Enable camera access to start recognizing American Sign Language"
          }
        </p>
      </div>
    </div>
  );
};