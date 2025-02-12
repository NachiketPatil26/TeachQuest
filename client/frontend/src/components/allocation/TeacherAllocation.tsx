import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { getTeachers, getExams, allocateTeachers } from '../../services/api';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subjects: string[];
  availability: string[];
}

interface ExamSlot {
  _id: string;
  subjectId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  block: string;
  
  allocatedTeachers: string[];
  blockCapacity?: number;
}

const isTeacherAvailable = (teacher: Teacher, examDate: string): boolean => {
  if (!teacher.availability || !Array.isArray(teacher.availability)) {
    return false;
  }
  // Get the weekday name from the exam date
  const weekday = new Date(examDate).toLocaleDateString('en-US', { weekday: 'long' });
  // Check if the teacher is available on this weekday
  return teacher.availability.includes(weekday);
};

const isTeacherSubjectConflict = (): boolean => {
  // Temporarily disabled subject conflict check
  // if (!teacher.subjects || !Array.isArray(teacher.subjects)) {
  //   return true;
  // }
  // // Check if the teacher teaches the subject
  // const teachesSubject = teacher.subjects.some(subject => subject === subjectId);
  // return !teachesSubject; // Return true if there is a conflict (teacher doesn't teach the subject)
  return false; // Temporarily return false to disable subject conflict check
};

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
        console.log('Starting data fetch...');
        setLoading(true);
        setError('');
        
        // Fetch teachers using API service
        console.log('Fetching teachers data...');
        const teachersData = await getTeachers();
        console.log('Teachers data received:', teachersData);
        if (!teachersData || !Array.isArray(teachersData)) {
          throw new Error('Invalid teachers data received');
        }
        setTeachers(teachersData);

        // Fetch exam slots using API service
        if (branch) {
          console.log(`Fetching exam slots for branch: ${branch}`);
          const examsData = await getExams(branch);
          console.log('Exam slots data received:', examsData);
          if (!examsData || !Array.isArray(examsData)) {
            throw new Error('Invalid exam slots data received');
          }
          setExamSlots(examsData);
        } else {
          console.warn('No branch provided for fetching exam slots');
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        console.error('Error fetching data:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branch]);

  const handleAllocation = () => {
    console.log('Starting teacher allocation process...');
    console.log('Selected teachers:', selectedTeachers);
    if (selectedTeachers.length === 0) {
      setError('Please select at least one teacher');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmAllocation = async () => {
    try {
      console.log('Confirming teacher allocation...');
      setError('');
      const selectedExam = examSlots.find(slot => slot._id === selectedSlot);
      
      if (!selectedExam) {
        throw new Error('Selected exam slot not found');
      }

      console.log('Allocating teachers:', { examId: selectedSlot, teachers: selectedTeachers });
      await allocateTeachers(selectedSlot, selectedTeachers);

      // Create notifications for allocated teachers
      const selectedTeachersData = teachers.filter(t => selectedTeachers.includes(t._id));
      for (const teacher of selectedTeachersData) {
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: teacher._id,
              title: 'New Exam Duty Allocation',
              message: `You have been allocated to ${selectedExam.subject} exam on ${new Date(selectedExam.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} from ${selectedExam.startTime} to ${selectedExam.endTime} in Block ${selectedExam.block}.`,
              type: 'info',
              relatedTo: {
                model: 'Exam',
                id: selectedSlot
              }
            })
          });
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }

      // Update local state
      setExamSlots(slots =>
        slots.map(slot =>
          slot._id === selectedSlot
            ? { ...slot, allocatedTeachers: selectedTeachers }
            : slot
        )
      );

      console.log('Teacher allocation successful');
      // Reset selection state
      setShowConfirmDialog(false);
      setSelectedSlot('');
      setSelectedTeachers([]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to allocate teachers';
      console.error('Error allocating teachers:', error);
      setError(`Failed to allocate teachers: ${errorMessage}`);
      setShowConfirmDialog(false);
    }
  };

  const handleTeacherSelection = (teacherId: string) => {
    if (!teacherId) {
      console.error('Invalid teacher ID');
      setError('Invalid teacher selection');
      return;
    }
  
    console.log('Handling teacher selection:', teacherId);
    const slot = examSlots.find(s => s._id === selectedSlot);
    if (!slot) {
      console.error('No exam slot selected');
      setError('Please select an exam slot first');
      return;
    }
  
    const teacher = teachers.find(t => t._id === teacherId);
    if (!teacher) {
      console.error('Teacher not found:', teacherId);
      setError('Selected teacher not found');
      return;
    }
  
    if (!slot.date) {
      console.error('Invalid exam date');
      setError('Invalid exam slot date');
      return;
    }
  
    const examDate = new Date(slot.date).toISOString().split('T')[0];
    const isAvailable = isTeacherAvailable(teacher, examDate);
    const hasSubjectConflict = isTeacherSubjectConflict();
  
    console.log('Teacher availability check:', {
      teacherId,
      isAvailable,
      hasSubjectConflict,
      date: slot.date,
      subjectId: slot.subjectId
    });
  
    if (!isAvailable) {
      setError(`Teacher ${teacher.name} is not available on this date`);
      return;
    }
  
    // Check if teacher is already in selectedTeachers
    const isSelected = selectedTeachers.includes(teacherId);
    
    if (isSelected) {
      // If teacher is already selected, remove them
      setSelectedTeachers(prevSelected => prevSelected.filter(id => id !== teacherId));
      console.log('Removed teacher from selection:', teacherId);
    } else {
      // Check if teacher is already allocated to this slot
      const isAlreadyAllocated = slot.allocatedTeachers?.includes(teacherId);
      if (!isAlreadyAllocated) {
        // Check if teacher is allocated to any other exam slot
        const isAllocatedToOtherSlot = examSlots.some(otherSlot => 
          otherSlot._id !== slot._id && 
          otherSlot.allocatedTeachers?.includes(teacherId)
        );

        if (!isAllocatedToOtherSlot) {
          setSelectedTeachers(prevSelected => {
            const newSelection = [...prevSelected, teacherId];
            console.log('Updated teacher selection:', newSelection);
            return newSelection;
          });
        } else {
          setError(`Teacher ${teacher.name} is already allocated to another exam slot`);
        }
      } else {
        setError(`Teacher ${teacher.name} is already allocated to this exam slot`);
      }
    }
  };

  useEffect(() => {
    if (selectedSlot) {
      const teacherSection = document.getElementById('teacher-selection');
      if (teacherSection) {
        teacherSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedSlot]); // Scroll to teacher selection whenever selectedSlot changes

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
                {examSlots.map((examSlot) => (
                  <React.Fragment key={examSlot._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(examSlot.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{examSlot.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {examSlot.startTime} - {examSlot.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{examSlot.block}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {examSlot.allocatedTeachers?.length || 0} allocated
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!examSlot._id) {
                              setError('Invalid exam slot selected');
                              return;
                            }
                            const selectedExamSlot = examSlots.find(s => s._id === examSlot._id);
                            if (!selectedExamSlot) {
                              setError('Selected exam slot not found');
                              return;
                            }
                            setSelectedSlot(examSlot._id);
                            if (selectedExamSlot.allocatedTeachers && selectedExamSlot.allocatedTeachers.length > 0) {
                              setSelectedTeachers(selectedExamSlot.allocatedTeachers);
                            } else {
                              setSelectedTeachers([]);
                            }
                            setError('');
                          }}
                          className="text-[#9FC0AE] hover:text-[#8BAF9A]"
                        >
                          {examSlot.allocatedTeachers && examSlot.allocatedTeachers.length > 0 ? 'Edit Allocation' : 'Allocate Teachers'}
                        </button>
                      </td>
                    </tr>
                    {selectedSlot === examSlot._id && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div 
                            id="teacher-selection" 
                            className="bg-white shadow rounded-lg p-6 transition-all duration-300 ease-in-out transform-gpu"
                            style={{
                              opacity: 1,
                              transform: 'translateY(0)',
                              maxHeight: '2000px',
                              overflow: 'hidden'
                            }}
                          >
                            <h3 className="text-lg font-medium mb-4">Select Teachers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {teachers.map((teacher) => {
                                const isAvailable = isTeacherAvailable(teacher, new Date(examSlot.date).toISOString().split('T')[0]);
                                const hasSubjectConflict = isTeacherSubjectConflict();
                                const isAllocated = selectedTeachers.includes(teacher._id);
    
                                return (
                                  <div
                                    key={teacher._id}
                                    className={`p-4 rounded-lg border transition-all duration-200 ${isAllocated ? 'border-[#9FC0AE] bg-[#9FC0AE]/10 shadow-md' : 'border-gray-200'}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium">{teacher.name}</h4>
                                        <p className="text-sm text-gray-500">{teacher.email}</p>
                                        {isAllocated && (
                                          <p className="text-xs text-[#9FC0AE] mt-1">Currently Allocated</p>
                                        )}
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
                                        onClick={() => handleTeacherSelection(teacher._id)}
                                        disabled={!isAvailable || hasSubjectConflict}
                                        className={`p-2 rounded-full transition-all duration-200 ${selectedTeachers.includes(teacher._id) ? 'bg-[#9FC0AE] text-white scale-110' : 'bg-gray-100'} ${(!isAvailable || hasSubjectConflict) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#8BAF9A] hover:scale-105'}`}
                                      >
                                        {selectedTeachers.includes(teacher._id) ? <Check size={16} /> : '+'}
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
                                className="mr-4 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAllocation}
                                disabled={selectedTeachers.length === 0}
                                className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                              >
                                Allocate Selected Teachers
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
