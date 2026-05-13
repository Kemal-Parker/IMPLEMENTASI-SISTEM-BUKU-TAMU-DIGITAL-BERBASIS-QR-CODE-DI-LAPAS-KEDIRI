import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Users, QrCode, FileText, Menu, X, LogIn, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import VisitorForm from './pages/VisitorForm';
import AdminHistory from './pages/AdminHistory';
import QRCodePage from './pages/QRCodePage';
import { cn } from './lib/utils';
import { AuthProvider, useAuth } from './lib/firebase';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, logOut } = useAuth();
  
  if (location.pathname === '/form' || location.pathname === '/qr') {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
            <span className="text-gray-900 font-bold text-xl">Buku Tamu Lapas Kediri</span>
            {isAdmin && (
              <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                Sistem Admin
              </Link>
            )}
        </div>
      </nav>
    ); 
  }

  if (!isAdmin) return null;

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/history', label: 'Riwayat Kunjungan', icon: FileText },
    { href: '/qr', label: 'Show QR Code', icon: QrCode },
  ];

  return (
    <nav className="bg-indigo-600 border-b border-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white font-bold text-xl">Buku Tamu Lapas Kediri</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {links.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === href 
                        ? "bg-indigo-700 text-white" 
                        : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex">
             <button onClick={logOut} className="text-sm text-indigo-100 hover:text-white flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-500 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center block px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === href 
                    ? "bg-indigo-700 text-white" 
                    : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Link>
            ))}
            <button onClick={logOut} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-500 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function MainApp() {
  const { isAdmin, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/form" element={<VisitorForm />} />
            <Route path="/qr" element={<QRCodePage />} />
            
            {isAdmin ? (
               <>
                 <Route path="/" element={<AdminDashboard />} />
                 <Route path="/history" element={<AdminHistory />} />
               </>
            ) : (
               <Route path="*" element={
                  <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                    <form onSubmit={handleLogin} className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                          <LogIn className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Login Admin Lapas</h1>
                        <p className="text-gray-500 text-sm mt-2">Masuk untuk mengelola data kunjungan.</p>
                      </div>
                      
                      {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                          {error}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            required 
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                          />
                        </div>
                      </div>

                      <button type="submit" className="w-full flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors">
                        Login Admin
                      </button>
                    </form>
                  </div>
               } />
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
