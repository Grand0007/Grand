import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { ExtractedData, PersonalInfo, Experience, Education, Skill } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const parseResumeFile = async (buffer: Buffer, mimetype: string): Promise<string> => {
  try {
    let text = '';
    
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      text = data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimetype === 'application/msword') {
      // For older .doc files, we'll need a different approach or convert to text
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
    
    return text;
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error('Failed to parse resume file');
  }
};

export const extractDataFromText = async (text: string): Promise<ExtractedData> => {
  // This is a simplified extraction - in production, you'd use more sophisticated NLP
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const extractedData: ExtractedData = {
    personal_info: extractPersonalInfo(lines, text),
    experience: extractExperience(lines, text),
    skills: extractSkills(lines, text),
    education: extractEducation(lines, text)
  };
  
  return extractedData;
};

const extractPersonalInfo = (lines: string[], fullText: string): PersonalInfo => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
  
  const email = fullText.match(emailRegex)?.[0] || '';
  const phone = fullText.match(phoneRegex)?.[0] || '';
  const linkedin = fullText.match(linkedinRegex)?.[0] || '';
  
  // Extract name (usually the first line or largest text)
  const name = lines[0] || '';
  
  return {
    name: name.replace(/[^\w\s]/gi, '').trim(),
    email,
    phone: phone.replace(/[^\d+()-.\s]/g, ''),
    address: '', // Would need more sophisticated extraction
    linkedin,
    website: ''
  };
};

const extractExperience = (lines: string[], fullText: string): Experience[] => {
  const experiences: Experience[] = [];
  const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];
  const dateRegex = /\b(19|20)\d{2}\b/g;
  
  // Find experience section
  let inExperienceSection = false;
  let currentExperience: Partial<Experience> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection) {
      // Stop if we hit another major section
      if (line.includes('education') || line.includes('skills') || line.includes('projects')) {
        break;
      }
      
      // Check if this line looks like a job title/company
      const dates = lines[i].match(dateRegex);
      if (dates && dates.length >= 1) {
        if (currentExperience) {
          experiences.push({
            id: uuidv4(),
            company: currentExperience.company || '',
            position: currentExperience.position || '',
            startDate: currentExperience.startDate || '',
            endDate: currentExperience.endDate || null,
            description: currentExperience.description || '',
            achievements: currentExperience.achievements || []
          });
        }
        
        currentExperience = {
          company: lines[i].split(/\d/)[0].trim(),
          position: '',
          startDate: dates[0],
          endDate: dates[1] || null,
          description: '',
          achievements: []
        };
      }
    }
  }
  
  // Add the last experience if exists
  if (currentExperience) {
    experiences.push({
      id: uuidv4(),
      company: currentExperience.company || '',
      position: currentExperience.position || '',
      startDate: currentExperience.startDate || '',
      endDate: currentExperience.endDate || null,
      description: currentExperience.description || '',
      achievements: currentExperience.achievements || []
    });
  }
  
  return experiences;
};

const extractSkills = (lines: string[], fullText: string): Skill[] => {
  const skills: Skill[] = [];
  const skillKeywords = ['skills', 'technical skills', 'core competencies', 'technologies'];
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css',
    'project management', 'leadership', 'communication', 'teamwork', 'problem solving'
  ];
  
  // Find skills section
  let inSkillsSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (skillKeywords.some(keyword => line.includes(keyword))) {
      inSkillsSection = true;
      continue;
    }
    
    if (inSkillsSection) {
      // Stop if we hit another major section
      if (line.includes('experience') || line.includes('education') || line.includes('projects')) {
        break;
      }
      
      // Extract skills from the line
      commonSkills.forEach(skill => {
        if (line.includes(skill)) {
          skills.push({
            name: skill,
            level: 'intermediate',
            category: skill.includes('javascript') || skill.includes('python') ? 'Programming' : 'General'
          });
        }
      });
    }
  }
  
  return skills;
};

const extractEducation = (lines: string[], fullText: string): Education[] => {
  const education: Education[] = [];
  const educationKeywords = ['education', 'academic background', 'qualifications'];
  const degreeKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate'];
  
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      inEducationSection = true;
      continue;
    }
    
    if (inEducationSection) {
      // Stop if we hit another major section
      if (line.includes('experience') || line.includes('skills') || line.includes('projects')) {
        break;
      }
      
      // Check if this line contains degree information
      if (degreeKeywords.some(keyword => line.includes(keyword))) {
        const dateRegex = /\b(19|20)\d{2}\b/g;
        const dates = lines[i].match(dateRegex);
        
        education.push({
          id: uuidv4(),
          institution: '', // Would need more sophisticated extraction
          degree: line,
          field: '',
          startDate: dates?.[0] || '',
          endDate: dates?.[1] || dates?.[0] || '',
          gpa: undefined
        });
      }
    }
  }
  
  return education;
};