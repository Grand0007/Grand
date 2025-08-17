import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/pages/_app';
import { Mail, Key, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/auth/send-otp', { email });
      
      if (response.data.success) {
        setStep('otp');
        setSuccess('OTP sent to your email. Please check your inbox.');
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      
      if (response.data.success) {
        login(response.data.token, response.data.user);
        router.push('/dashboard');
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setSuccess('');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {step === 'email' ? 'Sign in to your account' : 'Enter verification code'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'email' 
                ? 'Enter your email to receive a login code' 
                : `We sent a 6-digit code to ${email}`
              }
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full py-3 px-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Sending code...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Send verification code
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input pl-10 text-center text-lg font-mono tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="btn-primary w-full py-3 px-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Verifying...
                      </div>
                    ) : (
                      'Verify and sign in'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="btn-outline w-full py-3 px-4 text-base"
                  >
                    Back to email
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}