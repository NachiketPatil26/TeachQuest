



import { useState, useEffect } from 'react';
import { Calendar, Loader } from "lucide-react";
import TeachQuestLogo from '../../assets/TeachQuestLogo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTeacherAllocations } from '../../services/api';

interface Duty {
  _id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  blocks?: Array<{
    number: number;
    capacity: number;
    location: string;
    invigilator?: string;
  }>;
  status: 'scheduled' | 'in-progress' | 'completed';
}

const DutiesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherDuties = async () => {
      try {
        setLoading(true);
        const allocations = await getTeacherAllocations();
        setDuties(allocations);
        setError(null);
      } catch (err) {
        console.error('Error fetching teacher duties:', err);
        setError('Failed to load duties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeacherDuties();
    }
  }, [user]);

  return (
    <div className="relative bg-[#F0F7F4] min-h-screen"> {/* Light pastel green background */}
      
      {/* Fixed Navbar with White Background */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center justify-between">
        {/* Left Side: Logo & Heading */}
        <div className="flex items-center gap-3">
          <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
          <h1 className="text-2xl font-bold text-gray-900">My Duties</h1>
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
            onClick={() => navigate('/teacher/timetable')} 
            className="text-gray-800 hover:text-gray-900 font-medium"
          >
            Timetable
          </button>
          <button 
            onClick={() => navigate('/teacher/settings')} 
            className="text-gray-800 hover:text-gray-900 font-medium"
          >
            Settings
          </button>
          <button 
            onClick={() => {
              // Implement logout functionality
              // This would typically involve clearing auth state
              navigate('/login');
            }} 
            className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content (Padding to prevent overlap with navbar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Heading with Calendar Icon */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#9FC0AE]" /> {/* Calendar Icon in Pastel Green */}
          Your Assigned Exam Duties
        </h2>

        <p className="text-gray-700 mb-6">
          Below is a list of your assigned duties for the upcoming exams. Please review your assignments carefully.
        </p>

        {/* White Section for the Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Duty Schedule</h3>

          {/* Stylish Table for Duties */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-[#B8D8C4] text-gray-900 text-left"> {/* Pastel green header */}
                  <th className="py-3 px-6 font-semibold">Subject</th>
                  <th className="py-3 px-6 font-semibold">Room</th>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <Loader className="animate-spin h-5 w-5 text-[#9FC0AE]" />
                        <span>Loading duties...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-red-500">{error}</td>
                  </tr>
                ) : duties.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No duties assigned yet.</td>
                  </tr>
                ) : (
                  duties.map((duty) => {
                    // Find the room from blocks if available
                    const room = duty.blocks && duty.blocks.length > 0 
                      ? duty.blocks.find(block => block.invigilator === user?.id)?.location || duty.blocks[0].location
                      : 'Not specified';
                    
                    return (
                      <tr
                        key={duty._id}
                        className="border-t border-gray-200 hover:bg-[#D6E8DB] transition-all duration-200 ease-in-out"
                      >
                        <td className="py-4 px-6">{duty.subject}</td>
                        <td className="py-4 px-6">{room}</td>
                        <td className="py-4 px-6">{new Date(duty.date).toLocaleDateString()}</td>
                        <td className="py-4 px-6">{`${duty.startTime} - ${duty.endTime}`}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div> {/* End White Section */}
      </div>

    </div>
  );
};


export default DutiesPage;



