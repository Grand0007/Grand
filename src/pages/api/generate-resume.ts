import type { NextApiRequest, NextApiResponse } from 'next';
import { getBlobServiceClient, getCosmosContainer, CONTAINERS, BLOB_CONTAINERS } from '@/lib/azure';
import { generateOptimizedResumeContent } from '@/lib/aiProcessor';
import { getUserFromToken } from '@/lib/auth';
import { ApiResponse, Resume } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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

    const { resumeId } = req.body;
    
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID is required'
      });
    }

    // Get resume from database
    const resumeContainer = getCosmosContainer(CONTAINERS.RESUMES);
    const { resource: resume } = await resumeContainer.item(resumeId).read<Resume>();
    
    if (!resume || resume.user_id !== user.id) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Generate optimized resume content
    const optimizedHtml = await generateOptimizedResumeContent(
      resume.extracted_data,
      resume.ai_enhancements!
    );

    // Upload enhanced resume to blob storage
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINERS.ENHANCED_RESUMES);
    
    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'private'
    });

    const fileName = `${user.id}/${uuidv4()}-enhanced-resume.html`;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    await blockBlobClient.upload(optimizedHtml, optimizedHtml.length, {
      blobHTTPHeaders: {
        blobContentType: 'text/html'
      }
    });

    const enhancedResumeUrl = blockBlobClient.url;

    // Update resume record with enhanced URL
    resume.enhanced_resume_url = enhancedResumeUrl;
    resume.updated_at = new Date().toISOString();
    
    await resumeContainer.item(resumeId).replace(resume);

    res.status(200).json({
      success: true,
      data: {
        resumeId: resume.id,
        enhancedResumeUrl: enhancedResumeUrl,
        htmlContent: optimizedHtml
      },
      message: 'Enhanced resume generated successfully'
    });

  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate enhanced resume'
    });
  }
}