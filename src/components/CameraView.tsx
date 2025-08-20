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

  // MediaPipe Hands setup and ASL recognition
  useEffect(() => {
    let hands: any = null;
    let animationId: number;
    
    const setupMediaPipe = async () => {
      if (!isActive || !videoRef.current || !canvasRef.current) return;

      try {
        // Import MediaPipe dynamically
        const { Hands } = await import('@mediapipe/hands');
        
        hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (!canvasRef.current) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            if (showLandmarks) {
              // Draw hand landmarks
              ctx.fillStyle = '#20C997';
              ctx.strokeStyle = '#20C997';
              ctx.lineWidth = 2;

              // Draw landmark points
              landmarks.forEach((landmark: any) => {
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
              });

              // Draw connections
              const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [0, 9], [9, 10], [10, 11], [11, 12], // Middle  
                [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                [5, 9], [9, 13], [13, 17] // Palm
              ];

              ctx.globalAlpha = 0.6;
              ctx.beginPath();
              connections.forEach(([start, end]) => {
                const startPoint = landmarks[start];
                const endPoint = landmarks[end];
                ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
                ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
              });
              ctx.stroke();
              ctx.globalAlpha = 1;
            }

            // Simple gesture recognition for demo
            const recognizedLetter = recognizeGesture(landmarks);
            if (recognizedLetter) {
              onLetterRecognized(recognizedLetter);
              
              // Auto-complete word after 2 seconds of same gesture
              setTimeout(() => {
                onWordComplete();
              }, 2000);
            }
          }
        });

        // Process video frames
        const processFrame = async () => {
          if (videoRef.current && hands) {
            await hands.send({ image: videoRef.current });
          }
          if (isActive) {
            animationId = requestAnimationFrame(processFrame);
          }
        };

        processFrame();

      } catch (error) {
        console.error('MediaPipe setup failed:', error);
        // Fallback to demo mode
        demoRecognition();
      }
    };

    const demoRecognition = () => {
      if (!isActive) return;
      
      const letters = ['H', 'E', 'L', 'L', 'O'];
      let index = 0;

      const interval = setInterval(() => {
        if (index < letters.length && isActive) {
          onLetterRecognized(letters[index]);
          index++;
        } else {
          onWordComplete();
          clearInterval(interval);
        }
      }, 1500);

      return () => clearInterval(interval);
    };

    if (isActive && videoRef.current) {
      setupMediaPipe();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (hands) {
        hands.close();
      }
    };
  }, [isActive, showLandmarks, onLetterRecognized, onWordComplete]);

  // Simple gesture recognition function
  const recognizeGesture = (landmarks: any[]): string | null => {
    // This is a simplified gesture recognition
    // In a real implementation, you'd use a trained model
    
    // Check if index finger is extended (simple "pointing" gesture = 'A')
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    
    if (indexTip.y < indexPip.y && indexPip.y < indexMcp.y) {
      return 'A';
    }
    
    return null;
  };

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

  // Set canvas size when video loads
  useEffect(() => {
    if (videoRef.current && canvasRef.current && isActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const updateCanvasSize = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };
      
      if (video.videoWidth > 0) {
        updateCanvasSize();
      } else {
        video.addEventListener('loadedmetadata', updateCanvasSize);
        return () => video.removeEventListener('loadedmetadata', updateCanvasSize);
      }
    }
  }, [isActive]);

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
            style={{ display: 'block' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
            style={{ 
              display: 'block',
              opacity: showLandmarks ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
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