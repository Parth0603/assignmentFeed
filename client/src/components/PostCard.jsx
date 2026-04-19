import { useState } from 'react';
import dayjs from 'dayjs';
import { UserCircle } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

export default function PostCard({ post }) {
  const [showPreview, setShowPreview] = useState(false);
  const formattedDate = dayjs(post.createdAt).format('DD MMM YYYY, HH:mm');

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-shadow hover:shadow-md">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-50">
          <div className="bg-gradient-to-tr from-indigo-100 to-purple-100 p-1 rounded-full mr-3 text-indigo-600">
            <UserCircle size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">
              {post.userId?.name || 'Unknown User'}
            </h3>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>

        {/* Image — clickable */}
        <div 
          className="bg-gray-100 relative aspect-square sm:aspect-[4/3] w-full overflow-hidden cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Caption */}
        <div className="px-5 py-4">
          <p className="text-gray-800 text-[15px] leading-relaxed break-words">
            <span className="font-semibold mr-2">{post.userId?.name}</span>
            {post.caption}
          </p>
        </div>
      </div>

      {/* Full-screen preview modal */}
      {showPreview && (
        <ImagePreviewModal
          imageUrl={post.imageUrl}
          caption={post.caption}
          userName={post.userId?.name}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
