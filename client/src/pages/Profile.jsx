import { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { UserCircle, Grid3X3, Trash2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ImagePreviewModal from '../components/ImagePreviewModal';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts/user/${user._id}`);
      setPosts(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, e) => {
    e.stopPropagation(); // prevent opening preview
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    setDeletingId(postId);
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pb-10">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-6 sm:mb-8">
        <div className="bg-gradient-to-tr from-indigo-100 to-purple-100 p-2 rounded-full text-indigo-600 mb-3 sm:mb-4">
          <UserCircle size={64} className="sm:w-20 sm:h-20" strokeWidth={1} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{user?.name}</h1>
        <p className="text-sm text-gray-500 mb-4 sm:mb-6 break-all">{user?.email}</p>
        
        <div className="flex space-x-12 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Posts</div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-3 sm:mb-4 px-1 border-b border-gray-200 pb-2">
        <Grid3X3 size={18} className="text-gray-900" />
        <h2 className="font-semibold text-gray-900 uppercase tracking-wide text-xs sm:text-sm">Grid View</h2>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm sm:text-base">
          You haven't posted anything yet.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-3">
          {posts.map(post => {
            const isTweet = post.type === 'tweet';
            const isPdf = post.type === 'pdf';
            const imageUrl = isPdf && post.fileUrl ? post.fileUrl.replace(/\.pdf$/i, '.jpg') : post.imageUrl;

            return (
              <div 
                key={post._id} 
                className={`aspect-square bg-gray-100 sm:rounded-xl overflow-hidden group relative cursor-pointer active:opacity-80 ${isTweet ? 'bg-purple-50' : ''}`}
                onClick={() => {
                  if (!isTweet) setPreviewPost(post);
                }}
              >
                {isTweet ? (
                  <div className="w-full h-full flex items-center justify-center p-3 sm:p-5">
                    <p className="text-purple-900 text-xs sm:text-sm font-medium line-clamp-4 leading-relaxed break-words text-center">
                      {post.caption}
                    </p>
                  </div>
                ) : (
                  <img 
                    src={imageUrl} 
                    alt="Post" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />
                )}
                {/* Overlay with delete button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 sm:p-4">
                  <p className="hidden sm:block text-white text-sm font-medium text-center line-clamp-2 mb-3">
                    {post.caption}
                  </p>
                  <button
                    onClick={(e) => handleDelete(post._id, e)}
                    disabled={deletingId === post._id}
                    className="p-2 bg-red-500/90 hover:bg-red-600 active:bg-red-700 text-white rounded-full transition-colors shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Mobile: always-visible small delete icon in corner */}
                <button
                  onClick={(e) => handleDelete(post._id, e)}
                  disabled={deletingId === post._id}
                  className="sm:hidden absolute top-1 right-1 p-1.5 bg-black/50 active:bg-red-600 text-white rounded-full z-10"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewPost && (
        <ImagePreviewModal
          imageUrl={previewPost.type === 'pdf' ? previewPost.fileUrl?.replace(/\.pdf$/i, '.jpg') : previewPost.imageUrl}
          caption={previewPost.caption}
          userName={user?.name}
          onClose={() => setPreviewPost(null)}
        />
      )}
    </div>
  );
}
