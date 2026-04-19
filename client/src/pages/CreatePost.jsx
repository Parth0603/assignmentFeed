import { useState } from 'react';
import { Camera, Image as ImageIcon, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import CameraCapture from '../components/CameraCapture';
import FileUploader from '../components/FileUploader';

export default function CreatePost() {
  const navigate = useNavigate();
  const [imageBase64, setImageBase64] = useState('');
  const [caption, setCaption] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!imageBase64) return toast.error('Please add a photo');
    if (!caption) return toast.error('Please add a caption');
    
    setLoading(true);
    try {
      await api.post('/posts', { imageBase64, caption });
      toast.success('Posted successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Create Post</h1>

      {showCamera && (
        <CameraCapture 
          onCapture={(dataUrl) => {
            setImageBase64(dataUrl);
            setShowCamera(false);
          }}
          onCancel={() => setShowCamera(false)}
        />
      )}

      <form onSubmit={handleCreate} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        
        {/* Image Selection Area */}
        {!imageBase64 ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex flex-col items-center justify-center py-10 px-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <Camera size={32} className="mb-2" />
              <span className="font-semibold text-sm">Use Camera</span>
            </button>
            
            <FileUploader onImageSelected={setImageBase64}>
              <button
                type="button"
                className="w-full flex flex-col items-center justify-center py-10 px-4 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100 pointer-events-none"
              >
                <ImageIcon size={32} className="mb-2" />
                <span className="font-semibold text-sm">Upload Photo</span>
              </button>
            </FileUploader>
          </div>
        ) : (
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gray-100">
            <img src={imageBase64} alt="Preview" className="w-full object-contain max-h-[60vh]" />
            <button
              type="button"
              onClick={() => setImageBase64('')}
              className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Caption Area */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={280}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
            placeholder="Write something nice..."
          />
          <div className="text-right text-xs text-gray-400 mt-1 font-medium">
            {caption.length} / 280
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !imageBase64 || !caption}
          className="w-full flex items-center justify-center py-3.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {loading ? 'Posting...' : (
            <>
              <Send size={18} className="mr-2" />
              Share Post
            </>
          )}
        </button>
      </form>
    </div>
  );
}
