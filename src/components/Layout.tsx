import { useAuth } from '@/pages/_app';
import { LogOut, User, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI Resume Builder</span>
            </Link>

            {/* Navigation */}
            {user ? (
              <nav className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === '/dashboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.subscription_type}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            ) : (
              <nav className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/login"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">AI Resume Builder</span>
              </div>
              <p className="text-gray-600 text-sm max-w-md">
                Transform your resume with AI-powered optimization. Get matched with your dream job by creating ATS-friendly resumes tailored to specific job descriptions.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Features
              </h3>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-600">AI Resume Enhancement</span></li>
                <li><span className="text-sm text-gray-600">ATS Optimization</span></li>
                <li><span className="text-sm text-gray-600">Job Matching</span></li>
                <li><span className="text-sm text-gray-600">Professional Templates</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-600">Help Center</span></li>
                <li><span className="text-sm text-gray-600">Contact Us</span></li>
                <li><span className="text-sm text-gray-600">Privacy Policy</span></li>
                <li><span className="text-sm text-gray-600">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              © 2024 AI Resume Builder. Powered by Azure Cloud Services.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}