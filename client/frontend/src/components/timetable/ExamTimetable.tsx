import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import api from '../../services/api';
import  ExamDetailModal from './ExamDetailModal';

interface Subject {
  id: string;
  name: string;
}

interface ExamSlot {
  id: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  block: string;
  subject: string;
}

interface Block {
  number: number;
  invigilator?: string;
  capacity: number;
  location: string;
  status: string;
}

interface ExamSlotWithBlocks extends ExamSlot {
  blocks?: Block[];
  subject: string;
}

interface ExamResponse {
  _id: string;
  subject: {
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  block?: string;
  blocks?: Block[];
}

export default function ExamTimetable() {
  const { branch } = useParams<{ branch: string }>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState({ start: '', end: '' });
  const [showAddSubject, setShowAddSubject] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamSlotWithBlocks | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/api/exams/${branch}`);
        const examData = response.data as ExamResponse[];
        
        // Initialize empty arrays for subjects and exam slots
        setSubjects([]);
        setExamSlots([]);
        
        if (examData && examData.length > 0) {
          // Extract unique subjects from exam data and preserve their original IDs
          const uniqueSubjects = [...new Set(examData.map(exam => exam.subject.name))]
            .map(name => ({
              id: name, // Use the subject name as the ID for consistent mapping
              name: name
            }));
          setSubjects(uniqueSubjects);
          
          // Set exam slots
          setExamSlots(examData.map(exam => ({
            id: exam._id,
            subjectId: exam.subject.name, // Use subject name as ID for consistent mapping
            subject: exam.subject.name,
            date: new Date(exam.date).toISOString().split('T')[0],
            startTime: exam.startTime,
            endTime: exam.endTime,
            block: exam.block || 'TBD',
            blocks: exam.blocks
          })));
        }
      } catch (err) {
        const error = err as Error;
        const errorMessage = error.message || 'Failed to fetch exam data. Please check your connection and try again.';
        setError(errorMessage);
        console.error('Error fetching exam data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [branch]);

  const handleAddSubject = async () => {
    if (newSubject.trim()) {
      try {
        setError('');
        const newSubjectItem: Subject = {
          id: Date.now().toString(),
          name: newSubject.trim()
        };
        
        // Add subject to local state
        setSubjects([...subjects, newSubjectItem]);
        setNewSubject('');
        setShowAddSubject(false);
      } catch (err) {
        setError('Failed to add subject');
        console.error('Error adding subject:', err);
      }
    }
  };

  const handleAddExamSlot = async () => {
    if (selectedDate && selectedSubject && selectedTime.start && selectedTime.end) {
      try {
        setError('');
        const subjectName = subjects.find(s => s.id === selectedSubject)?.name;
        if (!subjectName) {
          setError('Invalid subject selected');
          return;
        }

        const response = await api.post('/api/exams', {
          branch,
          subject: subjectName,
          date: selectedDate,
          startTime: selectedTime.start,
          endTime: selectedTime.end
        });
    
        const newSlot: ExamSlot = {
          id: response.data._id,
          subjectId: selectedSubject,
          subject: subjectName,
          date: selectedDate,
          startTime: selectedTime.start,
          endTime: selectedTime.end,
          block: 'TBD'
        };
        
        setExamSlots([...examSlots, newSlot]);
        // Reset form
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

  const handleExamClick = (exam: ExamSlotWithBlocks) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleUpdateBlock = async (blockNumber: number, blockData: Partial<Block>) => {
    if (!selectedExam) return;

    try {
      const response = await api.patch(`/api/exams/${selectedExam.id}/blocks/${blockNumber}`, blockData);
      if (response.data) {
        const updatedExam = {
          ...selectedExam,
          blocks: response.data.blocks
        };
        setSelectedExam(updatedExam);
        
        setExamSlots(examSlots.map(slot =>
          slot.id === updatedExam.id ? { ...slot, blocks: updatedExam.blocks } : slot
        ));
      }
    } catch (error) {
      console.error('Error updating block:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(errorMessage || 'An error occurred while updating the block');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Exam Timetable</h2>
                <p className="mt-1 text-sm text-gray-500">{branch}</p>
              </div>
              {examSlots.length > 0 && (
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <button
                    onClick={handleExportToExcel}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                  >
                    <Download className="-ml-1 mr-2 h-5 w-5" />
                    Export to Excel
                  </button>
                </div>
              )}
            </div>

            {/* Subject Management */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Subjects</h3>
                <button
                  onClick={() => setShowAddSubject(!showAddSubject)}
                  className="inline-flex items-center text-sm text-[#9FC0AE] hover:text-[#8BAF9A]"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add Subject
                </button>
              </div>

              {showAddSubject && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter subject name"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                  />
                  <button
                    onClick={handleAddSubject}
                    className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A]"
                  >
                    Add
                  </button>
                </div>
              )}

              {subjects.length > 0 ? (
                <div key="subjects-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="p-3 bg-gray-50 rounded-md flex items-center justify-between"
                    >
                      <span>{subject.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No subjects added yet. Add your first subject to get started.</p>
              )}
            </div>

            {/* Exam Slot Scheduling */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">Schedule Exam</h3>
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

            {/* Scheduled Exams */}
            {examSlots.length > 0 ? (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Scheduled Exams</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examSlots.map((slot) => (
                        <tr 
                          key={slot.id}
                          onClick={() => handleExamClick(slot)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">{slot.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {slot.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {slot.startTime} - {slot.endTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center justify-between">
                            <span>{slot.block}</span>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">No exams scheduled yet. Add your first exam slot to get started.</p>
              </div>
            )}
          </>
        )}
      </div>
      {selectedExam && (
        <ExamDetailModal
          exam={selectedExam}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdateBlock={handleUpdateBlock}
        />
      )}
    </div>
  );
}