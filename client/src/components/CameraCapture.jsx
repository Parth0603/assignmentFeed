import { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw, Check } from 'lucide-react';

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera. Please allow permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to DataURL, capped at 1280 width handled via video resolution request
    // quality 0.7 
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setCapturedImage(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const usePhoto = () => {
    onCapture(capturedImage);
    stopCamera();
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/50 text-white absolute top-0 w-full z-10">
        <button onClick={() => { stopCamera(); onCancel(); }} className="p-2">
          <X size={28} />
        </button>
        <span className="font-semibold">Take a Photo</span>
        <div className="w-11"></div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error ? (
          <div className="text-white text-center p-6 bg-red-500/20 rounded-xl">{error}</div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full object-contain max-h-screen" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full object-cover h-full"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          />
        )}
        
        {/* Hidden Canvas for drawing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls */}
      <div className="bg-black text-white h-32 flex items-center justify-center px-8 relative pb-safe">
        {!error && !capturedImage && (
          <button 
            onClick={capturePhoto}
            className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center border-4 border-white backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
        )}

        {capturedImage && (
          <div className="w-full flex justify-between items-center px-4 max-w-sm mx-auto">
            <button onClick={retakePhoto} className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white">
                <RefreshCcw size={20} />
              </div>
              <span className="text-sm">Retake</span>
            </button>

            <button onClick={usePhoto} className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                <Check size={28} />
              </div>
              <span className="text-sm">Use Photo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
