import React, { useState } from 'react';
import { MessageSquare, Send, HelpCircle } from 'lucide-react';
import TeachQuestLogo from '../../assets/TeachQuestLogo.png';
import { useNavigate } from 'react-router-dom';

interface FAQ {
  question: string;
  answer: string;
}

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'faq'>('contact');

  const faqs: FAQ[] = [
    {
      question: 'How do I report an issue with my exam duty?',
      answer: 'You can submit a report after your duty is completed using the Reports page. If there is an urgent issue, please use the contact form on this page.'
    },
    {
      question: 'When will I receive payment for my exam duties?',
      answer: 'Payments are typically processed within 30 days after the completion of the exam. You can check the status of your payments in the Remuneration page.'
    },
    {
      question: 'How can I update my availability for exam duties?',
      answer: 'You can update your availability by visiting your Profile page and selecting the "Availability" tab.'
    },
    {
      question: 'What should I do if I cannot attend an assigned duty?',
      answer: 'Please contact the admin as soon as possible through this support page. Provide details about the duty and reason for unavailability.'
    },
    {
      question: 'How are exam duties allocated?',
      answer: 'Exam duties are allocated based on your subject expertise, availability, and workload balance. The system tries to ensure fair distribution among all teachers.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real implementation, this would call an API endpoint
      // await api.post('/api/support/contact', { subject, message });
      console.log('Support request submitted:', { subject, message });
      
      // Reset form and show success message
      setSubject('');
      setMessage('');
      setSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting support request:', error);
    }
  };

  return (
    <div className="relative bg-[#F0F7F4] min-h-screen">
      {/* Fixed Navbar with White Background */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center justify-between">
        {/* Left Side: Logo & Heading */}
        <div className="flex items-center gap-3">
          <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/teacher/dashboard')} 
            className="text-gray-800 hover:text-gray-900 font-medium"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/teacher/duties')} 
            className="text-gray-800 hover:text-gray-900 font-medium"
          >
            Duties
          </button>
          <button 
            onClick={() => navigate('/teacher/schedule')} 
            className="text-gray-800 hover:text-gray-900 font-medium"
          >
            Schedule
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Section Title with Icon */}
        <div className="flex items-center mb-6">
          <MessageSquare className="w-8 h-8 text-[#9FC0AE] mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Help & Support</h2>
        </div>

        <p className="text-gray-700 mb-6">
          Need assistance with the exam management system? Contact our support team or check our frequently asked questions.
        </p>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('contact')}
                className={`${activeTab === 'contact' ? 'border-[#9FC0AE] text-[#9FC0AE]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Contact Support
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`${activeTab === 'faq' ? 'border-[#9FC0AE] text-[#9FC0AE]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                FAQ
              </button>
            </nav>
          </div>
        </div>

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support Team</h3>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your message has been sent. We'll get back to you soon.</span>
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </form>
          </div>
        )}

        {/* FAQ Section */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start">
                    <HelpCircle className="w-5 h-5 text-[#9FC0AE] mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-md font-medium text-gray-900">{faq.question}</h4>
                      <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;