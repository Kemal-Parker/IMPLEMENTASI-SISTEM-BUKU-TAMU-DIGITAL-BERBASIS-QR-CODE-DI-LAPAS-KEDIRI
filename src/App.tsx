import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Users, QrCode, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import VisitorForm from './pages/VisitorForm';
import AdminHistory from './pages/AdminHistory';
import QRCodePage from './pages/QRCodePage';
import { cn } from './lib/utils';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  if (location.pathname === '/form') {
    return null; // Don't show admin nav on the public form
  }

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
              <span className="text-white font-bold text-xl">Lapas Kediri</span>
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
          </div>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/form" element={<VisitorForm />} />
            <Route path="/history" element={<AdminHistory />} />
            <Route path="/qr" element={<QRCodePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
