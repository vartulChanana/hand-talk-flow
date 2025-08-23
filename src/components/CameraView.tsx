import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Hands, Results } from '@mediapipe/hands';

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
  const [hands, setHands] = useState<Hands | null>(null);
  const [handDetected, setHandDetected] = useState(false);

  // Initialize MediaPipe Hands
  useEffect(() => {
    if (!isActive) return;

    const initializeHands = async () => {
      const handsInstance = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      handsInstance.onResults((results: Results) => {
        setHandDetected(results.multiHandLandmarks && results.multiHandLandmarks.length > 0);
        
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Set canvas size to match video
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks && showLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
              // Draw landmarks
              ctx.fillStyle = '#20C997';
              ctx.strokeStyle = '#20C997';
              ctx.lineWidth = 2;

              // Draw hand landmarks
              landmarks.forEach((landmark, index) => {
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw landmark number
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px Arial';
                ctx.fillText(index.toString(), x + 5, y - 5);
                ctx.fillStyle = '#20C997';
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
                const startX = landmarks[start].x * canvas.width;
                const startY = landmarks[start].y * canvas.height;
                const endX = landmarks[end].x * canvas.width;
                const endY = landmarks[end].y * canvas.height;
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
              });
              ctx.stroke();
              ctx.globalAlpha = 1;

              // Simple gesture recognition
              const recognizedGesture = recognizeGesture(landmarks);
              if (recognizedGesture) {
                onLetterRecognized(recognizedGesture);
              }
            }
          }
        }
      });

      setHands(handsInstance);
    };

    initializeHands();

    return () => {
      if (hands) {
        hands.close();
      }
    };
  }, [isActive, showLandmarks]);

  // Process video frames
  useEffect(() => {
    if (!hands || !isActive || !videoRef.current) return;

    const processFrame = async () => {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        await hands.send({ image: videoRef.current });
      }
      requestAnimationFrame(processFrame);
    };

    const startProcessing = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        processFrame();
      } else {
        videoRef.current?.addEventListener('loadeddata', processFrame, { once: true });
      }
    };

    startProcessing();
  }, [hands, isActive]);

  // Real-time gesture recognition function
  const recognizeGesture = (landmarks: any[]): string | null => {
    if (!landmarks || landmarks.length === 0) return null;

    // Get key landmarks for gesture recognition
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];

    // Simple gesture recognition based on finger positions
    const fingersUp = [
      thumbTip.y < landmarks[3].y, // Thumb
      indexTip.y < landmarks[6].y, // Index
      middleTip.y < landmarks[10].y, // Middle
      ringTip.y < landmarks[14].y, // Ring
      pinkyTip.y < landmarks[18].y  // Pinky
    ];

    const upCount = fingersUp.filter(Boolean).length;

    // Basic gesture mapping
    if (upCount === 0) return 'A'; // Fist
    if (upCount === 1 && fingersUp[1]) return 'D'; // Index finger up
    if (upCount === 2 && fingersUp[1] && fingersUp[2]) return 'V'; // Peace sign
    if (upCount === 5) return 'B'; // Open hand
    if (upCount === 3 && fingersUp[1] && fingersUp[2] && fingersUp[3]) return 'W';

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
    <div className="relative aspect-video bg-gradient-to-br from-darker-panel to-dark-panel overflow-hidden">
      {isActive ? (
        <>
          {/* Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1] transition-all duration-500"
            style={{ display: 'block' }}
          />
          
          {/* Enhanced Canvas with better integration */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none transition-all duration-500"
            style={{ 
              display: 'block',
              opacity: showLandmarks ? 0.9 : 0,
              filter: showLandmarks ? 'drop-shadow(0 0 8px hsl(var(--teal) / 0.5))' : 'none'
            }}
          />
          
          {/* Modern Recognition Overlay */}
          {recognizedLetter && (
            <div className="absolute top-6 left-6 animate-scale-in">
              <div className="bg-gradient-glass backdrop-blur-xl border border-teal/30 px-6 py-3 rounded-2xl shadow-glass">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-primary rounded-full animate-glow-pulse"></div>
                  <span className="font-bold text-3xl bg-gradient-primary bg-clip-text text-transparent">
                    {recognizedLetter}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Hand Detection Status */}
          <div className="absolute top-6 right-6 animate-fade-in">
            <div className="bg-gradient-glass backdrop-blur-sm border border-teal/20 px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${handDetected ? 'bg-teal' : 'bg-muted-foreground'}`}></div>
                <span className={`text-xs font-medium ${handDetected ? 'text-teal' : 'text-muted-foreground'}`}>
                  {handDetected ? 'Hand Detected' : 'No Hand'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Corner Indicators */}
          <div className="absolute inset-4 pointer-events-none">
            <div className="w-full h-full relative">
              {/* Top corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-teal/40 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-teal/40 rounded-tr-lg"></div>
              {/* Bottom corners */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-teal/40 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-teal/40 rounded-br-lg"></div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full animate-fade-in">
          <div className="text-center p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-glass backdrop-blur-sm rounded-2xl border border-glass-border/20 mb-6 animate-float">
              <Camera className="w-10 h-10 text-teal" />
            </div>
            <h3 className="text-xl font-semibold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Camera Ready
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Click "Start Camera" to begin real-time ASL recognition with advanced hand tracking
            </p>
          </div>
        </div>
      )}
    </div>
  );
};