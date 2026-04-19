import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import PostCard from '../components/PostCard';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts?page=${page}&limit=5`);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => {
          // simple deduping based on ID
          const newPosts = data.filter(d => !prev.some(p => p._id === d._id));
          return [...prev, ...newPosts];
        });
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Your Feed</h1>
      
      {posts.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
          No posts yet. Be the first to share!
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}

      {!loading && hasMore && posts.length > 0 && (
        <button 
          onClick={() => setPage(p => p + 1)}
          className="w-full mt-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          Load More
        </button>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          You've reached the end
        </div>
      )}
    </div>
  );
}
