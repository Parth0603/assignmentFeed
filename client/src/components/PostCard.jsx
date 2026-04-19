import { useState } from 'react';
import dayjs from 'dayjs';
import { UserCircle, BookOpen } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

const subjectColors = {
  'Mathematics 3': 'bg-blue-100 text-blue-700',
  'Operating System': 'bg-green-100 text-green-700',
  'Analysis and Design of Algorithm': 'bg-purple-100 text-purple-700',
  'Computer Architecture and Organisation': 'bg-orange-100 text-orange-700',
  'Software Development': 'bg-pink-100 text-pink-700'
};

export default function PostCard({ post }) {
  const [showPreview, setShowPreview] = useState(false);
  const formattedDate = dayjs(post.createdAt).format('DD MMM YYYY, HH:mm');
  const isTweet = post.type === 'tweet';

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5 transition-shadow hover:shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="bg-gradient-to-tr from-indigo-100 to-purple-100 p-1 rounded-full mr-3 text-indigo-600">
              <UserCircle size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {post.userId?.name || 'Unknown User'}
              </h3>
              <p className="text-[11px] text-gray-400">{formattedDate}</p>
            </div>
          </div>
          {/* Subject badge */}
          {post.subject && (
            <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full ${subjectColors[post.subject] || 'bg-gray-100 text-gray-600'}`}>
              {post.subject}
            </span>
          )}
        </div>

        {/* Image — only for posts, not tweets */}
        {!isTweet && post.imageUrl && (
          <div 
            className="bg-gray-100 w-full overflow-hidden cursor-pointer"
            onClick={() => setShowPreview(true)}
          >
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full object-contain max-h-[500px] bg-gray-900"
              loading="lazy"
            />
          </div>
        )}

        {/* Caption */}
        <div className={`px-5 ${isTweet ? 'py-5' : 'py-3'}`}>
          <p className={`text-gray-800 leading-relaxed break-words ${isTweet ? 'text-base' : 'text-[15px]'}`}>
            {!isTweet && <span className="font-semibold mr-2 text-sm">{post.userId?.name}</span>}
            {post.caption}
          </p>
        </div>
      </div>

      {/* Full-screen preview modal */}
      {showPreview && post.imageUrl && (
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
