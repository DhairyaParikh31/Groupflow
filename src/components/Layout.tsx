import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link
        to="/dashboard"
        className={`block px-4 py-2 ${isActive('/dashboard') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <Link
        to="/leaders"
        className={`block px-4 py-2 ${isActive('/leaders') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Leaders
      </Link>
      <Link
        to="/members"
        className={`block px-4 py-2 ${isActive('/members') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Members
      </Link>
      <Link
        to="/events"
        className={`block px-4 py-2 ${isActive('/events') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Events
      </Link>
      <Link
        to="/event-history"
        className={`block px-4 py-2 ${isActive('/event-history') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Event History
      </Link>
      <Link
        to="/settings"
        className={`block px-4 py-2 ${isActive('/settings') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Settings
      </Link>
      <Link
        to="/shared-information"
        className={`block px-4 py-2 ${isActive('/shared-information') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Shared Information
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:static
        inset-y-0 left-0
        z-40 md:z-auto
        w-64 
        bg-white
        transition-transform duration-300 ease-in-out
        overflow-y-auto
        border-r border-gray-200
      `}>
        {/* Logo in Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold">GROUPFLOW</h1>
        </div>
        
        <nav className="mt-0">
          <NavLinks />
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-full flex items-center justify-between px-4">
            {/* Left section with menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Center section with search */}
            <div className="flex-1 max-w-3xl mx-auto px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Right section with user profile and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {user?.photo ? (
                    <img 
                      src={user.photo} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <span className="text-sm font-medium hidden md:inline">{user?.name}</span>
                <span className="text-sm font-medium md:hidden">{user?.name?.split(' ')[0]}</span>
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}