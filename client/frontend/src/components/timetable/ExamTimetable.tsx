import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import api from '../../services/api'; 
import {  getExams  } from '../../services/api';
import ExamDetailModal from '../timetable/ExamDetailModal';
import TeachQuestLogo from '../../assets/TeachQuestLogo.png';
interface Subject {
  id: string;
  name: string;
}


interface ExamSlot {
  _id: string;
  subject: string;
  examName: string;
  date: string;
  startTime: string;
  endTime: string;
  allocatedTeachers: string[];
  blocks?: Block[];
}

interface Block {
  number: number;
  capacity: number;
  location: string;
  invigilator?: string | null;
}

export default function ExamTimetable(): React.ReactElement {
  const navigate = useNavigate();
  const { branch, semester, examName } = useParams<{ branch: string; semester: string; examName: string }>();
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [, setCurrentSemester] = useState<string>(semester || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch teachers using API service
        

        // Fetch exam slots using API service
        if (branch && semester) {
          // Modified to include semester parameter
          const examsData = await getExams(branch, Number(semester));
          
          // Filter exam slots by examName if provided
          const filteredExams = examName 
            ? examsData.filter((exam: ExamSlot) => exam.examName === examName)
            : examsData;
            
          setExamSlots(filteredExams);
          setCurrentSemester(semester);
          
          // Extract unique subjects from exam data
          const uniqueSubjects = [...new Set(examsData.map((exam: ExamSlot) => exam.subject))]
            .map((value: unknown) => ({
              id: String(value),
              name: String(value)
            }));
          setSubjects(uniqueSubjects);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branch, semester, examName]);

  const handleAddSubject = async () => {
    if (newSubject.trim()) {
      try {
        setError('');
        const newSubjectItem: Subject = {
          id: Date.now().toString(),
          name: newSubject.trim()
        };
        
        setSubjects([...subjects, newSubjectItem]);
        setNewSubject('');
        setShowAddSubject(false);
      } catch (err) {
        setError('Failed to add subject');
        console.error('Error adding subject:', err);
      }
    }
  };

  // Function to check for scheduling conflicts
  const checkForSchedulingConflicts = (date: string, startTime: string, endTime: string): boolean => {
    return examSlots.some(slot => 
      slot.date === date && (
        (startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime)
      )
    );
  };

  const handleAddExamSlot = async () => {
    if (selectedDate && selectedSubject && selectedTime.start && selectedTime.end && examName) {
      try {
        setError('');
        const subjectName = subjects.find(s => s.id === selectedSubject)?.name;
        if (!subjectName) {
          setError('Invalid subject selected');
          return;
        }

        // Check for scheduling conflicts
        if (checkForSchedulingConflicts(selectedDate, selectedTime.start, selectedTime.end)) {
          setError('Scheduling conflict detected! There is already an exam scheduled during this time slot.');
          return;
        }

        const response = await api.post('/api/exams', {
          branch,
          semester: Number(semester),
          examName,
          subject: subjectName,
          date: selectedDate,
          startTime: selectedTime.start,
          endTime: selectedTime.end
        });
    
        const newSlot: ExamSlot = {
          _id: response.data._id,
          subject: subjectName,
          examName,
          date: selectedDate,
          startTime: selectedTime.start,
          endTime: selectedTime.end,
          allocatedTeachers: []
        };
        
        setExamSlots([...examSlots, newSlot]);
        setSelectedDate('');
        setSelectedSubject('');
        setSelectedTime({ start: '', end: '' });
      } catch (err) {
        const errorMessage = (err as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to add exam slot';
        setError(errorMessage);
        console.error('Error adding exam slot:', err);
      }
    }
  };

  const handleExportToExcel = async () => {
    try {
      setError('');
      const response = await api.get(`/api/exams/${branch}/export`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exam-timetable-${branch}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const errorMessage = (err as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to export timetable';
      setError(errorMessage);
      console.error('Error exporting timetable:', err);
    }
  };

  const handleExamClick = (exam: ExamSlot) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

 


 





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE]"></div>
      </div>
    );
  }

  const handleDeleteExamSlot = async (slotId: string) => {
    try {
      setError('');
      await api.delete(`/api/exams/${slotId}`);
      setExamSlots(examSlots.filter(slot => slot._id !== slotId));
    } catch (err) {
      const errorMessage = (err as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete exam slot';
      setError(errorMessage);
      console.error('Error deleting exam slot:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="relative">
            {/* Fixed Navbar */}
            <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center justify-between">
              {/* Left Side: Logo and Title */}
              <div className="flex items-center gap-3">
                <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
                <h1 className="text-3xl font-bold text-gray-900">Exam Timetable</h1>
              </div>
              
              {/* Right Side: Back Button */}
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate(`/admin/timetable/${branch}/${semester}`)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleExportToExcel}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                >
                  <Download className="-ml-1 mr-2 h-5 w-5" />
                  Export to Excel
                </button>
              </div>
            </div>
          </div>

            {/* Right Side: Export Button */}
            <button
              onClick={handleExportToExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
            >
              <Download className="-ml-1 mr-2 h-5 w-5" />
              Export to Excel
            </button>
          </div>

          {/* Page Content with Padding to Avoid Overlap */}
          <div className="mt-20">
            {examSlots.length > 0 && (
              <div className="mb-4">
                
              </div>
            )}
            <p className="text-sm text-gray-500">{branch}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Subject Management */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Subjects</h3>
              <p className="mt-1 text-sm text-gray-500">Manage examination subjects</p>
            </div>
            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Subject
            </button>
          </div>

          {showAddSubject && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter subject name"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE] text-sm"
                />
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] shadow-sm font-medium"
                >
                  Add Subject
                </button>
              </div>
            </div>
          )}

          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#9FC0AE] transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{subject.name}</span>
                      <p className="text-sm text-gray-500 mt-1">Click to edit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new subject</p>
            </div>
          )}
        </div>

        {/* Exam Slot Scheduling */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Schedule Exam for {examName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={selectedTime.start}
                onChange={(e) => setSelectedTime({ ...selectedTime, start: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={selectedTime.end}
                onChange={(e) => setSelectedTime({ ...selectedTime, end: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleAddExamSlot}
              disabled={!selectedSubject || !selectedDate || !selectedTime.start || !selectedTime.end}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Exam Slot
            </button>
          </div>
        </div>

        {/* Exam Slots */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Exam Slots</h3>
          {examSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No exam slots found</div>
          ) : (
            Object.entries(
              examSlots.reduce((acc, slot) => {
                const key = slot.examName || 'Uncategorized';
                if (!acc[key]) acc[key] = [];
                acc[key].push(slot);
                return acc;
              }, {} as Record<string, ExamSlot[]>)
            ).map(([examName, slots]) => (
              <div key={examName} className="mb-8 last:mb-0">
                <h4 className="text-lg font-medium text-gray-900 mb-4">{examName}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {slots.map((slot) => (
                      <tr key={slot._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(slot.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{slot.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExamClick(slot);
                              }}
                              className="text-[#9FC0AE] hover:text-[#8BAF9A] text-sm"
                            >
                              Edit
                            </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {slot.allocatedTeachers?.length || 0} allocated
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-4">
                           
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this exam slot?')) {
                                  handleDeleteExamSlot(slot._id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {examSlots.length > 0 &&
          <div className="flex justify-end mb-8">
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/admin/allocation/${branch}/${semester}/${examName}`, {
                  state: { examSlots: examSlots }
                });
              }}
              className="px-6 py-3 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-4"
            >
              Proceed to Teacher Allocation
            </button>
          </div>
        }

        {/* Modal for exam details */}
        {selectedExam && (
          <ExamDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            exam={selectedExam}
            // onUpdateBlock={handleUpdateBlock}
          />
        )}
      </div>
    </div>
  );
}
