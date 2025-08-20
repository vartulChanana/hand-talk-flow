import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface CameraViewProps {
  isActive: boolean;
  showLandmarks: boolean;
  onLetterRecognized: (letter: string) => void;
  onWordComplete: () => void;
  recognizedLetter: string;
}

export const CameraView = ({ 
  isActive, 
  showLandmarks, 
  onLetterRecognized, 
  onWordComplete,
  recognizedLetter 
}: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Simulate ASL recognition with demo letters
  useEffect(() => {
    if (isActive && recognizedLetter) {
      const letters = ['H', 'E', 'L', 'L', 'O'];
      let index = 0;

      const interval = setInterval(() => {
        if (index < letters.length) {
          onLetterRecognized(letters[index]);
          index++;
        } else {
          onWordComplete();
          clearInterval(interval);
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isActive, onLetterRecognized, onWordComplete]);

  useEffect(() => {
    const startCamera = async () => {
      if (isActive) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: 640, 
              height: 480,
              facingMode: 'user'
            }
          });
          
          setStream(mediaStream);
          setHasPermission(true);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (error) {
          console.error('Camera access denied:', error);
          setHasPermission(false);
        }
      } else {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  // Draw hand landmarks simulation
  useEffect(() => {
    if (isActive && showLandmarks && canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const drawLandmarks = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Simulate hand landmarks for demo
          if (recognizedLetter) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Draw simulated hand landmarks
            ctx.fillStyle = '#20C997';
            ctx.strokeStyle = '#20C997';
            ctx.lineWidth = 2;
            
            // Draw 21 landmark points
            for (let i = 0; i < 21; i++) {
              const angle = (i / 21) * Math.PI * 2;
              const radius = 50 + Math.sin(i * 0.5) * 20;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, 2 * Math.PI);
              ctx.fill();
            }
            
            // Draw connections
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            for (let i = 0; i < 20; i++) {
              const angle1 = (i / 21) * Math.PI * 2;
              const angle2 = ((i + 1) / 21) * Math.PI * 2;
              const radius = 50 + Math.sin(i * 0.5) * 20;
              const x1 = centerX + Math.cos(angle1) * radius;
              const y1 = centerY + Math.sin(angle1) * radius;
              const x2 = centerX + Math.cos(angle2) * (50 + Math.sin((i + 1) * 0.5) * 20);
              const y2 = centerY + Math.sin(angle2) * (50 + Math.sin((i + 1) * 0.5) * 20);
              
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          
          requestAnimationFrame(drawLandmarks);
        };
        
        drawLandmarks();
      }
    }
  }, [isActive, showLandmarks, recognizedLetter]);

  if (hasPermission === false) {
    return (
      <div className="aspect-video bg-darker-panel flex items-center justify-center">
        <div className="text-center">
          <CameraOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Camera Access Denied</h3>
          <p className="text-muted-foreground">
            Please enable camera access to use ASL recognition
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-darker-panel overflow-hidden">
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
            onLoadedMetadata={() => {
              if (canvasRef.current && videoRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1]"
            style={{ display: showLandmarks ? 'block' : 'none' }}
          />
          
          {/* Recognition Overlay */}
          {recognizedLetter && (
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-2xl shadow-glow">
              {recognizedLetter}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Camera Ready</h3>
            <p className="text-muted-foreground">
              Click "Start Camera" to begin ASL recognition
            </p>
          </div>
        </div>
      )}
    </div>
  );
};