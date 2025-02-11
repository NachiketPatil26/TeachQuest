import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { getTeachers, getExams, allocateTeachers } from '../../services/api';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  availability: string[];
}

interface ExamSlot {
  id: string;
  subjectId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  block: string;
  allocatedTeachers: string[];
}

export default function TeacherAllocation() {
  const { branch } = useParams<{ branch: string }>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch teachers using API service
        const teachersData = await getTeachers();
        setTeachers(teachersData);

        // Fetch exam slots using API service
        if (branch) {
          const examsData = await getExams(branch);
          setExamSlots(examsData);
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



  const handleAllocation = async () => {
    if (selectedSlot && selectedTeachers.length > 0) {
      setShowConfirmDialog(true);
    } else {
      alert('Please select an exam slot and at least one teacher.');
    }
  };

  const confirmAllocation = async () => {
    try {
      await allocateTeachers(selectedSlot, selectedTeachers);

      setExamSlots(slots =>
        slots.map(slot =>
          slot.id === selectedSlot
            ? { ...slot, allocatedTeachers: selectedTeachers }
            : slot
        )
      );

      setShowConfirmDialog(false);
      setSelectedSlot('');
      setSelectedTeachers([]);
    } catch (error) {
      console.error('Error allocating teachers:', error);
      alert('Failed to allocate teachers. Please try again.');
    }
  };

 

 
  const isTeacherAvailable = (teacher: Teacher, date: string) => {
    return teacher.availability.includes(date);
  };

  const isTeacherSubjectConflict = (teacher: Teacher, subjectId: string) => {
    if (!teacher.subjects || teacher.subjects.length === 0) {
      return true;
    }
    return !teacher.subjects.includes(subjectId);
  };

  const handleTeacherSelection = (teacherId: string) => {
    setSelectedTeachers(prevSelected =>
      prevSelected.includes(teacherId)
        ? prevSelected.filter(id => id !== teacherId)
        : [...prevSelected, teacherId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Confirm Teacher Allocation</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to allocate {selectedTeachers.length} teacher(s) to this exam slot?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAllocation}
                  className="px-4 py-2 bg-[#9FC0AE] text-white rounded hover:bg-[#8BAF9A]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teacher Allocation</h2>
            <p className="mt-1 text-sm text-gray-500">{branch}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Exam Slots */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Available Exam Slots</h3>
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
                  <tr key={slot.id}>
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
                    <td className="px-6 py-4 whitespace-nowrap">{slot.block}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {slot.allocatedTeachers?.length || 0} allocated
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSlot(slot.id)}
                        className="text-[#9FC0AE] hover:text-[#8BAF9A]"
                      >
                        Allocate Teachers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Selection */}
        {selectedSlot && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Select Teachers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teachers.map((teacher) => {
                const slot = examSlots.find(s => s.id === selectedSlot);
                const isAvailable = slot ? isTeacherAvailable(teacher, new Date(slot.date).toISOString().split('T')[0]) : true;
                const hasSubjectConflict = slot ? isTeacherSubjectConflict(teacher, slot.subjectId) : false;

                return (
                  <div
                    key={teacher.id}
                    className={`p-4 rounded-lg border ${selectedTeachers.includes(teacher.id) ? 'border-[#9FC0AE]' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{teacher.name}</h4>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Specializations:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {teacher.subjects?.map((subject) => (
                              <span
                                key={subject}
                                className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTeacherSelection(teacher.id)}
                        disabled={!isAvailable || hasSubjectConflict}
                        className={`p-2 rounded-full ${selectedTeachers.includes(teacher.id) ? 'bg-[#9FC0AE] text-white' : 'bg-gray-100'} ${(!isAvailable || hasSubjectConflict) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#8BAF9A]'}`}
                      >
                        {selectedTeachers.includes(teacher.id) ? <Check size={16} /> : '+'}
                      </button>
                    </div>
                    {!isAvailable && (
                      <p className="mt-2 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        Not available on this date
                      </p>
                    )}
                    {hasSubjectConflict && (
                      <p className="mt-2 text-sm text-orange-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        Subject conflict
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSlot('')}
                className="mr-4 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocation}
                disabled={selectedTeachers.length === 0}
                className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Allocate Selected Teachers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}