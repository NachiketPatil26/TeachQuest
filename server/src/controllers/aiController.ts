import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Exam from '../models/Exam';
import User from '../models/User';
import GroqService from '../services/groqService';

// Define the system prompt template
const SYSTEM_PROMPT = `
You are an AI assistant for TeachQuest your name is NachiGPT, an exam management system. Your primary task is to help users with exam management tasks and respond to general inquiries.

For exam management tasks, you can:
1. Create a new exam
2. Get exam information
3. Auto-allocate teachers to exams
4. Add blocks to exams
5. Update exam details

For general chat interactions, provide helpful and informative responses while maintaining context.

When responding to exam-related requests, format your response as a JSON object with this structure:
{
  "intent": "createExam|getExams|autoAllocateTeachers|addBlock|updateExam|chat",
  "entities": {
    "subject": "subject name",
    "semester": number,
    "branch": "branch name",
    "examName": "exam name",
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "blockNumber": number,
    "blockCapacity": number,
    "blockLocation": "location"
  },
  "confidence": 0.95,
  "message": "Human-readable response"
}

For general chat interactions, use this structure:
{
  "intent": "chat",
  "message": "Your helpful response here",
  "confidence": 0.95
}


Remember to always respond in a friendly and helpful manner. If you don't understand a request, politely ask for more details or clarify your question.
Always provide a response, even for simple greetings or questions.
`;

// Path to the Deepseek R1 model script
const MODEL_SCRIPT_PATH = path.join(__dirname, '../../scripts/run_deepseek.py');

/**
 * Process a request using the Groq API
 */
export const processAiRequest = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { input } = req.body;
    
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ message: 'Input text is required' });
    }
    
    // Trim and normalize input to improve cache hit rate
    const normalizedInput = input.trim();
    
    console.log(`Processing AI request [${normalizedInput.substring(0, 30)}...]`);
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key is not configured');
    }

    // Use Groq service
    const groqService = GroqService.getInstance();
    const result = await groqService.generateResponse(SYSTEM_PROMPT, normalizedInput);
    
    // Check if response is JSON (starts with {) or plain text
    let parsedResponse;
    const trimmedResult = result.trim();
    
    if (trimmedResult.startsWith('{')) {
      // Attempt to parse as JSON for exam-related commands
      try {
        parsedResponse = JSON.parse(trimmedResult);
      } catch (error) {
        console.error('Failed to parse model response as JSON:', error);
        return res.status(500).json({ 
          message: 'The AI model returned an invalid JSON format',
          rawResponse: result
        });
      }
    } else {
      // Handle as plain text for chat messages
      parsedResponse = {
        intent: 'chat',
        message: trimmedResult,
        confidence: 1.0
      };
    }
    
    // Execute the appropriate action based on the intent
    const actionResult = await executeAction(parsedResponse, req.user);
    
    // Log performance metrics
    const processingTime = Date.now() - startTime;
    console.log(`AI request processed in ${processingTime}ms`);
    
    // Return the result
    return res.json({
      message: parsedResponse.message || 'Request processed successfully',
      result: actionResult,
      intent: parsedResponse.intent,
      entities: parsedResponse.entities,
      thinking: parsedResponse.thinking || undefined
    });
    
  } catch (error) {
    console.error('AI processing error:', error);
    const processingTime = Date.now() - startTime;
    console.log(`AI request failed in ${processingTime}ms`);
    
    return res.status(500).json({ 
      message: 'Failed to process AI request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Call the local Deepseek R1 model with the given input
 */
// Simple in-memory cache for common queries
const responseCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 50; // Maximum number of items to keep in cache

const callLocalModel = async (input: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Generate a cache key from the input
    const cacheKey = input.trim().toLowerCase();
    
    // Check if we have a cached response
    if (responseCache.has(cacheKey)) {
      console.log('Using cached response for:', input.substring(0, 30) + '...');
      resolve(responseCache.get(cacheKey) as string);
      return;
    }
    
    // Check if the model script exists
    if (!fs.existsSync(MODEL_SCRIPT_PATH)) {
      reject(new Error(`Model script not found at ${MODEL_SCRIPT_PATH}`));
      return;
    }
    
    // Prepare the prompt with system instructions and user input
    const prompt = {
      system: SYSTEM_PROMPT,
      user: input
    };
    
    // Spawn the Python process to run the model with higher priority
    const pythonProcess = spawn('python3', [
      MODEL_SCRIPT_PATH,
      '--prompt', JSON.stringify(prompt),
      '--model', 'deepseek-r1:1.5b',  // Explicitly specify the model name
      '--max-tokens', '1024'          // Limit token generation for faster responses
    ], { 
      // Set higher process priority
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let outputData = '';
    let errorData = '';
    
    // Set a reduced timeout for the process (20 seconds instead of 30)
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Model process timed out after 20 seconds'));
    }, 60000);
    
    // Collect stdout data
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });
    
    // Collect stderr data
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('Model stderr:', data.toString());
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      // Check if we have valid JSON output even if the process exited with an error
      if (outputData.trim()) {
        try {
          // Try to parse the output as JSON
          const jsonOutput = JSON.parse(outputData.trim());
          
          // If it's an error response from our script, format it nicely
          if (jsonOutput.intent === 'error') {
            console.warn('Model returned error:', jsonOutput.message);
            resolve(JSON.stringify(jsonOutput));
            return;
          }
          
          // Valid JSON output, cache it before resolving
          if (responseCache.size >= CACHE_SIZE_LIMIT) {
            // Remove oldest entry if cache is full
            const firstKey = responseCache.keys().next().value;
            responseCache.delete(firstKey);
          }
          responseCache.set(cacheKey, outputData.trim());
          
          resolve(outputData.trim());
          return;
        } catch (e) {
          // Not valid JSON, continue with normal error handling
        }
      }
      
      if (code !== 0) {
        // Check for specific Ollama connection errors
        if (errorData.includes('Ollama service is not running') || 
            errorData.includes('Error calling Ollama API')) {
          const errorResponse = JSON.stringify({
            intent: 'error',
            message: 'AI service is currently unavailable',
            error: errorData,
            suggestion: 'Please try again later or contact system administrator'
          });
          resolve(errorResponse);
        } else {
          reject(new Error(`Model process exited with code ${code}: ${errorData}`));
        }
        return;
      }
      
      resolve(outputData.trim());
    });
    
    // Handle process errors
    pythonProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
};

/**
 * Execute the appropriate action based on the parsed intent and entities
 */
const executeAction = async (parsedResponse: any, user: any) => {
  const { intent, entities, message } = parsedResponse;
  
  switch (intent) {
    case 'createExam':
      return await createExam(entities, user);
      
    case 'getExams':
      return await getExams(entities);
      
    case 'autoAllocateTeachers':
      return await autoAllocateTeachers(entities);
      
    case 'addBlock':
      return await addBlock(entities);
      
    case 'updateExam':
      return await updateExam(entities);
      
    case 'chat':
      return { message };
      
    case 'error':
      throw new Error(message || 'An error occurred');
      
    default:
      throw new Error(`Unsupported intent: ${intent}`)
  }
};

/**
 * Create a new exam based on the extracted entities
 */
const createExam = async (entities: any, user: any) => {
  const { subject, semester, branch, examName, date, startTime, endTime } = entities;
  
  // Validate required fields
  if (!subject || !semester || !branch || !examName || !date || !startTime || !endTime) {
    throw new Error('Missing required fields for creating an exam');
  }

  // Process natural language date input
  let examDate: Date;
  try {
    if (typeof date === 'string') {
      const lowerDate = date.toLowerCase();
      if (lowerDate === 'today') {
        examDate = new Date();
      } else if (lowerDate === 'tomorrow') {
        examDate = new Date();
        examDate.setDate(examDate.getDate() + 1);
      } else if (lowerDate.includes('next')) {
        examDate = new Date();
        if (lowerDate.includes('week')) {
          examDate.setDate(examDate.getDate() + 7);
        } else if (lowerDate.includes('month')) {
          examDate.setMonth(examDate.getMonth() + 1);
        }
      } else {
        examDate = new Date(date);
      }
    } else {
      examDate = new Date(date);
    }

    if (isNaN(examDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Ensure the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (examDate < today) {
      throw new Error('Exam date cannot be in the past');
    }
  } catch (error) {
    throw new Error('Please provide a valid date in YYYY-MM-DD format or use natural language like "today", "tomorrow", "next week"');
  }
  
  // Create the exam
  const exam = await Exam.create({
    subject,
    semester,
    branch,
    examName,
    date: examDate,
    startTime,
    endTime,
    status: 'scheduled',
    createdBy: user?.id || '000000000000000000000000' // Default ObjectId if no user
  });
  
  return exam;
};

/**
 * Get exams based on the extracted entities
 */
const getExams = async (entities: any) => {
  const { branch, semester, examName } = entities;
  
  if (!branch) {
    throw new Error('Branch is required to fetch exams');
  }
  
  // Build query object
  const query: any = { branch };
  
  // Add semester to query if provided
  if (semester) {
    query.semester = semester;
  }
  
  // Add examName to query if provided
  if (examName) {
    query.examName = examName;
  }
  
  const exams = await Exam.find(query)
    .populate('allocatedTeachers', 'name email')
    .sort({ date: 1, startTime: 1 });
  
  return exams;
};

/**
 * Auto-allocate teachers to an exam
 */
const autoAllocateTeachers = async (entities: any) => {
  const { examId, subject, semester, branch, examName } = entities;
  
  // Find the exam by ID or by other criteria
  let exam;
  
  if (examId) {
    exam = await Exam.findById(examId);
  } else if (subject && semester && branch && examName) {
    exam = await Exam.findOne({
      subject,
      semester,
      branch,
      examName
    });
  } else {
    throw new Error('Insufficient information to identify the exam');
  }
  
  if (!exam) {
    throw new Error('Exam not found');
  }
  
  // Call the existing auto-allocate function
  const examController = require('./examController');
  
  // Create a mock request and response
  const mockReq = {
    params: { id: exam._id.toString() },
    body: {}
  };
  
  let result;
  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => {
        result = { statusCode: code, ...data };
        return mockRes;
      }
    }),
    json: (data: any) => {
      result = data;
      return mockRes;
    }
  };
  
  // Call the auto-allocate function
  await examController.autoAllocateTeachers(mockReq, mockRes);
  
  return result;
};

/**
 * Add a block to an exam
 */
const addBlock = async (entities: any) => {
  const { examId, subject, semester, branch, examName, blockNumber, blockCapacity, blockLocation } = entities;
  
  // Find the exam by ID or by other criteria
  let exam;
  
  if (examId) {
    exam = await Exam.findById(examId);
  } else if (subject && semester && branch && examName) {
    exam = await Exam.findOne({
      subject,
      semester,
      branch,
      examName
    });
  } else {
    throw new Error('Insufficient information to identify the exam');
  }
  
  if (!exam) {
    throw new Error('Exam not found');
  }
  
  // Validate block data
  if (!blockNumber || !blockCapacity || !blockLocation) {
    throw new Error('Block number, capacity, and location are required');
  }
  
  // Call the existing add block function
  const examController = require('./examController');
  
  // Create a mock request and response
  const mockReq = {
    params: { id: exam._id.toString() },
    body: {
      number: blockNumber,
      capacity: blockCapacity,
      location: blockLocation
    }
  };
  
  let result;
  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => {
        result = { statusCode: code, ...data };
        return mockRes;
      }
    }),
    json: (data: any) => {
      result = data;
      return mockRes;
    }
  };
  
  // Call the add block function
  await examController.addBlock(mockReq, mockRes);
  
  return result;
};

/**
 * Update an exam based on the extracted entities
 */
const updateExam = async (entities: any) => {
  const { examId, subject, semester, branch, examName, date, startTime, endTime } = entities;
  
  // Find the exam by ID or by other criteria
  let exam;
  
  if (examId) {
    exam = await Exam.findById(examId);
  } else if (subject && semester && branch && examName) {
    exam = await Exam.findOne({
      subject,
      semester,
      branch,
      examName
    });
  } else {
    throw new Error('Insufficient information to identify the exam');
  }
  
  if (!exam) {
    throw new Error('Exam not found');
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (date) updateData.date = date;
  if (startTime) updateData.startTime = startTime;
  if (endTime) updateData.endTime = endTime;
  
  // Call the existing update exam function
  const examController = require('./examController');
  
  // Create a mock request and response
  const mockReq = {
    params: { id: exam._id.toString() },
    body: updateData
  };
  
  let result;
  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => {
        result = { statusCode: code, ...data };
        return mockRes;
      }
    }),
    json: (data: any) => {
      result = data;
      return mockRes;
    }
  };
  
  // Call the update exam function
  await examController.updateExam(mockReq, mockRes);
  
  return result;
};

export default {
  processAiRequest
};