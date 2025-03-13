import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import TeachQuestLogo from '../../assets/TeachQuestLogo.png';
import api from '../../services/api';

export default function ExamNameSelection() {
  const navigate = useNavigate();
  const { branch, semester } = useParams<{ branch: string; semester: string }>();
  const [selectedExamName, setSelectedExamName] = useState<string>('');
  const [newExamName, setNewExamName] = useState<string>('');
  const [examNames, setExamNames] = useState<string[]>(['IA1', 'IA2', 'ESE']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddExam, setShowAddExam] = useState(false);

  useEffect(() => {
    // In a real implementation, you would fetch existing exam names from the API
    // For now, we'll use a static list
    setLoading(false);
  }, [branch, semester]);

  const handleExamNameSelect = (examName: string) => {
    setSelectedExamName(examName);
  };

  const handleAddExamName = () => {
    if (newExamName.trim()) {
      setExamNames([...examNames, newExamName.trim()]);
      setSelectedExamName(newExamName.trim());
      setNewExamName('');
      setShowAddExam(false);
    } else {
      setError('Please enter a valid exam name');
    }
  };

  const handleContinue = () => {
    if (!selectedExamName) {
      setError('Please select an exam name');
      return;
    }

    // Set loading state to true before navigation
    setLoading(true);
    
    // Navigate to the ExamTimetable page with branch, semester, and examName parameters
    navigate(`/admin/timetable/${branch}/${semester}/${selectedExamName}`);
  };

  const handleBack = () => {
    // Navigate back to the semester selection
    navigate(`/admin/timetable/${branch}`);
  };

  return (
    <div className="relative bg-[#F0F7F4] min-h-screen">
      {/* Fixed Navbar with White Background */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center justify-between">
        {/* Left Side: Logo & Heading */}
        <div className="flex items-center gap-3">
          <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
          <h1 className="text-2xl font-bold text-gray-900">Exam Name Selection</h1>
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
          Select Exam Name for Semester {semester} - {branch}
        </h2>

        <p className="text-gray-700 mb-6">
          Please select the exam name for which you want to create an exam timetable.
        </p>

        {/* White Section for Exam Name Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Exam Names</h3>

          {/* Exam Name Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {examNames.map((examName) => (
              <button
                key={examName}
                onClick={() => handleExamNameSelect(examName)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedExamName === examName
                    ? 'border-[#9FC0AE] bg-[#E8EFEB] text-[#2D6A4F]'
                    : 'border-gray-200 hover:border-[#9FC0AE] hover:bg-[#F0F7F4]'
                }`}
              >
                <div className="text-center">
                  <span className="block text-xl font-bold">{examName}</span>
                </div>
              </button>
            ))}

            {/* Add New Exam Button */}
            <button
              onClick={() => setShowAddExam(true)}
              className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#9FC0AE] hover:bg-[#F0F7F4] transition-all duration-200"
            >
              <div className="text-center">
                <span className="block text-xl font-bold text-gray-500">+ Add New</span>
              </div>
            </button>
          </div>

          {/* Add New Exam Form */}
          {showAddExam && (
            <div className="mb-6 p-4 border-2 border-[#9FC0AE] rounded-lg bg-[#F0F7F4]">
              <h4 className="font-medium text-gray-900 mb-2">Add New Exam Name</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  placeholder="Enter exam name (e.g., IA3, ESE)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9FC0AE]"
                />
                <button
                  onClick={handleAddExamName}
                  className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A]"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddExam(false);
                    setNewExamName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedExamName || loading}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                !selectedExamName || loading
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