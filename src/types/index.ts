// User Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_login: string;
  subscription_type: 'free' | 'premium';
}

// Resume Types
export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  linkedin?: string;
  website?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: number;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

export interface ExtractedData {
  personal_info: PersonalInfo;
  experience: Experience[];
  skills: Skill[];
  education: Education[];
}

export interface AIEnhancements {
  matched_skills: string[];
  optimized_experience: Experience[];
  suggestions: string[];
  ats_score: number;
  keyword_density: Record<string, number>;
}

export interface Resume {
  id: string;
  user_id: string;
  original_resume_url: string;
  enhanced_resume_url?: string;
  job_description: string;
  extracted_data: ExtractedData;
  ai_enhancements?: AIEnhancements;
  created_at: string;
  updated_at: string;
}

// Job Analysis Types
export interface JobRequirements {
  required_skills: string[];
  preferred_skills: string[];
  experience_level: 'entry' | 'mid' | 'senior';
  responsibilities: string[];
  qualifications: string[];
}

export interface JobAnalysis {
  id: string;
  resume_id: string;
  job_description_hash: string;
  extracted_requirements: JobRequirements;
  match_score: number;
}

// Authentication Types
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// AI Processing Types
export interface AIProcessingRequest {
  resumeData: ExtractedData;
  jobDescription: string;
}

export interface AIProcessingResponse {
  enhancements: AIEnhancements;
  optimizedResume: ExtractedData;
  matchScore: number;
}

// Form Types
export interface LoginForm {
  email: string;
  otp: string;
}

export interface ResumeUploadForm {
  file: File;
  jobDescription: string;
}