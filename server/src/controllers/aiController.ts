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


Here is the data of teachers if the user asks for the teachers data then parse this json data into natural language and provide the reponse - 
const teacherData = [

  [{
  "_id": {
    "$oid": "67ab2b1fea44837d17150305"
  },
  "name": "Test Admin",
  "email": "admin@gmail.com",
  "password": "$2a$10$wW96WqDT7Ur4392iaLOkGu0/X7Ipzmz3KXBAvsllEt0DFaOXCohQW",
  "role": "admin",
  "phone": "1234567890",
  "subjects": [],
  "remuneration": 0,
  "active": true,
 
  "createdAt": {
    "$date": "2025-02-11T10:49:03.551Z"
  },
  "updatedAt": {
    "$date": "2025-03-24T15:32:25.372Z"
  },
  "__v": 79,
  "availability": [],
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": []
},
{
  "_id": {
    "$oid": "67e0628de655fc06159460eb"
  },
  "name": "Mrs. Deepti Jeetu Janjani",
  "email": "deepti@gmail.com",
  "password": "$2a$10$1D3frxaFRyMAHrv3qQ.SX.yohUWCmbqlgnPYTcUhsw9zqCRHlQMsS",
  "role": "teacher",
  "phone": "123-456-7892",
  "department": "Computer Science",
  "subjects": [
    "ML",
    "AI",
    "AOA"
  ],
  "availability": [
    "Monday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:41.312Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:41.312Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628de655fc06159460ed"
  },
  "name": "Mrs.Monal Nilesh Malge",
  "email": "monal@gmail.com",
  "password": "$2a$10$sZbvM9QXDljp3rJkaxRot.YEUZ3QLOfMQu1QpMG5XvLuxe/O4q77O",
  "role": "teacher",
  "phone": "123-456-7893",
  "department": "Computer Science",
  "subjects": [
    "DLCOA",
    "MP"
  ],
  "availability": [
    "Tuesday",
    "Thursday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:41.507Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:41.507Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628de655fc06159460ef"
  },
  "name": "Mrs. Irin Anna Solomone",
  "email": "irun@gmail.com",
  "password": "$2a$10$AbmbZrl5MTNB/p7/BJlxu.3Q/loovEfUcy1i2.MCq6LKllm6T5uEy",
  "role": "teacher",
  "phone": "123-456-7894",
  "department": "Computer Science",
  "subjects": [
    "DGST",
    "CS"
  ],
  "availability": [
    "Tuesday",
    "Wednesday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:41.683Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:41.683Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628de655fc06159460f1"
  },
  "name": "Mrs. Amita Priyadarshan Suke",
  "email": "amita@gmail.com",
  "password": "$2a$10$YMZv7evjGfwb9oLiMj8zXuemtIBP/0kzfmr.fwy3zQ2ouZQZbpqUi",
  "role": "teacher",
  "phone": "123-456-7895",
  "department": "Computer Science",
  "subjects": [
    "AI",
    "DBMS"
  ],
  "availability": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Friday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:41.869Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:38:18.958Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628ee655fc06159460f3"
  },
  "name": "Mrs. Anjali Devi Milind Patil",
  "email": "anjali@gmail.com",
  "password": "$2a$10$s6.ZBdMUHuBBSfwC.u20VuFaFE19o3.WRGuSlsJaaY37B4y12USe.",
  "role": "teacher",
  "phone": "123-456-7896",
  "department": "Computer Science",
  "subjects": [
    "SBLC",
    "OS"
  ],
  "availability": [
    "Monday",
    "Tuesday",
    "Friday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:42.045Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:42.045Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628ee655fc06159460f5"
  },
  "name": "Mrs. Aarti Raman Sonawane",
  "email": "aarti@gmail.com",
  "password": "$2a$10$ASXeQP48RgQviWEf.UDAje6PNBMNyRI.uz.q7fTTKIOEC4GwnlBqS",
  "role": "teacher",
  "phone": "123-456-7897",
  "department": "Computer Science",
  "subjects": [
    "MP",
    "OS"
  ],
  "availability": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:42.215Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:42.215Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628ee655fc06159460f7"
  },
  "name": "Mrs. Poonam Amit Kamble",
  "email": "poonam@gmail.com",
  "password": "$2a$10$GCqXe8V5/CN0rdw9rsuKLOInNp5Q35hLE1p6HBVrITN1WU5WSe/fu",
  "role": "teacher",
  "phone": "123-456-7897",
  "department": "Computer Science",
  "subjects": [
    "Python",
    "DTS"
  ],
  "availability": [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:42.382Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:42.382Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628ee655fc06159460f9"
  },
  "name": "Mrs. Shraddha Anant Narhari(Kawji)",
  "email": "shraddha@gmail.com",
  "password": "$2a$10$xLj85oXTQUjtSRBlBwCiJenE7Yh8UM0SiKOvPH7FD2RoqA1Glw4/2",
  "role": "teacher",
  "phone": "123-456-7897",
  "department": "Computer Science",
  "subjects": [
    "DGST",
    "CG"
  ],
  "availability": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:42.538Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:42.538Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628ee655fc06159460fb"
  },
  "name": "Mrs. Aarpita",
  "email": "aarpita@gmail.com",
  "password": "$2a$10$lb29aHKEkdpW2tVFscdx.OYFSz.h19H.Jsiv13XRT5gpn4wutJWl2",
  "role": "teacher",
  "phone": "123-456-7897",
  "department": "Computer Science",
  "subjects": [
    "AOA",
    "Maths"
  ],
  "availability": [
    "Monday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:42.701Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:42.701Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e0628ee655fc06159460fd"
  },
  "name": "Mr Mazhar Sheikh",
  "email": "mazhar@gmail.com",
  "password": "$2a$10$bcUobcCpRa1cK.m56uDLyu/.YthtHxqAdrVMgSq6ArEeePvLOa1Im",
  "role": "teacher",
  "phone": "123-456-7897",
  "department": "Computer Science",
  "subjects": [
    "Maths"
  ],
  "availability": [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Saturday",
    "Sunday"
  ],
  "remuneration": 1000,
  "active": true,
  "subjectExpertise": [],
  "subjectPreferences": [],
  "timePreferences": [],
  "tokens": [],
  "createdAt": {
    "$date": "2025-03-23T19:35:42.863Z"
  },
  "updatedAt": {
    "$date": "2025-03-23T19:35:42.863Z"
  },
  "__v": 0
}
];


Here is the data of exams if the user asks for the exams data then parse this json data into natural language and provide the reponse -
Match the id of techers to the exams data below to understand which teacher is allocated to which exam -
[{
  "_id": {
    "$oid": "67e067ac8eec388cf4f93066"
  },
  "branch": "Computer Science",
  "semester": 4,
  "examName": "IA1",
  "subject": "Maths",
  "date": {
    "$date": "2025-03-25T00:00:00.000Z"
  },
  "startTime": "06:27",
  "endTime": "09:27",
  "allocatedTeachers": [
    {
      "$oid": "67e0628ee655fc06159460fd"
    },
    {
      "$oid": "67e0628de655fc06159460ed"
    },
    {
      "$oid": "67e0628de655fc06159460ef"
    }
  ],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [
    {
      "number": 1104,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068278eec388cf4f9322d"
      },
      "invigilator": {
        "$oid": "67e0628de655fc06159460f1"
      }
    },
    {
      "number": 909,
      "capacity": 30,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068388eec388cf4f932c3"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460f5"
      }
    },
    {
      "number": 809,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068428eec388cf4f9335b"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460f9"
      }
    }
  ],
  "createdAt": {
    "$date": "2025-03-23T19:57:32.306Z"
  },
  "updatedAt": {
    "$date": "2025-03-24T11:31:43.669Z"
  },
  "__v": 4
},
{
  "_id": {
    "$oid": "67e067bb8eec388cf4f93069"
  },
  "branch": "Computer Science",
  "semester": 4,
  "examName": "IA1",
  "subject": "AOA",
  "date": {
    "$date": "2025-03-27T00:00:00.000Z"
  },
  "startTime": "10:27",
  "endTime": "00:27",
  "allocatedTeachers": [
    {
      "$oid": "67e0628de655fc06159460eb"
    },
    {
      "$oid": "67e0628ee655fc06159460fb"
    }
  ],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [
    {
      "number": 909,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068598eec388cf4f933fa"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460f7"
      }
    },
    {
      "number": 1102,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068658eec388cf4f93490"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460f9"
      }
    }
  ],
  "createdAt": {
    "$date": "2025-03-23T19:57:47.168Z"
  },
  "updatedAt": {
    "$date": "2025-03-24T11:31:43.817Z"
  },
  "__v": 3
},
{
  "_id": {
    "$oid": "67e067d08eec388cf4f9306c"
  },
  "branch": "Computer Science",
  "semester": 4,
  "examName": "IA1",
  "subject": "DBMS",
  "date": {
    "$date": "2025-03-28T00:00:00.000Z"
  },
  "startTime": "00:28",
  "endTime": "10:28",
  "allocatedTeachers": [
    {
      "$oid": "67e0628de655fc06159460f1"
    },
    {
      "$oid": "67e0628ee655fc06159460f7"
    }
  ],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [
    {
      "number": 404,
      "capacity": 30,
      "location": "Old Building",
      "_id": {
        "$oid": "67e0687b8eec388cf4f93532"
      },
      "invigilator": {
        "$oid": "67e0628de655fc06159460eb"
      }
    },
    {
      "number": 405,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e0688c8eec388cf4f935c8"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460fb"
      }
    }
  ],
  "createdAt": {
    "$date": "2025-03-23T19:58:08.120Z"
  },
  "updatedAt": {
    "$date": "2025-03-24T11:35:55.809Z"
  },
  "__v": 4
},
{
  "_id": {
    "$oid": "67e067e58eec388cf4f9306f"
  },
  "branch": "Computer Science",
  "semester": 4,
  "examName": "IA1",
  "subject": "OS",
  "date": {
    "$date": "2025-03-28T00:00:00.000Z"
  },
  "startTime": "10:36",
  "endTime": "10:35",
  "allocatedTeachers": [
    {
      "$oid": "67e0628ee655fc06159460f3"
    },
    {
      "$oid": "67e0628de655fc06159460eb"
    },
    {
      "$oid": "67e0628ee655fc06159460f7"
    }
  ],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [
    {
      "number": 1101,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068a58eec388cf4f9366e"
      },
      "invigilator": {
        "$oid": "67e0628de655fc06159460f1"
      }
    },
    {
      "number": 809,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068b08eec388cf4f93704"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460fb"
      }
    },
    {
      "number": 909,
      "capacity": 30,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068c48eec388cf4f9379c"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460fb"
      }
    }
  ],
  "createdAt": {
    "$date": "2025-03-23T19:58:29.224Z"
  },
  "updatedAt": {
    "$date": "2025-03-24T11:35:55.930Z"
  },
  "__v": 5
},
{
  "_id": {
    "$oid": "67e0680e8eec388cf4f93074"
  },
  "branch": "Computer Science",
  "semester": 4,
  "examName": "IA1",
  "subject": "MP",
  "date": {
    "$date": "2025-03-31T00:00:00.000Z"
  },
  "startTime": "11:29",
  "endTime": "02:29",
  "allocatedTeachers": [
    {
      "$oid": "67e0628ee655fc06159460f5"
    },
    {
      "$oid": "67e0628ee655fc06159460f3"
    }
  ],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [
    {
      "number": 908,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e068e48eec388cf4f93849"
      },
      "invigilator": {
        "$oid": "67e0628ee655fc06159460f9"
      }
    },
    {
      "number": 909,
      "capacity": 20,
      "location": "Old Building",
      "_id": {
        "$oid": "67e069028eec388cf4f93a0c"
      },
      "invigilator": {
        "$oid": "67e0628de655fc06159460f1"
      }
    }
  ],
  "createdAt": {
    "$date": "2025-03-23T19:59:10.754Z"
  },
  "updatedAt": {
    "$date": "2025-03-24T11:31:44.216Z"
  },
  "__v": 5
},
{
  "_id": {
    "$oid": "67e217d520fb9e08a69130ba"
  },
  "branch": "Computer Science",
  "semester": 5,
  "examName": "IA2",
  "subject": "Maths",
  "date": {
    "$date": "2025-03-25T02:41:25.823Z"
  },
  "startTime": "12:00",
  "endTime": "14:00",
  "allocatedTeachers": [
    {
      "$oid": "67e0628ee655fc06159460fd"
    }
  ],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [
    {
      "number": 101,
      "capacity": 2,
      "location": "123",
      "_id": {
        "$oid": "67e22697d6f99fa4e9335123"
      },
      "invigilator": {
        "$oid": "67e0628de655fc06159460ed"
      }
    }
  ],
  "createdAt": {
    "$date": "2025-03-25T02:41:25.839Z"
  },
  "updatedAt": {
    "$date": "2025-03-25T03:44:39.999Z"
  },
  "__v": 3
},
{
  "_id": {
    "$oid": "67e21892768988a46d8c889c"
  },
  "branch": "Computer Science",
  "semester": 5,
  "examName": "IA2",
  "subject": "AOA",
  "date": {
    "$date": "2025-03-25T02:44:34.031Z"
  },
  "startTime": "14:00",
  "endTime": "16:00",
  "allocatedTeachers": [],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [],
  "createdAt": {
    "$date": "2025-03-25T02:44:34.044Z"
  },
  "updatedAt": {
    "$date": "2025-03-25T02:44:34.044Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67e21b03768988a46d8c88bc"
  },
  "branch": "Computer Science",
  "semester": 4,
  "examName": "IA2",
  "subject": "OS",
  "date": {
    "$date": "2025-03-25T02:54:59.544Z"
  },
  "startTime": "14:00",
  "endTime": "17:00",
  "allocatedTeachers": [],
  "createdBy": {
    "$oid": "000000000000000000000000"
  },
  "status": "scheduled",
  "blocks": [],
  "createdAt": {
    "$date": "2025-03-25T02:54:59.549Z"
  },
  "updatedAt": {
    "$date": "2025-03-25T02:54:59.549Z"
  },
  "__v": 0
}]

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