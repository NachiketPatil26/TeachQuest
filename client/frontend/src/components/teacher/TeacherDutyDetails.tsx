import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';
import { getTeacherUpcomingDuties } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Block {
  number: number;
  capacity: number;
  location: string;
  _id: string;
  invigilator: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Duty {
  _id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  blocks?: Block[];
  examName?: string;
  branch?: string;
  semester?: number;
}

export default function TeacherDutyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [duty, setDuty] = useState<Duty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDutyDetails = async () => {
      try {
        setLoading(true);
        const duties = await getTeacherUpcomingDuties();
        const foundDuty = duties.find((d: Duty) => d._id === id);
        
        if (!foundDuty) {
          setError('Duty not found');
          return;
        }
        
        setDuty(foundDuty);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load duty details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDutyDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !duty) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || 'Duty not found'}</p>
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const block = duty.blocks?.find(b => b.invigilator._id === user?.id);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{duty.subject}</h1>
            {block && (
              <div className="bg-[#F0F7F4] px-4 py-2 rounded-lg border border-[#D4ECDD]">
                <span className="text-lg font-semibold text-[#2C3E50]">Block {block.number}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{new Date(duty.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>{duty.startTime} - {duty.endTime}</span>
              </div>
              
              {block && (
                <>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>Block {block.number} - {block.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-2" />
                    <span>Capacity: {block.capacity} students</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  duty.status === 'scheduled' 
                    ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' 
                    : duty.status === 'in-progress' 
                    ? 'bg-blue-50 text-blue-700 ring-blue-600/20' 
                    : 'bg-green-50 text-green-700 ring-green-600/20'
                }`}>
                  {duty.status === 'scheduled' 
                    ? 'Scheduled' 
                    : duty.status === 'in-progress' 
                    ? 'In Progress' 
                    : 'Completed'}
                </span>
              </div>

              {duty.examName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Exam Name</h3>
                  <p className="text-sm text-gray-900">{duty.examName}</p>
                </div>
              )}

              {duty.branch && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Branch</h3>
                  <p className="text-sm text-gray-900">{duty.branch}</p>
                </div>
              )}

              {duty.semester && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Semester</h3>
                  <p className="text-sm text-gray-900">{duty.semester}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 