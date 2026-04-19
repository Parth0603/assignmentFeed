import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ImagePreviewModal({ imageUrl, caption, userName, onClose }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 sm:bg-black/80 sm:backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full text-white transition-colors"
      >
        <X size={24} />
      </button>

      {/* Modal content — edge-to-edge on mobile, rounded card on desktop */}
      <div 
        className="relative w-full h-full sm:max-w-3xl sm:w-auto sm:h-auto sm:max-h-[90vh] bg-black sm:bg-white sm:rounded-2xl overflow-hidden sm:shadow-2xl flex flex-col sm:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Full preview" 
            className="w-full h-auto max-h-[80vh] sm:max-h-[70vh] object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Caption bar */}
        {(userName || caption) && (
          <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-white/10 sm:border-gray-100 bg-black/80 sm:bg-white backdrop-blur-md sm:backdrop-blur-none">
            <p className="text-white sm:text-gray-800 text-sm sm:text-[15px] leading-relaxed break-words">
              {userName && <span className="font-semibold mr-2">{userName}</span>}
              {caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
