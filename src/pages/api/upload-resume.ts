import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { getBlobServiceClient, getCosmosContainer, CONTAINERS, BLOB_CONTAINERS } from '@/lib/azure';
import { parseResumeFile, extractDataFromText } from '@/lib/fileProcessor';
import { analyzeJobDescription, enhanceResumeWithAI, createJobDescriptionHash } from '@/lib/aiProcessor';
import { getUserFromToken } from '@/lib/auth';
import { ApiResponse, Resume, JobAnalysis } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        return mimetype?.includes('pdf') || 
               mimetype?.includes('msword') || 
               mimetype?.includes('wordprocessingml');
      }
    });

    const [fields, files] = await form.parse(req);
    
    const jobDescription = Array.isArray(fields.jobDescription) 
      ? fields.jobDescription[0] 
      : fields.jobDescription || '';
    
    const file = Array.isArray(files.resume) ? files.resume[0] : files.resume;
    
    if (!file || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Resume file and job description are required'
      });
    }

    // Read and parse the file
    const buffer = fs.readFileSync(file.filepath);
    const resumeText = await parseResumeFile(buffer, file.mimetype || '');
    const extractedData = await extractDataFromText(resumeText);

    // Upload original file to blob storage
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINERS.RESUMES);
    
    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'private'
    });

    const fileName = `${user.id}/${uuidv4()}-${file.originalFilename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    const originalResumeUrl = blockBlobClient.url;

    // Analyze job description
    const jobRequirements = await analyzeJobDescription(jobDescription);
    const jobDescriptionHash = createJobDescriptionHash(jobDescription);

    // Enhance resume with AI
    const aiEnhancements = await enhanceResumeWithAI(extractedData, jobRequirements);

    // Create resume record
    const resumeId = uuidv4();
    const resume: Resume = {
      id: resumeId,
      user_id: user.id,
      original_resume_url: originalResumeUrl,
      job_description: jobDescription,
      extracted_data: extractedData,
      ai_enhancements: aiEnhancements,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save resume to database
    const resumeContainer = getCosmosContainer(CONTAINERS.RESUMES);
    await resumeContainer.items.create(resume);

    // Create job analysis record
    const jobAnalysis: JobAnalysis = {
      id: uuidv4(),
      resume_id: resumeId,
      job_description_hash: jobDescriptionHash,
      extracted_requirements: jobRequirements,
      match_score: aiEnhancements.ats_score
    };

    const jobAnalysisContainer = getCosmosContainer(CONTAINERS.JOB_ANALYSES);
    await jobAnalysisContainer.items.create(jobAnalysis);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    res.status(200).json({
      success: true,
      data: {
        resumeId: resume.id,
        extractedData: resume.extracted_data,
        aiEnhancements: resume.ai_enhancements,
        matchScore: jobAnalysis.match_score
      },
      message: 'Resume processed successfully'
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process resume'
    });
  }
}