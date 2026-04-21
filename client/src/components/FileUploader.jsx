import { useRef } from 'react';
import toast from 'react-hot-toast';

export default function FileUploader({ onFileSelected, acceptPdf = false, children }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (acceptPdf && file.type === 'application/pdf') {
       onFileSelected({ file, type: 'pdf' });
       e.target.value = '';
       return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(acceptPdf ? 'Please select an image or PDF file' : 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if width > 1280
        if (width > 1280) {
          height = Math.round((height * 1280) / width);
          width = 1280;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        onFileSelected({ dataUrl, type: 'image' });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    // reset input
    e.target.value = '';
  };

  return (
    <div onClick={handleClick} className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptPdf ? "image/jpeg, image/png, image/webp, application/pdf" : "image/jpeg, image/png, image/webp"}
        className="hidden"
      />
      {children}
    </div>
  );
}
