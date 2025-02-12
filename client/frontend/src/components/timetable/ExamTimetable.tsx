import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import api from '../../services/api'; 
import {  getExams, updateExam } from '../../services/api';
import ExamDetailModal from '../timetable/ExamDetailModal';

interface Subject {
  id: string;
  name: string;
}


interface ExamSlot {
  _id: string;
  subjectId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  block: string;
  blocks?: Block[];
  allocatedTeachers: string[];
  blockCapacity?: number;
}

interface Block {
  number: number;
  invigilator: string;
  capacity: number;
  location: string;
  status: 'pending' | 'completed';
  completedAt?: string;
}

export default function ExamTimetable(): React.ReactElement {
  const navigate = useNavigate();
  const { branch } = useParams<{ branch: string }>();
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);

  const [blocks] = useState(['A', 'B', 'C', 'D']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New state variables for subject management
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
        if (branch) {
          const examsData = await getExams(branch);
          setExamSlots(examsData);
          
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
  }, [branch]);

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

  const handleAddExamSlot = async () => {
    if (selectedDate && selectedSubject && selectedTime.start && selectedTime.end) {
      try {
        setError('');
        const subjectName = subjects.find(s => s.id === selectedSubject)?.name;
        if (!subjectName) {
          setError('Invalid subject selected');
          return;
        }

        const initialBlocks: Block[] = blocks.map((_blockLetter, index) => ({
          number: index,
          invigilator: '',
          capacity: 0,
          location: '',
          status: 'pending'
        }));

        const response = await api.post('/api/exams', {
          branch,
          subject: subjectName,
          date: selectedDate,
          startTime: selectedTime.start,
          endTime: selectedTime.end,
          blocks: initialBlocks
        });
    
        const newSlot: ExamSlot = {
          _id: response.data._id,
          subjectId: selectedSubject,
          subject: subjectName,
          date: selectedDate,
          startTime: selectedTime.start,
          endTime: selectedTime.end,
          block: 'A',
          blocks: initialBlocks,
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

  const handleUpdateBlock = async (blockNumber: number, blockData: Partial<Block>) => {
    if (!selectedExam) return;
  
    try {
      // Validate block data
      if (blockData.capacity !== undefined && blockData.capacity < 0) {
        setError('Capacity cannot be negative');
        return;
      }
  
      if (blockData.status && !['pending', 'in_progress', 'completed'].includes(blockData.status)) {
        setError('Invalid block status');
        return;
      }
  
      // Update block data
      const response = await api.patch(`/api/exams/${selectedExam._id}/blocks/${blockNumber}`, blockData);
      if (response.data) {
        const updatedExam = {
          ...selectedExam,
          blocks: response.data.blocks
        };
        setSelectedExam(updatedExam);
        
        // Update exam slots with new block data
        setExamSlots(examSlots.map(slot =>
          slot._id === updatedExam._id ? { ...slot, blocks: updatedExam.blocks } : slot
        ));
  
        // Check if all blocks are properly configured
        const allBlocksConfigured = updatedExam.blocks?.every((block: Block) => 
          block.capacity > 0 && block.location && block.status
        );
  
        if (allBlocksConfigured) {
          setAllExamsHaveBlocks(true);
        }
      }
    } catch (error) {
      console.error('Error updating block:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(errorMessage || 'An error occurred while updating the block');
    }
  };

  const handleBlockAssignment = async (slotId: string, block: string) => {
    try {
      // Define the update data with proper typing
      const updateData: { blockAssignment: string } = {
        blockAssignment: block
      };
      
      await updateExam(slotId, { block: updateData.blockAssignment });

      setExamSlots(slots =>
        slots.map(slot =>
          slot._id === slotId ? { ...slot, block } : slot
        )
      );
    } catch (error) {
      console.error('Error updating block:', error);
      setError('Failed to update block assignment');
    }
  };

  const [allExamsHaveBlocks, setAllExamsHaveBlocks] = useState(false);

  useEffect(() => {
    // Check if all exams have blocks assigned
    const checkExamBlocks = () => {
      const allHaveBlocks = examSlots.every(slot => 
        slot.blocks && slot.blocks.length > 0 && slot.blocks.every(block => 
          block.number >= 0 &&
          block.capacity > 0 &&
          block.location.trim() !== '' &&
          block.invigilator &&
          (block.status === 'pending' || block.status === 'completed')
        )
      );
      setAllExamsHaveBlocks(allHaveBlocks);
    };

    checkExamBlocks();
  }, [examSlots]);



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
          <div className=''>
            <h2 className="text-2xl font-bold text-gray-900">Exam TimeTable</h2>
            {examSlots.length > 0 && (
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  onClick={handleExportToExcel}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                >
                  <Download className="-ml-1 mr-2 h-5 w-5 " />
                  Export to Excel
                </button>
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">{branch}</p>
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

        {/* Exam Slots */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Exam Slots</h3>
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
                {examSlots.map((slot) => (
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
                      <select
                        value={slot.block}
                        onChange={(e) => handleBlockAssignment(slot._id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                      >
                        {blocks.map((block) => (
                          <option key={block} value={block}>Block {block}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {slot.allocatedTeachers?.length || 0} allocated
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExamClick(slot);
                          }}
                          className="text-[#9FC0AE] hover:text-[#8BAF9A] text-sm"
                        >
                          Edit
                        </button>
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

        {/* Navigation to Teacher Allocation */}
        {examSlots.length > 0 && (
          <div className="flex justify-end mb-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/allocation/${branch}`);
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
            >
              Proceed to Teacher Allocation
            </button>
          </div>
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