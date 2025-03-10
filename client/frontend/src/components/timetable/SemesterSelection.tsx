import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import TeachQuestLogo from '../../assets/TeachQuestLogo.png';

export default function SemesterSelection() {
  const navigate = useNavigate();
  const { branch } = useParams<{ branch: string }>();
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Array of semesters from 1 to 8
  const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

  const handleSemesterSelect = (semester: string) => {
    setSelectedSemester(semester);
  };

  const handleContinue = () => {
    if (!selectedSemester) {
      setError('Please select a semester');
      return;
    }

    // Set loading state to true before navigation
    setLoading(true);
    
    // Navigate to the ExamTimetable page with branch and semester parameters
    navigate(`/admin/timetable/${branch}/${selectedSemester}`);
  };

  const handleBack = () => {
    // Navigate back to the admin dashboard
    navigate('/admin/dashboard');
  };

  return (
    <div className="relative bg-[#F0F7F4] min-h-screen">
      {/* Fixed Navbar with White Background */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center justify-between">
        {/* Left Side: Logo & Heading */}
        <div className="flex items-center gap-3">
          <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
          <h1 className="text-2xl font-bold text-gray-900">Semester Selection</h1>
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>

      {/* Page Content (Padding to prevent overlap with navbar) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Heading with Calendar Icon */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#9FC0AE]" />
          Select Semester for {branch}
        </h2>

        <p className="text-gray-700 mb-6">
          Please select the semester for which you want to create an exam timetable.
        </p>

        {/* White Section for Semester Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Semesters</h3>

          {/* Semester Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {semesters.map((semester) => (
              <button
                key={semester}
                onClick={() => handleSemesterSelect(semester)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedSemester === semester
                    ? 'border-[#9FC0AE] bg-[#E8EFEB] text-[#2D6A4F]'
                    : 'border-gray-200 hover:border-[#9FC0AE] hover:bg-[#F0F7F4]'
                }`}
              >
                <div className="text-center">
                  <span className="block text-xl font-bold">Semester {semester}</span>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedSemester || loading}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                !selectedSemester || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#9FC0AE] hover:bg-[#8BAF9A]'
              }`}
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}