import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Block {
  number: number;
  capacity: number;
  location: string;
  invigilator?: string;
}

interface Duty {
  _id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  blocks?: Block[];
  status: 'scheduled' | 'in-progress' | 'completed';
  examName?: string;
  branch?: string;
  semester?: number;
}

interface DutyDetailModalProps {
  duty: Duty;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function DutyDetailModal({ duty, isOpen, onClose, userId }: DutyDetailModalProps) {
  // Find the specific block assigned to this teacher if available
  const [assignedBlock, setAssignedBlock] = useState<Block | undefined>();

  useEffect(() => {
    if (duty.blocks && duty.blocks.length > 0 && userId) {
      const teacherBlock = duty.blocks.find(block => block.invigilator === userId);
      setAssignedBlock(teacherBlock);
    }
  }, [duty, userId]);

  if (!isOpen) return null;

  // Format the date
  const formattedDate = new Date(duty.date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Prevent the click from bubbling up to parent elements
        // This ensures clicks on the modal background don't trigger navigation
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Duty Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Duty Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-medium">{duty.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{duty.startTime} - {duty.endTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(duty.status)}`}>
              {duty.status.charAt(0).toUpperCase() + duty.status.slice(1)}
            </span>
          </div>
          {duty.examName && (
            <div>
              <p className="text-sm text-gray-500">Exam</p>
              <p className="font-medium">{duty.examName}</p>
            </div>
          )}
          {duty.branch && (
            <div>
              <p className="text-sm text-gray-500">Branch</p>
              <p className="font-medium">{duty.branch}</p>
            </div>
          )}
          {duty.semester && (
            <div>
              <p className="text-sm text-gray-500">Semester</p>
              <p className="font-medium">{duty.semester}</p>
            </div>
          )}
        </div>

        {/* Your Assignment Section */}
        {assignedBlock && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Your Assignment</h3>
            <div className="bg-[#F0F7F4] p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Block Number</p>
                  <p className="font-medium">{assignedBlock.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{assignedBlock.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{assignedBlock.capacity} students</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Blocks Section */}
        {duty.blocks && duty.blocks.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">All Exam Blocks</h3>
            <div className="space-y-3">
              {duty.blocks.map((block) => (
                <div 
                  key={block.number} 
                  className={`border rounded-md p-3 ${assignedBlock && block.number === assignedBlock.number ? 'border-[#9FC0AE] bg-[#F0F7F4]' : ''}`}
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Block</p>
                      <p className="font-medium">{block.number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{block.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">{block.capacity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions Section */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Instructions</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Please arrive at your assigned location 30 minutes before the exam start time.</li>
            <li>Ensure you have your ID card with you for verification.</li>
            <li>Report any issues or concerns to the exam coordinator immediately.</li>
            <li>Follow all examination protocols as per the institution guidelines.</li>
            <li>Submit your attendance report after the completion of your duty.</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}