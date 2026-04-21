import { useState } from 'react';
import { Camera, Image as ImageIcon, Send, X, MessageSquare, ImagePlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import CameraCapture from '../components/CameraCapture';
import FileUploader from '../components/FileUploader';

const SUBJECTS = [
  'Mathematics 3',
  'Operating System',
  'Analysis and Design of Algorithm',
  'Computer Architecture and Organisation',
  'Software Development'
];

export default function CreatePost() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null = selection, 'post', 'tweet', 'pdf'
  const [imageBase64, setImageBase64] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [subject, setSubject] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadToCloudinary = async (fileOrBase64) => {
    // 1. Get signature
    const sigRes = await api.get('/posts/upload-signature');
    const { signature, timestamp, apiKey, cloudName } = sigRes.data;

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('file', fileOrBase64);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', 'assignment_feed');

    // 3. Upload
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadRes.ok) throw new Error('Failed to upload to Cloudinary');
    const data = await uploadRes.json();
    return data.secure_url;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!caption) return toast.error('Please add a caption');
    if (!subject) return toast.error('Please select a subject');
    if (mode === 'post' && !imageBase64) return toast.error('Please add a photo');
    if (mode === 'pdf' && !pdfFile) return toast.error('Please select a PDF file');

    setLoading(true);
    try {
      let imageUrl = null;
      let fileUrl = null;

      if (mode === 'post') {
        toast.loading('Uploading image...', { id: 'upload' });
        imageUrl = await uploadToCloudinary(imageBase64);
        toast.dismiss('upload');
      } else if (mode === 'pdf') {
        toast.loading('Uploading PDF...', { id: 'upload' });
        fileUrl = await uploadToCloudinary(pdfFile);
        toast.dismiss('upload');
      }

      await api.post('/posts', { type: mode, caption, subject, imageUrl, fileUrl });
      toast.success(mode === 'tweet' ? 'Tweet posted!' : (mode === 'pdf' ? 'PDF shared!' : 'Post shared!'));
      navigate('/');
    } catch (error) {
      toast.dismiss('upload');
      toast.error(error.response?.data?.error || error.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Choose mode
  if (!mode) {
    return (
      <div className="pb-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Create</h1>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('post')}
            className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <ImagePlus size={28} className="text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-900">Add Post</span>
            <span className="text-xs text-gray-400 mt-1">Photo + Caption</span>
          </button>

          <button
            onClick={() => setMode('tweet')}
            className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
              <MessageSquare size={28} className="text-purple-600" />
            </div>
            <span className="font-semibold text-gray-900">Add Tweet</span>
            <span className="text-xs text-gray-400 mt-1">Text Only</span>
          </button>
          
          <button
            onClick={() => setMode('pdf')}
            className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all grid-cols-2 col-span-2 group"
          >
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
              <FileText size={28} className="text-red-500" />
            </div>
            <span className="font-semibold text-gray-900">Add PDF</span>
            <span className="text-xs text-gray-400 mt-1">Document + Caption</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header with back */}
      <div className="flex items-center mb-6">
        <button onClick={() => { setMode(null); setImageBase64(''); setPdfFile(null); setCaption(''); setSubject(''); }} className="mr-3 text-gray-400 hover:text-gray-600">
          ← 
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {mode === 'post' ? 'New Post' : (mode === 'pdf' ? 'New PDF' : 'New Tweet')}
        </h1>
      </div>

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
        
        {/* Image Selection — only for posts */}
        {mode === 'post' && (
          !imageBase64 ? (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex flex-col items-center justify-center py-8 px-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                <Camera size={28} className="mb-2" />
                <span className="font-semibold text-sm">Camera</span>
              </button>
              
              <FileUploader onFileSelected={({dataUrl}) => setImageBase64(dataUrl)}>
                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-center py-8 px-4 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100 pointer-events-none"
                >
                  <ImageIcon size={28} className="mb-2" />
                  <span className="font-semibold text-sm">Upload</span>
                </button>
              </FileUploader>
            </div>
          ) : (
            <div className="relative mb-5 rounded-xl overflow-hidden bg-gray-900">
              <img src={imageBase64} alt="Preview" className="w-full object-contain max-h-[50vh]" />
              <button
                type="button"
                onClick={() => setImageBase64('')}
                className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md"
              >
                <X size={18} />
              </button>
            </div>
          )
        )}

        {/* PDF Selection */}
        {mode === 'pdf' && (
          !pdfFile ? (
            <div className="mb-5">
              <FileUploader acceptPdf={true} onFileSelected={({file}) => setPdfFile(file)}>
                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-center py-10 px-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-100 pointer-events-none"
                >
                  <FileText size={32} className="mb-3" />
                  <span className="font-semibold text-sm">Select PDF File</span>
                </button>
              </FileUploader>
            </div>
          ) : (
            <div className="relative mb-5 flex items-center p-4 rounded-xl border border-red-100 bg-red-50">
              <FileText size={24} className="text-red-500 mr-3" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate text-sm">{pdfFile.name}</p>
                <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              >
                <X size={16} />
              </button>
            </div>
          )
        )}

        {/* Subject Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
          >
            <option value="">Select a subject...</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Caption */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {mode === 'tweet' ? 'What\'s on your mind?' : 'Caption'}
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={280}
            rows={mode === 'tweet' ? 5 : 3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-sm"
            placeholder={mode === 'tweet' ? 'Share something with the class...' : 'Write a caption...'}
          />
          <div className="text-right text-xs text-gray-400 mt-1 font-medium">
            {caption.length} / 280
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !caption || !subject || (mode === 'post' && !imageBase64) || (mode === 'pdf' && !pdfFile)}
          className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all text-sm"
        >
          {loading ? 'Posting...' : (
            <>
              <Send size={16} className="mr-2" />
              {mode === 'tweet' ? 'Post Tweet' : (mode === 'pdf' ? 'Share PDF' : 'Share Post')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
