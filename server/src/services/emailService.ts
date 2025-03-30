import nodemailer from 'nodemailer';
import { IExam } from '../models/Exam';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// HTML template for exam allocation email
const createExamAllocationEmail = (teacherName: string, exam: IExam, blockNumber?: number) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exam Invigilation Assignment</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #4a90e2;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 20px;
          }
          .exam-details {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          .exam-details h3 {
            color: #4a90e2;
            margin-top: 0;
  }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #eee;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4a90e2;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px 0;
          }
          .important {
            color: #e74c3c;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Exam Invigilation Assignment</h2>
          </div>
          
          <div class="content">
            <p>Dear ${teacherName},</p>
            
            <p>You have been assigned to invigilate an upcoming examination. Please review the details below:</p>
            
            <div class="exam-details">
              <h3>Exam Information</h3>
              <p><strong>Subject:</strong> ${exam.subject}</p>
              <p><strong>Date:</strong> ${new Date(exam.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${exam.startTime} - ${exam.endTime}</p>
              ${blockNumber ? `<p><strong>Block Number:</strong> ${blockNumber}</p>` : ''}
              <p><strong>Location:</strong> ${exam.blocks?.find(b => b.number === blockNumber)?.location || 'To be announced'}</p>
            </div>
            
            <p class="important">Please ensure you arrive at least 30 minutes before the exam start time.</p>
            
            <p>If you have any questions or concerns about this assignment, please contact your department head.</p>
            
            <p>Best regards,<br>Exam Management Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const sendExamAllocationEmail = async (teacherEmail: string, teacherName: string, exam: IExam, blockNumber?: number) => {
  try {
    const mailOptions: EmailOptions = {
      to: teacherEmail,
      subject: `Exam Invigilation Assignment - ${exam.subject}`,
      html: createExamAllocationEmail(teacherName, exam, blockNumber)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${teacherEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
}; 