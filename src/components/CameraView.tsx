import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

// Add MediaPipe script loading
const loadMediaPipe = () => {
  return new Promise((resolve, reject) => {
    if ((window as any).Hands) {
      resolve((window as any).Hands);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
    script.onload = () => {
      if ((window as any).Hands) {
        resolve((window as any).Hands);
      } else {
        reject(new Error('MediaPipe Hands not loaded'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

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
  const [hands, setHands] = useState<any | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [lastRecognizedLetter, setLastRecognizedLetter] = useState<string | null>(null);

  // Initialize MediaPipe Hands with script loading
  useEffect(() => {
    if (!isActive) return;

    const initializeHands = async () => {
      try {
        // Load MediaPipe from CDN
        const Hands = await loadMediaPipe();
        
        const handsInstance = new (Hands as any)({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.3,
        });

        handsInstance.onResults((results: any) => {
          const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
          setHandDetected(hasHands);
          
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size to match video dimensions
            const videoRect = videoRef.current.getBoundingClientRect();
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks && showLandmarks) {
              for (const landmarks of results.multiHandLandmarks) {
                // Draw landmarks with enhanced visibility
                ctx.fillStyle = '#14B8A6'; // teal-500
                ctx.strokeStyle = '#14B8A6';
                ctx.lineWidth = 3;

                // Draw hand landmarks
                landmarks.forEach((landmark: any, index: number) => {
                  const x = landmark.x * canvas.width;
                  const y = landmark.y * canvas.height;
                  
                  ctx.beginPath();
                  ctx.arc(x, y, 6, 0, 2 * Math.PI);
                  ctx.fill();
                  
                  // Draw landmark number for key points
                  if ([0, 4, 8, 12, 16, 20].includes(index)) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText(index.toString(), x + 8, y - 8);
                    ctx.fillStyle = '#14B8A6';
                  }
                });

                // Draw hand connections
                const connections = [
                  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                  [0, 5], [5, 6], [6, 7], [7, 8], // Index
                  [0, 9], [9, 10], [10, 11], [11, 12], // Middle  
                  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                  [5, 9], [9, 13], [13, 17] // Palm
                ];

                ctx.globalAlpha = 0.8;
                ctx.lineWidth = 2;
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

                // Enhanced gesture recognition - only trigger on sign change
                const recognizedGesture = recognizeGesture(landmarks);
                
                // Only recognize when the sign changes (different from last recognized)
                if (recognizedGesture && recognizedGesture !== lastRecognizedLetter) {
                  onLetterRecognized(recognizedGesture);
                  setLastRecognizedLetter(recognizedGesture);
                } else if (!recognizedGesture) {
                  // Reset when no gesture is detected, allowing the same letter to be recognized again
                  setLastRecognizedLetter(null);
                }
              }
            }
          }
        });

        setHands(handsInstance);
        console.log('MediaPipe Hands initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MediaPipe Hands:', error);
        setHandDetected(false);
      }
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

  // Enhanced ASL gesture recognition function
  const recognizeGesture = (landmarks: any[]): string | null => {
    if (!landmarks || landmarks.length === 0) return null;

    // Get key landmarks for gesture recognition
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const wrist = landmarks[0];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];

    // Calculate if fingers are extended (tip higher than pip joint)
    const fingersUp = [
      thumbTip.x > thumbIP.x, // Thumb (horizontal check)
      indexTip.y < indexPIP.y, // Index
      middleTip.y < middlePIP.y, // Middle
      ringTip.y < ringPIP.y, // Ring
      pinkyTip.y < pinkyPIP.y  // Pinky
    ];

    const upCount = fingersUp.filter(Boolean).length;

    // Enhanced ASL gesture mapping with better accuracy
    if (upCount === 0) return 'A'; // Closed fist
    
    if (upCount === 1) {
      if (fingersUp[1]) return 'D'; // Index finger pointing up
      if (fingersUp[4]) return 'I'; // Pinky up
    }
    
    if (upCount === 2) {
      if (fingersUp[1] && fingersUp[2]) return 'V'; // Peace sign
      if (fingersUp[1] && fingersUp[4]) return 'Y'; // Index and pinky
    }
    
    if (upCount === 3) {
      if (fingersUp[1] && fingersUp[2] && fingersUp[3]) return 'W'; // Three fingers
    }
    
    if (upCount === 4) {
      if (!fingersUp[0]) return 'B'; // Four fingers (no thumb)
    }
    
    if (upCount === 5) return 'B'; // Open hand
    
    // Check for specific gestures
    // L sign: thumb and index extended, others folded
    if (fingersUp[0] && fingersUp[1] && !fingersUp[2] && !fingersUp[3] && !fingersUp[4]) {
      const angle = Math.atan2(indexTip.y - thumbTip.y, indexTip.x - thumbTip.x);
      if (Math.abs(angle - Math.PI/2) < 0.5) return 'L';
    }
    
    // O sign: fingers curved in circle shape
    if (upCount === 0 && thumbTip.y < indexMCP.y && thumbTip.y < middleMCP.y) {
      return 'O';
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
    <div className="relative aspect-video bg-gradient-to-br from-darker-panel to-dark-panel overflow-hidden rounded-xl">
      {isActive ? (
        <>
          {/* Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          
          {/* Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
            style={{ 
              opacity: showLandmarks ? 0.9 : 0
            }}
          />
          
          {/* Modern Recognition Overlay */}
          {recognizedLetter && (
            <div className="absolute top-6 left-6 animate-fade-in">
              <div className="bg-gradient-glass backdrop-blur-xl border border-teal/30 px-6 py-3 rounded-2xl shadow-glass">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-primary rounded-full animate-pulse"></div>
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