import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import PostCard from '../components/PostCard';

const SUBJECTS = [
  'Mathematics 3',
  'Operating System',
  'Analysis and Design of Algorithm',
  'Computer Architecture and Organisation',
  'Software Development'
];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeSubject, setActiveSubject] = useState('');

  useEffect(() => {
    // Reset when filter changes
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [activeSubject]);

  useEffect(() => {
    fetchPosts();
  }, [page, activeSubject]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `/posts?page=${page}&limit=5`;
      if (activeSubject) url += `&subject=${encodeURIComponent(activeSubject)}`;

      const { data } = await api.get(url);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => {
          if (page === 1) return data;
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

  const handleFilter = (subject) => {
    setActiveSubject(activeSubject === subject ? '' : subject);
  };

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 tracking-tight">Feed</h1>

      {/* Subject Filter */}
      <div className="mb-5">
        <select
          value={activeSubject}
          onChange={(e) => setActiveSubject(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none shadow-sm"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Posts */}
      {posts.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 text-sm">
          {activeSubject ? `No posts in "${activeSubject}" yet.` : 'No posts yet. Be the first to share!'}
        </div>
      ) : (
        <div>
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {loading && <div className="text-center py-4 text-gray-400 text-sm">Loading...</div>}

      {!loading && hasMore && posts.length > 0 && (
        <button 
          onClick={() => setPage(p => p + 1)}
          className="w-full mt-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm"
        >
          Load More
        </button>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-gray-400 text-xs">
          You've reached the end
        </div>
      )}
    </div>
  );
}
