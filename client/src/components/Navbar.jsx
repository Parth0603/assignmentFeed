import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden sm:block fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">AssignmentFeed</Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Home size={20} />
              <span className="font-medium">Home</span>
            </Link>
            <Link to="/create" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/create') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <PlusSquare size={20} />
              <span className="font-medium">Create</span>
            </Link>
            <Link to="/profile" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/profile') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <User size={20} />
              <span className="font-medium">Profile</span>
            </Link>
            <button onClick={logout} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="sm:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-50 px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-indigo-600">AssignmentFeed</Link>
        <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600">
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile Bottom Bar */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 px-6 h-16 flex items-center justify-between pb-safe">
        <Link to="/" className={`flex flex-col items-center flex-1 py-2 ${isActive('/') ? 'text-indigo-600' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link to="/create" className={`flex flex-col items-center flex-1 py-2 ${isActive('/create') ? 'text-indigo-600' : 'text-gray-500'}`}>
          <PlusSquare size={24} />
          <span className="text-[10px] mt-1 font-medium">Create</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center flex-1 py-2 ${isActive('/profile') ? 'text-indigo-600' : 'text-gray-500'}`}>
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </nav>
      
      {/* Spacer for desktop */}
      <div className="hidden sm:block h-16"></div>
      {/* Spacer for mobile top */}
      <div className="sm:hidden h-14"></div>
    </>
  );
}
