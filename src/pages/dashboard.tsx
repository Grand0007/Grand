import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/pages/_app';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Target,
  Brain,
  TrendingUp
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { ExtractedData, AIEnhancements } from '@/types';

interface ProcessingResult {
  resumeId: string;
  extractedData: ExtractedData;
  aiEnhancements: AIEnhancements;
  matchScore: number;
}

export default function Dashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [jobDescription, setJobDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!jobDescription.trim()) {
      setError('Please enter a job description first');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await axios.post('/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setResult(response.data.data);
        setSuccess('Resume processed successfully! Review the AI enhancements below.');
      } else {
        setError(response.data.error || 'Failed to process resume');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to process resume');
    } finally {
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: processing || !jobDescription.trim()
  });

  const handleGenerateResume = async () => {
    if (!result) return;

    setGenerating(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-resume', {
        resumeId: result.resumeId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Create a blob from the HTML content and download it
        const blob = new Blob([response.data.data.htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'enhanced-resume.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess('Enhanced resume generated and downloaded successfully!');
      } else {
        setError(response.data.error || 'Failed to generate resume');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to generate resume');
    } finally {
      setGenerating(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Upload your resume and job description to get AI-powered enhancements
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary-600" />
                Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="textarea w-full h-40 resize-none"
                placeholder="Paste the job description here. This will help our AI tailor your resume to match the specific requirements..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {jobDescription.length}/5000 characters
              </p>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-600" />
                Upload Resume
              </h2>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary-400 bg-primary-50' 
                    : jobDescription.trim()
                    ? 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <input {...getInputProps()} />
                
                {processing ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 text-primary-600 mx-auto animate-spin" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Processing your resume...</p>
                      <p className="text-sm text-gray-600">This may take a few moments</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {jobDescription.trim() 
                          ? (isDragActive ? 'Drop your resume here' : 'Click to upload or drag and drop')
                          : 'Enter job description first'
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        PDF, DOC, or DOCX files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {success}
              </div>
            )}

            {result && (
              <>
                {/* Match Score */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                    ATS Match Score
                  </h3>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Match Score</span>
                        <span className="font-medium">{result.matchScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            result.matchScore >= 80 ? 'bg-green-500' :
                            result.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${result.matchScore}%` }}
                        />
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      result.matchScore >= 80 ? 'text-green-500' :
                      result.matchScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {result.matchScore}%
                    </div>
                  </div>
                </div>

                {/* AI Enhancements */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-primary-600" />
                    AI Enhancements
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Matched Skills ({result.aiEnhancements.matched_skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.aiEnhancements.matched_skills.slice(0, 6).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                            {skill}
                          </span>
                        ))}
                        {result.aiEnhancements.matched_skills.length > 6 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
                            +{result.aiEnhancements.matched_skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {result.aiEnhancements.suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Generate Enhanced Resume */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
                    Enhanced Resume
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    Generate your AI-optimized resume with improved content and ATS compatibility.
                  </p>
                  
                  <button
                    onClick={handleGenerateResume}
                    disabled={generating}
                    className="btn-primary w-full py-3 px-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Download className="w-5 h-5 mr-2" />
                        Download Enhanced Resume
                      </div>
                    )}
                  </button>
                </div>
              </>
            )}

            {!result && !processing && (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to enhance your resume?</h3>
                <p className="text-gray-600">
                  Upload your resume and job description to see AI-powered improvements and your match score.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}