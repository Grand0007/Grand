import { getOpenAIClient } from './azure';
import { ExtractedData, JobRequirements, AIEnhancements, Experience } from '@/types';
import crypto from 'crypto';

export const analyzeJobDescription = async (jobDescription: string): Promise<JobRequirements> => {
  const client = getOpenAIClient();
  
  const prompt = `
    Analyze the following job description and extract the key requirements:
    
    Job Description:
    ${jobDescription}
    
    Please provide a JSON response with the following structure:
    {
      "required_skills": ["skill1", "skill2", ...],
      "preferred_skills": ["skill1", "skill2", ...],
      "experience_level": "entry|mid|senior",
      "responsibilities": ["responsibility1", "responsibility2", ...],
      "qualifications": ["qualification1", "qualification2", ...]
    }
  `;
  
  try {
    const response = await client.getChatCompletions(
      'gpt-4', // Use your deployed model name
      [
        {
          role: 'system',
          content: 'You are an expert HR analyst. Extract key job requirements from job descriptions and return them in the specified JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        temperature: 0.1,
        maxTokens: 1000
      }
    );
    
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Job analysis error:', error);
    // Return fallback analysis
    return {
      required_skills: extractSkillsFromText(jobDescription),
      preferred_skills: [],
      experience_level: determineExperienceLevel(jobDescription),
      responsibilities: extractResponsibilitiesFromText(jobDescription),
      qualifications: []
    };
  }
};

export const enhanceResumeWithAI = async (
  resumeData: ExtractedData,
  jobRequirements: JobRequirements
): Promise<AIEnhancements> => {
  const client = getOpenAIClient();
  
  const prompt = `
    Given the following resume data and job requirements, provide AI-powered enhancements:
    
    Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
    
    Job Requirements:
    ${JSON.stringify(jobRequirements, null, 2)}
    
    Please provide a JSON response with the following structure:
    {
      "matched_skills": ["skill1", "skill2", ...],
      "optimized_experience": [
        {
          "id": "experience_id",
          "company": "company_name",
          "position": "position_title",
          "startDate": "start_date",
          "endDate": "end_date",
          "description": "enhanced_description",
          "achievements": ["achievement1", "achievement2", ...]
        }
      ],
      "suggestions": ["suggestion1", "suggestion2", ...],
      "ats_score": 85,
      "keyword_density": {"keyword1": 0.05, "keyword2": 0.03}
    }
    
    Focus on:
    1. Matching resume skills with job requirements
    2. Rewriting experience descriptions to better align with the job
    3. Optimizing for ATS (Applicant Tracking System) keywords
    4. Providing actionable suggestions for improvement
  `;
  
  try {
    const response = await client.getChatCompletions(
      'gpt-4', // Use your deployed model name
      [
        {
          role: 'system',
          content: 'You are an expert resume writer and career coach. Help optimize resumes for specific job applications by enhancing content and improving ATS compatibility.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        temperature: 0.3,
        maxTokens: 2000
      }
    );
    
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    
    const enhancements = JSON.parse(content);
    
    // Calculate ATS score based on keyword matching
    const atsScore = calculateATSScore(resumeData, jobRequirements);
    enhancements.ats_score = atsScore;
    
    return enhancements;
  } catch (error) {
    console.error('Resume enhancement error:', error);
    // Return fallback enhancements
    return createFallbackEnhancements(resumeData, jobRequirements);
  }
};

export const generateOptimizedResumeContent = async (
  resumeData: ExtractedData,
  enhancements: AIEnhancements
): Promise<string> => {
  const client = getOpenAIClient();
  
  const prompt = `
    Generate a complete, professionally formatted resume based on the following data and enhancements:
    
    Original Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
    
    AI Enhancements:
    ${JSON.stringify(enhancements, null, 2)}
    
    Please create a complete resume in HTML format that:
    1. Uses professional formatting
    2. Incorporates all the AI enhancements
    3. Is optimized for ATS systems
    4. Maintains a clean, modern design
    5. Highlights the most relevant skills and experiences
    
    Return only the HTML content without any markdown formatting.
  `;
  
  try {
    const response = await client.getChatCompletions(
      'gpt-4', // Use your deployed model name
      [
        {
          role: 'system',
          content: 'You are an expert resume designer. Create professional, ATS-optimized resumes in HTML format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        temperature: 0.2,
        maxTokens: 3000
      }
    );
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Resume generation error:', error);
    return generateFallbackResume(resumeData, enhancements);
  }
};

// Utility functions
const extractSkillsFromText = (text: string): string[] => {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'Project Management', 'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
    'Data Analysis', 'Machine Learning', 'Cloud Computing', 'DevOps', 'Agile'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
};

const determineExperienceLevel = (jobDescription: string): 'entry' | 'mid' | 'senior' => {
  const text = jobDescription.toLowerCase();
  
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
    return 'senior';
  } else if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
    return 'entry';
  }
  return 'mid';
};

const extractResponsibilitiesFromText = (text: string): string[] => {
  // Simple extraction based on bullet points or common responsibility patterns
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const responsibilities: string[] = [];
  
  lines.forEach(line => {
    if (line.includes('•') || line.includes('-') || line.includes('*')) {
      responsibilities.push(line.replace(/[•\-*]/g, '').trim());
    }
  });
  
  return responsibilities.slice(0, 5); // Limit to top 5
};

const calculateATSScore = (resumeData: ExtractedData, jobRequirements: JobRequirements): number => {
  const resumeSkills = resumeData.skills.map(skill => skill.name.toLowerCase());
  const requiredSkills = jobRequirements.required_skills.map(skill => skill.toLowerCase());
  
  const matchedSkills = resumeSkills.filter(skill => 
    requiredSkills.some(required => required.includes(skill) || skill.includes(required))
  );
  
  const matchPercentage = (matchedSkills.length / requiredSkills.length) * 100;
  return Math.min(Math.round(matchPercentage), 100);
};

const createFallbackEnhancements = (
  resumeData: ExtractedData,
  jobRequirements: JobRequirements
): AIEnhancements => {
  const resumeSkills = resumeData.skills.map(skill => skill.name);
  const matchedSkills = resumeSkills.filter(skill =>
    jobRequirements.required_skills.some(required =>
      skill.toLowerCase().includes(required.toLowerCase()) ||
      required.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  return {
    matched_skills: matchedSkills,
    optimized_experience: resumeData.experience,
    suggestions: [
      'Consider adding more specific achievements with quantifiable results',
      'Include relevant keywords from the job description',
      'Highlight transferable skills that match the job requirements'
    ],
    ats_score: calculateATSScore(resumeData, jobRequirements),
    keyword_density: {}
  };
};

const generateFallbackResume = (resumeData: ExtractedData, enhancements: AIEnhancements): string => {
  return `
    <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
      <header style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #2563eb;">${resumeData.personal_info.name}</h1>
        <p style="margin: 5px 0;">${resumeData.personal_info.email} | ${resumeData.personal_info.phone}</p>
        ${resumeData.personal_info.linkedin ? `<p style="margin: 5px 0;">${resumeData.personal_info.linkedin}</p>` : ''}
      </header>
      
      <section style="margin-bottom: 30px;">
        <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Professional Experience</h2>
        ${resumeData.experience.map(exp => `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; color: #1f2937;">${exp.position}</h3>
            <p style="margin: 5px 0; color: #6b7280;">${exp.company} | ${exp.startDate} - ${exp.endDate || 'Present'}</p>
            <p style="margin: 10px 0;">${exp.description}</p>
            ${exp.achievements.length > 0 ? `
              <ul style="margin: 10px 0;">
                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </section>
      
      <section style="margin-bottom: 30px;">
        <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Skills</h2>
        <p>${resumeData.skills.map(skill => skill.name).join(', ')}</p>
      </section>
      
      <section>
        <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Education</h2>
        ${resumeData.education.map(edu => `
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0; color: #1f2937;">${edu.degree}</h3>
            <p style="margin: 5px 0; color: #6b7280;">${edu.institution} | ${edu.endDate}</p>
          </div>
        `).join('')}
      </section>
    </div>
  `;
};

export const createJobDescriptionHash = (jobDescription: string): string => {
  return crypto.createHash('sha256').update(jobDescription).digest('hex');
};