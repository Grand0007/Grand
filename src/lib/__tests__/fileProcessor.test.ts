import { parseResumeFile, extractDataFromText } from '../fileProcessor'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

// Mock the PDF and DOC parsers
jest.mock('pdf-parse')
jest.mock('mammoth')

const mockPdf = pdf as jest.MockedFunction<typeof pdf>
const mockMammoth = mammoth as jest.Mocked<typeof mammoth>

describe('File Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('parseResumeFile', () => {
    const mockBuffer = Buffer.from('test file content')

    it('parses PDF files correctly', async () => {
      const mockPdfData = { text: 'Extracted PDF text' }
      mockPdf.mockResolvedValue(mockPdfData as any)

      const result = await parseResumeFile(mockBuffer, 'application/pdf')

      expect(mockPdf).toHaveBeenCalledWith(mockBuffer)
      expect(result).toBe('Extracted PDF text')
    })

    it('parses DOCX files correctly', async () => {
      const mockDocxData = { value: 'Extracted DOCX text' }
      mockMammoth.extractRawText.mockResolvedValue(mockDocxData)

      const result = await parseResumeFile(mockBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(mockMammoth.extractRawText).toHaveBeenCalledWith({ buffer: mockBuffer })
      expect(result).toBe('Extracted DOCX text')
    })

    it('parses DOC files correctly', async () => {
      const mockDocData = { value: 'Extracted DOC text' }
      mockMammoth.extractRawText.mockResolvedValue(mockDocData)

      const result = await parseResumeFile(mockBuffer, 'application/msword')

      expect(mockMammoth.extractRawText).toHaveBeenCalledWith({ buffer: mockBuffer })
      expect(result).toBe('Extracted DOC text')
    })

    it('throws error for unsupported file types', async () => {
      await expect(parseResumeFile(mockBuffer, 'text/plain')).rejects.toThrow('Unsupported file type')
    })

    it('handles parsing errors gracefully', async () => {
      mockPdf.mockRejectedValue(new Error('PDF parsing failed'))

      await expect(parseResumeFile(mockBuffer, 'application/pdf')).rejects.toThrow('Failed to parse resume file')
    })
  })

  describe('extractDataFromText', () => {
    it('extracts basic personal information', async () => {
      const resumeText = `
        John Doe
        john.doe@example.com
        (555) 123-4567
        linkedin.com/in/johndoe
        
        Experience
        Software Engineer at Tech Corp
        2020-2023
        Developed web applications
        
        Skills
        JavaScript, Python, React
        
        Education
        Bachelor of Computer Science
        University of Technology
        2016-2020
      `

      const result = await extractDataFromText(resumeText)

      expect(result.personal_info.name).toBe('John Doe')
      expect(result.personal_info.email).toBe('john.doe@example.com')
      expect(result.personal_info.phone).toBe('(555) 123-4567')
      expect(result.personal_info.linkedin).toBe('linkedin.com/in/johndoe')
    })

    it('extracts skills from text', async () => {
      const resumeText = `
        Skills
        JavaScript, Python, React, Node.js, SQL
        Project Management, Leadership
      `

      const result = await extractDataFromText(resumeText)

      expect(result.skills.length).toBeGreaterThan(0)
      expect(result.skills.some(skill => skill.name === 'javascript')).toBe(true)
      expect(result.skills.some(skill => skill.name === 'python')).toBe(true)
    })

    it('extracts experience information', async () => {
      const resumeText = `
        Experience
        Software Engineer at Tech Corp 2020-2023
        Senior Developer at StartupXYZ 2018-2020
      `

      const result = await extractDataFromText(resumeText)

      expect(result.experience).toBeDefined()
      expect(Array.isArray(result.experience)).toBe(true)
    })

    it('extracts education information', async () => {
      const resumeText = `
        Education
        Bachelor of Computer Science 2016-2020
        Master of Software Engineering 2020-2022
      `

      const result = await extractDataFromText(resumeText)

      expect(result.education).toBeDefined()
      expect(Array.isArray(result.education)).toBe(true)
    })

    it('handles empty text gracefully', async () => {
      const result = await extractDataFromText('')

      expect(result.personal_info.name).toBe('')
      expect(result.personal_info.email).toBe('')
      expect(result.experience).toEqual([])
      expect(result.skills).toEqual([])
      expect(result.education).toEqual([])
    })

    it('handles text without clear sections', async () => {
      const resumeText = 'Just some random text without proper structure'

      const result = await extractDataFromText(resumeText)

      expect(result).toBeDefined()
      expect(result.personal_info).toBeDefined()
      expect(result.experience).toBeDefined()
      expect(result.skills).toBeDefined()
      expect(result.education).toBeDefined()
    })
  })
})