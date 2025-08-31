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
  const [gestureStabilityCount, setGestureStabilityCount] = useState(0);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const STABILITY_THRESHOLD = 3; // Require 3 consecutive frames of same gesture

  const resetTimer = useRef<NodeJS.Timeout>();

  // Function to reset last recognized letter after delay
  const resetLastRecognized = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setLastRecognizedLetter(null);
      console.log('Reset last recognized letter');
    }, 2000);
  };

  // Initialize MediaPipe Hands with proper cleanup
  useEffect(() => {
    if (!isActive) return;

    let handsInstance: any = null;
    let isInitialized = false;

    const initializeHands = async () => {
      try {
        console.log('Initializing MediaPipe Hands...');
        const Hands = await loadMediaPipe();
        
        handsInstance = new (Hands as any)({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        await handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        handsInstance.onResults((results: any) => {
          if (!isInitialized) return;
          
          const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
          setHandDetected(hasHands);
          
          if (hasHands) {
            console.log('Hand detected with', results.multiHandLandmarks[0].length, 'landmarks');
          }
          
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks && showLandmarks) {
              for (const landmarks of results.multiHandLandmarks) {
                // Draw landmarks
                ctx.fillStyle = '#14B8A6';
                ctx.strokeStyle = '#14B8A6';
                ctx.lineWidth = 3;

                landmarks.forEach((landmark: any, index: number) => {
                  const x = landmark.x * canvas.width;
                  const y = landmark.y * canvas.height;
                  
                  ctx.beginPath();
                  ctx.arc(x, y, 6, 0, 2 * Math.PI);
                  ctx.fill();
                  
                  if ([0, 4, 8, 12, 16, 20].includes(index)) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText(index.toString(), x + 8, y - 8);
                    ctx.fillStyle = '#14B8A6';
                  }
                });

                // Draw connections
                const connections = [
                  [0, 1], [1, 2], [2, 3], [3, 4],
                  [0, 5], [5, 6], [6, 7], [7, 8],
                  [0, 9], [9, 10], [10, 11], [11, 12],
                  [0, 13], [13, 14], [14, 15], [15, 16],
                  [0, 17], [17, 18], [18, 19], [19, 20],
                  [5, 9], [9, 13], [13, 17]
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

                // Gesture recognition
                const recognizedGesture = recognizeGesture(landmarks);
                
                if (recognizedGesture) {
                  if (recognizedGesture === currentGesture) {
                    const newCount = gestureStabilityCount + 1;
                    setGestureStabilityCount(newCount);
                    
                    if (newCount >= STABILITY_THRESHOLD && recognizedGesture !== lastRecognizedLetter) {
                      console.log('Stable gesture detected:', recognizedGesture);
                      onLetterRecognized(recognizedGesture);
                      setLastRecognizedLetter(recognizedGesture);
                    }
                  } else {
                    console.log('New gesture detected:', recognizedGesture);
                    setCurrentGesture(recognizedGesture);
                    setGestureStabilityCount(1);
                  }
                } else {
                  if (currentGesture) {
                    setCurrentGesture(null);
                    setGestureStabilityCount(0);
                    resetLastRecognized();
                  }
                }
              }
            }
          }
        });

        await handsInstance.initialize();
        setHands(handsInstance);
        isInitialized = true;
        console.log('MediaPipe Hands initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MediaPipe Hands:', error);
        setHandDetected(false);
      }
    };

    initializeHands();

    return () => {
      isInitialized = false;
      if (handsInstance) {
        try {
          handsInstance.close();
        } catch (e) {
          console.log('Hands instance already closed');
        }
      }
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, [isActive, showLandmarks]);

  // Simple frame processing
  useEffect(() => {
    if (!hands || !isActive || !videoRef.current) return;

    let intervalId: NodeJS.Timeout;

    const processFrame = async () => {
      if (!hands || !videoRef.current) return;
      
      try {
        if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
          await hands.send({ image: videoRef.current });
        }
      } catch (error) {
        console.error('Frame processing error:', error);
      }
    };

    // Process at 15 FPS
    intervalId = setInterval(processFrame, 67);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [hands, isActive]);

  // Comprehensive ASL gesture recognition for all 26 letters
  const recognizeGesture = (landmarks: any[]): string | null => {
    if (!landmarks || landmarks.length === 0) return null;

    // Get key landmarks for gesture recognition
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    const thumbCMC = landmarks[1];
    const indexTip = landmarks[8];
    const indexDIP = landmarks[7];
    const indexPIP = landmarks[6];
    const indexMCP = landmarks[5];
    const middleTip = landmarks[12];
    const middleDIP = landmarks[11];
    const middlePIP = landmarks[10];
    const middleMCP = landmarks[9];
    const ringTip = landmarks[16];
    const ringDIP = landmarks[15];
    const ringPIP = landmarks[14];
    const ringMCP = landmarks[13];
    const pinkyTip = landmarks[20];
    const pinkyDIP = landmarks[19];
    const pinkyPIP = landmarks[18];
    const pinkyMCP = landmarks[17];
    const wrist = landmarks[0];

    // Helper function to check if finger is extended
    const isFingerExtended = (tip: any, pip: any, mcp: any): boolean => {
      return tip.y < pip.y && pip.y < mcp.y;
    };

    // Helper function to check if finger is bent/curled
    const isFingerBent = (tip: any, pip: any, mcp: any): boolean => {
      return tip.y > pip.y;
    };

    // Calculate finger states more precisely
    const isThumbExtended = thumbTip.x > thumbIP.x && thumbTip.x > thumbMCP.x; // For right hand
    const isIndexExtended = isFingerExtended(indexTip, indexPIP, indexMCP);
    const isMiddleExtended = isFingerExtended(middleTip, middlePIP, middleMCP);
    const isRingExtended = isFingerExtended(ringTip, ringPIP, ringMCP);
    const isPinkyExtended = isFingerExtended(pinkyTip, pinkyPIP, pinkyMCP);

    // Calculate distances for precise recognition
    const thumbIndexDist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
    const thumbMiddleDist = Math.sqrt(Math.pow(thumbTip.x - middleTip.x, 2) + Math.pow(thumbTip.y - middleTip.y, 2));
    const thumbRingDist = Math.sqrt(Math.pow(thumbTip.x - ringTip.x, 2) + Math.pow(thumbTip.y - ringTip.y, 2));
    const indexMiddleDist = Math.sqrt(Math.pow(indexTip.x - middleTip.x, 2) + Math.pow(indexTip.y - middleTip.y, 2));

    // Count extended fingers
    const extendedFingers = [isThumbExtended, isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended];
    const extendedCount = extendedFingers.filter(Boolean).length;

    // A - Closed fist with thumb beside fingers
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && 
        isFingerBent(thumbTip, thumbIP, thumbMCP) && thumbTip.y > thumbMCP.y) {
      return 'A';
    }

    // B - Four fingers extended, thumb tucked across palm
    if (!isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended &&
        thumbTip.y > thumbMCP.y && thumbTip.x < indexMCP.x) {
      return 'B';
    }

    // C - Curved hand shape (like holding a small cup)
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        thumbIndexDist > 0.06 && thumbIndexDist < 0.12 &&
        indexTip.y > indexPIP.y && indexTip.y < indexMCP.y) {
      return 'C';
    }

    // D - Index finger extended, thumb touching middle finger
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        thumbMiddleDist < 0.06 && thumbTip.y < middleTip.y) {
      return 'D';
    }

    // E - All fingers curled down into palm
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        isFingerBent(indexTip, indexPIP, indexMCP) && 
        isFingerBent(middleTip, middlePIP, middleMCP) &&
        isFingerBent(ringTip, ringPIP, ringMCP) &&
        isFingerBent(pinkyTip, pinkyPIP, pinkyMCP) &&
        thumbTip.x > indexTip.x) {
      return 'E';
    }

    // F - Thumb and index forming circle, other fingers extended
    if (thumbIndexDist < 0.05 && isMiddleExtended && isRingExtended && isPinkyExtended &&
        !isIndexExtended) {
      return 'F';
    }

    // G - Index finger pointing horizontally
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        !isThumbExtended && Math.abs(indexTip.y - indexMCP.y) < 0.04 &&
        indexTip.x > indexMCP.x) {
      return 'G';
    }

    // H - Index and middle fingers extended horizontally together
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        !isThumbExtended && Math.abs(indexTip.y - indexMCP.y) < 0.04 &&
        Math.abs(middleTip.y - middleMCP.y) < 0.04 &&
        indexMiddleDist < 0.04) {
      return 'H';
    }

    // I - Only pinky extended
    if (!isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
      return 'I';
    }

    // J - Pinky extended with thumb extended (simplified J motion)
    if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended &&
        pinkyTip.x < pinkyMCP.x) {
      return 'J';
    }

    // K - Index and middle extended in V, thumb touching middle finger
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        thumbMiddleDist < 0.06 && indexMiddleDist > 0.04) {
      return 'K';
    }

    // L - Thumb and index forming 90-degree angle
    if (isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      const thumbIndexAngle = Math.atan2(indexTip.y - thumbTip.y, indexTip.x - thumbTip.x);
      if (Math.abs(thumbIndexAngle) > Math.PI/4 && Math.abs(thumbIndexAngle) < 3*Math.PI/4) {
        return 'L';
      }
    }

    // M - Thumb under first three fingers (index, middle, ring)
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended &&
        thumbTip.y > indexMCP.y && thumbTip.y > middleMCP.y && thumbTip.y > ringMCP.y) {
      return 'M';
    }

    // N - Thumb under first two fingers (index, middle)
    if (!isIndexExtended && !isMiddleExtended && isRingExtended && isPinkyExtended &&
        thumbTip.y > indexMCP.y && thumbTip.y > middleMCP.y) {
      return 'N';
    }

    // O - All fingers forming circle with thumb
    if (thumbIndexDist < 0.05 && thumbMiddleDist < 0.08 &&
        !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        indexTip.y > indexPIP.y && middleTip.y > middlePIP.y) {
      return 'O';
    }

    // P - Index finger pointing down, middle finger horizontal
    if (!isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        indexTip.y > indexMCP.y && Math.abs(middleTip.y - middleMCP.y) < 0.04 &&
        thumbMiddleDist < 0.06) {
      return 'P';
    }

    // Q - Thumb and index pointing down
    if (isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        thumbTip.y > thumbMCP.y && indexTip.y > indexMCP.y &&
        thumbIndexDist > 0.03) {
      return 'Q';
    }

    // R - Index and middle fingers crossed
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        !isThumbExtended && indexMiddleDist < 0.03 &&
        Math.abs(indexTip.x - middleTip.x) < 0.02) {
      return 'R';
    }

    // S - Closed fist with thumb over fingers
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        isFingerBent(indexTip, indexPIP, indexMCP) &&
        thumbTip.y < indexMCP.y && thumbTip.y < middleMCP.y &&
        thumbTip.x > indexTip.x && thumbTip.x > middleTip.x) {
      return 'S';
    }

    // T - Thumb between index and middle finger
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        thumbTip.y < indexTip.y && thumbTip.y < middleTip.y &&
        thumbTip.x > Math.min(indexTip.x, middleTip.x) && 
        thumbTip.x < Math.max(indexTip.x, middleTip.x)) {
      return 'T';
    }

    // U - Index and middle fingers extended upward together
    if (!isThumbExtended && isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        indexMiddleDist < 0.03 && indexTip.y < indexMCP.y && middleTip.y < middleMCP.y) {
      return 'U';
    }

    // V - Index and middle fingers in V shape
    if (!isThumbExtended && isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        indexMiddleDist > 0.04 && indexTip.y < indexMCP.y && middleTip.y < middleMCP.y) {
      return 'V';
    }

    // W - Index, middle, and ring fingers extended in W shape
    if (!isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended &&
        indexTip.y < indexMCP.y && middleTip.y < middleMCP.y && ringTip.y < ringMCP.y) {
      return 'W';
    }

    // X - Index finger bent at second joint (hook shape)
    if (!isThumbExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        indexTip.y > indexPIP.y && indexDIP.y < indexPIP.y && indexPIP.y < indexMCP.y) {
      return 'X';
    }

    // Y - Thumb and pinky extended (shaka/hang loose)
    if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended &&
        thumbTip.y < thumbMCP.y && pinkyTip.y < pinkyMCP.y) {
      return 'Y';
    }

    // Z - Index finger extended horizontally making Z motion (simplified to horizontal pointing)
    if (!isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended &&
        Math.abs(indexTip.y - indexMCP.y) < 0.04 && indexTip.x > indexMCP.x + 0.02) {
      return 'Z';
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