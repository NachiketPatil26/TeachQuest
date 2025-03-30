import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
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

export default function TeacherDuties() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDuties = async () => {
      try {
        setLoading(true);
        const data = await getTeacherUpcomingDuties();
        setDuties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load duties');
      } finally {
        setLoading(false);
      }
    };

    fetchDuties();
  }, []);

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

  if (error) {
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
                <p className="text-sm text-red-700">{error}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Duties</h1>

          {duties.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No duties found.</p>
          ) : (
            <div className="space-y-4">
              {duties.map((duty) => {
                const block = duty.blocks?.find(b => b.invigilator._id === user?.id);
                
                return (
                  <div
                    key={duty._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/teacher/duties/${duty._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-medium text-gray-900">{duty.subject}</h3>
                          {block && (
                            <span className="bg-[#F0F7F4] px-3 py-1 rounded-md text-sm font-medium text-[#2C3E50] border border-[#D4ECDD]">
                              Block {block.number}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(duty.date).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{duty.startTime} - {duty.endTime}</span>
                          </div>
                          
                          {block && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>Block {block.number} - {block.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 