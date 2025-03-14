import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Check, AlertCircle, Calendar, Clock, Users, AlertTriangle } from 'lucide-react';
import { getTeachers, getExams, allocateTeachers, assignInvigilator } from '../../services/api';

import TeachQuestLogo from '../../assets/TeachQuestLogo.png';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subjects: string[];
  availability: string[];
}

interface Block {
  number: number;
  capacity: number;
  location: string;
  invigilator?: string | null;
}

interface ExamSlot {
  _id: string;
  subjectId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  block: string;
  examName: string;
  allocatedTeachers: string[];
  blockCapacity?: number;
  blocks?: Block[];
}

// Improved availability check with better date handling
const isTeacherAvailable = (teacher: Teacher, examDate: string): boolean => {
  if (!teacher.availability || !Array.isArray(teacher.availability) || teacher.availability.length === 0) {
    return false;
  }
  
  try {
    // Ensure consistent date format handling
    const date = new Date(examDate);
    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', examDate);
      return false;
    }
    
    // Get the weekday name from the exam date
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if the teacher is available on this weekday
    return teacher.availability.includes(weekday);
  } catch (error) {
    console.error('Error checking teacher availability:', error);
    return false;
  }
};

// Improved subject conflict check that actually checks for subject matches
const isTeacherQualified = (teacher: Teacher, examSubject: string): boolean => {
  if (!teacher.subjects || !Array.isArray(teacher.subjects) || teacher.subjects.length === 0) {
    return false;
  }
  
  return teacher.subjects.some(subject => 
    subject.toLowerCase() === examSubject.toLowerCase() || 
    examSubject.toLowerCase().includes(subject.toLowerCase()) ||
    subject.toLowerCase().includes(examSubject.toLowerCase())
  );
};

// Check if teacher is allocated to another exam on the same day and time
const hasTimeConflict = (teacher: Teacher, examSlot: ExamSlot, allExamSlots: ExamSlot[]): boolean => {
  if (!examSlot.date || !examSlot.startTime || !examSlot.endTime) return false;
  
  const examDate = new Date(examSlot.date).toISOString().split('T')[0];
  
  return allExamSlots.some(slot => {
    // Skip the current exam slot
    if (slot._id === examSlot._id) return false;
    
    // Check if teacher is allocated to this slot
    if (!slot.allocatedTeachers?.includes(teacher._id)) return false;
    
    // Check if on the same day
    const slotDate = new Date(slot.date).toISOString().split('T')[0];
    if (slotDate !== examDate) return false;
    
    // Check time overlap
    const slotStart = slot.startTime;
    const slotEnd = slot.endTime;
    const examStart = examSlot.startTime;
    const examEnd = examSlot.endTime;
    
    // Time overlap check: not (end1 <= start2 or end2 <= start1)
    return !(slotEnd <= examStart || examEnd <= slotStart);
  });
};

export default function TeacherAllocation() {
  const { branch, semester, examName } = useParams<{ branch: string; semester: string; examName: string }>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [allocating, setAllocating] = useState(false);

  // Clear error/notification messages after 5 seconds
  useEffect(() => {
    if (error || notification) {
      const timer = setTimeout(() => {
        setError('');
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, notification]);

  const fetchData = useCallback(async () => {
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

      // Fetch exam slots using API service with examName filter
      if (branch && semester && examName) {
        console.log(`Fetching exam slots for branch: ${branch}, semester: ${semester}, exam: ${examName}`);
        const examsData = await getExams(branch, parseInt(semester), examName);
        console.log('Exam slots data received:', examsData);
        if (!examsData || !Array.isArray(examsData)) {
          throw new Error('Invalid exam slots data received');
        }
        // Filter exams by examName
        const filteredExams = examsData.filter(exam => exam.examName === examName);
        setExamSlots(filteredExams);
      } else {
        console.warn('Missing required parameters for fetching exam slots');
        setError('Missing required parameters to load exam data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      console.error('Error fetching data:', error);
      setError(`Data loading failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [branch, semester, examName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (type: 'error' | 'success' | 'info', message: string) => {
    setNotification({ type, message });
    // Auto clear after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExamSlotSelection = (slotId: string) => {
    if (!slotId) {
      setError('Invalid exam slot selected');
      return;
    }
    
    // If clicking the same slot again, toggle selection off
    if (selectedSlot === slotId) {
      setSelectedSlot('');
      setSelectedTeachers([]);
      setSelectedBlock(null);
      setIsBlockMode(false);
      return;
    }
    
    // Reset state when selecting a new slot
    setSelectedTeachers([]);
    setSelectedBlock(null);
    setError('');
    setIsBlockMode(false);
    
    const selectedExamSlot = examSlots.find(s => s._id === slotId);
    if (!selectedExamSlot) {
      setError('Selected exam slot not found');
      return;
    }
    
    setSelectedSlot(slotId);
    
    // Check if this exam has blocks to determine mode
    setIsBlockMode(!!selectedExamSlot.blocks && selectedExamSlot.blocks.length > 0);
    
    // Pre-select already allocated teachers for general allocation
    if (selectedExamSlot.allocatedTeachers && selectedExamSlot.allocatedTeachers.length > 0) {
      setSelectedTeachers(selectedExamSlot.allocatedTeachers);
    }
  };

  const handleTeacherSelection = (teacherId: string) => {
    if (!teacherId) {
      setError('Invalid teacher ID');
      return;
    }
  
    const slot = examSlots.find(s => s._id === selectedSlot);
    if (!slot) {
      setError('Please select an exam slot first');
      return;
    }
  
    const teacher = teachers.find(t => t._id === teacherId);
    if (!teacher) {
      setError('Selected teacher not found');
      return;
    }
  
    if (!slot.date) {
      setError('Invalid exam slot date');
      return;
    }
  
    const examDate = new Date(slot.date).toISOString().split('T')[0];
    const isAvailable = isTeacherAvailable(teacher, examDate);
    const isQualified = isTeacherQualified(teacher, slot.subject);
    const hasConflict = hasTimeConflict(teacher, slot, examSlots);
    
    // Check if teacher is already assigned to another block in this exam
    const isAssignedToOtherBlock = slot.blocks?.some(
      block => block.invigilator === teacherId && block.number !== selectedBlock
    );
  
    console.log('Teacher evaluation:', {
      teacherId,
      name: teacher.name,
      isAvailable,
      isQualified,
      hasConflict,
      isAssignedToOtherBlock,
      date: slot.date,
      subject: slot.subject
    });
  
    if (!isAvailable) {
      setError(`Teacher ${teacher.name} is not available on this date`);
      return;
    }
    
    if (hasConflict) {
      setError(`Teacher ${teacher.name} has another exam scheduled at this time`);
      return;
    }
    
    if (isAssignedToOtherBlock) {
      setError(`Teacher ${teacher.name} is already assigned to another block in this exam`);
      return;
    }
    
    if (!isQualified) {
      // This is just a warning, not a blocking error
      showNotification('info', `Note: ${teacher.name} may not specialize in ${slot.subject}`);
    }
    
    // Block mode handling - only allow one teacher
    if (isBlockMode && selectedBlock !== null) {
      // Check if there's an existing invigilator
      const currentBlock = slot.blocks?.find(b => b.number === selectedBlock);
      const currentInvigilatorId = currentBlock?.invigilator;
      
      if (currentInvigilatorId) {
        // If the same teacher is clicked again, deselect them
        if (currentInvigilatorId === teacherId && selectedTeachers.includes(teacherId)) {
          setSelectedTeachers([]);
          return;
        }
        
        const currentTeacher = teachers.find(t => t._id === currentInvigilatorId);
        // Ask for confirmation before replacing
        if (window.confirm(`This will replace ${currentTeacher?.name || 'current teacher'} with ${teacher.name}. Continue?`)) {
          setSelectedTeachers([teacherId]);
        }
        return;
      }
      
      // If no current invigilator or same teacher selected, just update selection
      setSelectedTeachers([teacherId]);
      return;
    }
    
    // General allocation mode - toggle selection
    const isSelected = selectedTeachers.includes(teacherId);
    
    if (isSelected) {
      // If teacher is already selected, remove them
      setSelectedTeachers(prevSelected => prevSelected.filter(id => id !== teacherId));
    } else {
      // Add teacher to selection
      setSelectedTeachers(prevSelected => [...prevSelected, teacherId]);
    }
  };



  const handleAllocation = () => {
    console.log('Starting teacher allocation process...');
    
    if (selectedTeachers.length === 0) {
      setError('Please select at least one teacher');
      return;
    }
    
    const currentExamSlot = examSlots.find(slot => slot._id === selectedSlot);
    if (!currentExamSlot) {
      setError('Selected exam slot not found');
      return;
    }
    
    // For block mode, we need a block selected and only one teacher
    if (isBlockMode) {
      if (selectedBlock === null) {
        setError('Please select a block for this exam');
        return;
      }
      
      if (selectedTeachers.length !== 1) {
        setError('Please select exactly one teacher for block allocation');
        return;
      }
      
      // Check if block already has an invigilator - but don't block the operation
      // as we're allowing edits now
      const selectedBlockData = currentExamSlot.blocks?.find(b => b.number === selectedBlock);
      if (selectedBlockData?.invigilator) {
        const currentTeacherId = selectedBlockData.invigilator;
        const newTeacherId = selectedTeachers[0];
        
        // If the same teacher is selected, no need to show confirmation
        if (currentTeacherId === newTeacherId) {
          setError('This teacher is already assigned to this block');
          return;
        }
        
        // Otherwise, we're replacing the teacher - proceed to confirmation
      }
    }
    
    setShowConfirmDialog(true);
  };

  const confirmAllocation = async () => {
    try {
      setAllocating(true);
      setError('');
      console.log('Confirming teacher allocation...');
      
      const selectedExam = examSlots.find(slot => slot._id === selectedSlot);
      if (!selectedExam) {
        throw new Error('Selected exam slot not found');
      }

      if (isBlockMode && selectedBlock !== null && selectedTeachers.length === 1) {
        // Block-specific allocation (invigilator assignment)
        const teacherId = selectedTeachers[0];
        console.log(`Allocating teacher ${teacherId} to block ${selectedBlock}`);
        
        // Check if we're replacing an existing invigilator
        const currentBlock = selectedExam.blocks?.find(b => b.number === selectedBlock);
        const isReplacement = currentBlock?.invigilator && currentBlock.invigilator !== teacherId;
        
        // Call API to assign invigilator
        await assignInvigilator(selectedSlot, selectedBlock, teacherId);
        
        // Create notification for the allocated teacher
        await createTeacherNotification(
          teacherId, 
          isReplacement ? 'Updated Block Invigilator Assignment' : 'New Block Invigilator Assignment',
          `You have been assigned as an invigilator for Block ${selectedBlock} in the ${selectedExam.subject} exam on ${formatDate(selectedExam.date)} from ${selectedExam.startTime} to ${selectedExam.endTime}.`,
          selectedSlot
        );
        
        // Update local state
        setExamSlots(slots =>
          slots.map(slot =>
            slot._id === selectedSlot
              ? { 
                  ...slot, 
                  blocks: slot.blocks?.map(block => 
                    block.number === selectedBlock 
                      ? { ...block, invigilator: teacherId }
                      : block
                  )
                }
              : slot
          )
        );
        
        showNotification('success', isReplacement ? 
          `Teacher reassigned to Block ${selectedBlock} successfully` : 
          `Teacher assigned to Block ${selectedBlock} successfully`);
        
        // Only reset block selection, keep the teacher selection active
        setSelectedBlock(null);
      } else {
        // General exam slot allocation
        console.log('Allocating teachers:', { examId: selectedSlot, teachers: selectedTeachers });
        
        // Check if we're updating an existing allocation
        const isUpdate = selectedExam.allocatedTeachers && selectedExam.allocatedTeachers.length > 0;
        
        await allocateTeachers(selectedSlot, selectedTeachers);

        // Create notifications for all allocated teachers
        const selectedTeachersData = teachers.filter(t => selectedTeachers.includes(t._id));
        for (const teacher of selectedTeachersData) {
          await createTeacherNotification(
            teacher._id,
            isUpdate ? 'Updated Exam Duty Allocation' : 'New Exam Duty Allocation',
            `You have been allocated to ${selectedExam.subject} exam on ${formatDate(selectedExam.date)} from ${selectedExam.startTime} to ${selectedExam.endTime}.`,
            selectedSlot
          );
        }
        
        // Update local state
        setExamSlots(slots =>
          slots.map(slot =>
            slot._id === selectedSlot
              ? { ...slot, allocatedTeachers: selectedTeachers }
              : slot
          )
        );
        
        showNotification('success', isUpdate ? 
          `Allocation updated with ${selectedTeachers.length} teacher(s) successfully` : 
          `${selectedTeachers.length} teacher(s) allocated successfully`);
      }

      // Keep the exam slot and teacher selection state
      setShowConfirmDialog(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to allocate teachers';
      console.error('Error allocating teachers:', error);
      setError(`Allocation failed: ${errorMessage}`);
    } finally {
      setAllocating(false);
      setShowConfirmDialog(false);
    }
  };

  const createTeacherNotification = async (
    teacherId: string, 
    title: string, 
    message: string, 
    examId: string
  ) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: teacherId,
          title,
          message,
          type: 'info',
          relatedTo: {
            model: 'Exam',
            id: examId
          }
        })
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw - notification failure shouldn't stop the allocation process
    }
  };

  // Helper function to format dates consistently
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString; // Fallback to original string
    }
  };

  // Clean up selected state when component unmounts
  useEffect(() => {
    return () => {
      setSelectedSlot('');
      setSelectedTeachers([]);
      setSelectedBlock(null);
      setIsBlockMode(false);
    };
  }, []);

  // Smooth scroll to teacher selection with proper timing
  useEffect(() => {
    if (selectedSlot) {
      // Short delay to ensure DOM is updated
      const scrollTimer = setTimeout(() => {
        const teacherSection = document.getElementById('teacher-selection');
        if (teacherSection) {
          teacherSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [selectedSlot]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE] mb-4"></div>
        <p className="text-gray-600">Loading exam allocation data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center gap-3">
        <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
        <h1 className="text-2xl font-bold text-gray-900">Teacher Allocation</h1>
      </div>

      {/* Main content with padding to prevent overlap with fixed navbar */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumbs and context info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {branch} - {semester ? `Semester ${semester}` : ''} - {examName}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Allocate teachers to exam slots and assign invigilators to blocks
          </p>
        </div>

        {/* Notification area */}
        {notification && (
          <div 
            className={`mb-6 px-4 py-3 rounded-lg relative flex items-start ${
              notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
            role="alert"
          >
            {notification.type === 'error' && <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />}
            {notification.type === 'success' && <Check className="mr-2 h-5 w-5 flex-shrink-0" />}
            {notification.type === 'info' && <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-start" role="alert">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Confirm Teacher Allocation</h3>
              {isBlockMode && selectedBlock !== null ? (
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">
                    You are about to assign:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-2">
                    <p className="font-medium">{teachers.find(t => t._id === selectedTeachers[0])?.name}</p>
                    <p className="text-sm text-gray-500">{teachers.find(t => t._id === selectedTeachers[0])?.email}</p>
                  </div>
                  <p className="text-gray-600 mb-2">
                    As an invigilator to:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Block {selectedBlock}</p>
                    <p className="text-sm text-gray-500">
                      {examSlots.find(s => s._id === selectedSlot)?.subject} exam
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">
                    You are about to allocate {selectedTeachers.length} teacher(s) to:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{examSlots.find(s => s._id === selectedSlot)?.subject} exam</p>
                    <p className="text-sm text-gray-500">
                      {examSlots.find(s => s._id === selectedSlot)?.date && 
                        formatDate(examSlots.find(s => s._id === selectedSlot)!.date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {examSlots.find(s => s._id === selectedSlot)?.startTime} - 
                      {examSlots.find(s => s._id === selectedSlot)?.endTime}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={allocating}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAllocation}
                  disabled={allocating}
                  className="px-4 py-2 bg-[#9FC0AE] text-white rounded hover:bg-[#8BAF9A] disabled:opacity-70 flex items-center"
                >
                  {allocating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3">
            {/* Exam Slots Table */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">Available Exam Slots</h3>
              
              {examSlots.length === 0 ? (
                <div className="text-center p-10 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No exam slots available for this exam</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocks/Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examSlots.map((examSlot) => (
                        <React.Fragment key={examSlot._id}>
                          <tr className={`hover:bg-gray-50 transition-colors ${selectedSlot === examSlot._id ? 'bg-[#9FC0AE]/5' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar size={16} className="mr-2 text-gray-400" />
                                {new Date(examSlot.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{examSlot.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock size={16} className="mr-2 text-gray-400" />
                                {examSlot.startTime} - {examSlot.endTime}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {examSlot.blocks?.length ? (
                                <div className="flex flex-col">
                                  {examSlot.blocks.map((block, index) => (
                                    <div key={index} className="flex items-center mb-1 text-sm">
                                      <span className="font-medium mr-1">Block {block.number}</span>
                                      <span className="text-xs text-gray-500">
                                        ({block.capacity} seats, {block.location})
                                      </span>
                                      {block.invigilator && (
                                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                          Assigned
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span>{examSlot.block || 'No block specified'}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Users size={16} className="mr-2 text-gray-400" />
                                <span className="font-medium">{examSlot.allocatedTeachers?.length || 0}</span>
                                <span className="text-gray-500 ml-1">allocated</span>
                              </div>
                              {examSlot.allocatedTeachers?.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {examSlot.allocatedTeachers.map(teacherId => {
                                    const teacher = teachers.find(t => t._id === teacherId);
                                    return teacher ? teacher.name.split(' ')[0] : '';
                                  }).join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleExamSlotSelection(examSlot._id)}
                                aria-label={`Allocate teachers to ${examSlot.subject} exam`}
                                className="text-[#9FC0AE] hover:text-[#8BAF9A] font-medium"
                              >
                                {selectedSlot === examSlot._id ? 'Cancel Selection' : 
                                  examSlot.allocatedTeachers && examSlot.allocatedTeachers.length > 0 ? 
                                  'Edit Allocation' : 'Allocate Teachers'}
                              </button>
                            </td>
                          </tr>
                          {selectedSlot === examSlot._id && (
                            <tr>
                              <td colSpan={6} className="p-0 bg-gray-50 border-t border-b border-gray-200">
                                <div 
                                  id="teacher-selection" 
                                  className="bg-white shadow-inner rounded-lg p-6 transition-all duration-300"
                                >
                                  <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-medium">
                                      {isBlockMode ? 'Assign Teacher to Block' : 'Allocate Teachers to Exam'}
                                    </h3>
                                    <div className="text-sm text-gray-500">
                                      {examSlot.subject} • {formatDate(examSlot.date)}
                                    </div>
                                  </div>
                                  
                                  {/* Block Selector - Only show if blocks exist */}
                                  {examSlot.blocks && examSlot.blocks.length > 0 && (
                                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                      <h4 className="text-md font-medium mb-2">Select Block</h4>
                                      <p className="text-sm text-gray-500 mb-3">
                                        {isBlockMode && selectedBlock !== null 
                                          ? "Select a teacher to assign as invigilator for this block"
                                          : "Choose a block to allocate a teacher as an invigilator"}
                                      </p>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {examSlot.blocks?.map((block) => {
                                          const assignedTeacher = block.invigilator 
                                            ? teachers.find(t => t._id === block.invigilator) 
                                            : null;
                                            
                                          return (
                                            <div 
                                              key={block.number}
                                              onClick={() => {
                                                setSelectedBlock(selectedBlock === block.number ? null : block.number);
                                                // Clear teacher selection when changing blocks
                                                if (selectedBlock !== block.number) {
                                                  setSelectedTeachers([]);
                                                }
                                              }}
                                              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                selectedBlock === block.number ? 
                                                  'border-[#9FC0AE] bg-[#9FC0AE]/10 shadow-md' : 
                                                  'border-gray-200 hover:border-[#9FC0AE] hover:bg-gray-50'
                                              }`}
                                              aria-label={`Select Block ${block.number}`}
                                              role="button"
                                              tabIndex={0}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <h5 className="font-medium">Block {block.number}</h5>
                                                  <p className="text-xs text-gray-500">Capacity: {block.capacity}</p>
                                                  <p className="text-xs text-gray-500">Location: {block.location}</p>
                                                  {assignedTeacher && (
                                                    <p className="text-xs mt-1 font-medium text-[#9FC0AE]">
                                                      Assigned to: {assignedTeacher.name}
                                                    </p>
                                                  )}
                                                </div>
                                                {block.invigilator ? (
                                                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    Assigned
                                                  </div>
                                                ) : (
                                                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                    Unassigned
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Mode indicator */}
                                  {isBlockMode && selectedBlock !== null && (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                                      <div className="font-medium">Block Assignment Mode</div>
                                      <p className="text-sm">
                                        You are assigning an invigilator to Block {selectedBlock}. 
                                        Only one teacher can be selected.
                                      </p>
                                    </div>
                                  )}

                                  {/* Teacher Selection */}
                                  <div className="mt-4">
                                    <h4 className="text-md font-medium mb-2">
                                      {isBlockMode && selectedBlock !== null ? 'Select Invigilator' : 'Select Teachers'}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                      {teachers.map((teacher) => {
                                        const isAvailable = isTeacherAvailable(teacher, new Date(examSlot.date).toISOString().split('T')[0]);
                                        const isQualified = isTeacherQualified(teacher, examSlot.subject);
                                        const hasConflict = hasTimeConflict(teacher, examSlot, examSlots);
                                        const isAllocated = selectedTeachers.includes(teacher._id);
                                        const isAlreadyInBlock = examSlot.blocks?.some(
                                          block => block.invigilator === teacher._id && block.number !== selectedBlock
                                        );
      
                                        return (
                                          <div
                                            key={teacher._id}
                                            className={`p-4 rounded-lg border transition-all duration-200 ${
                                              isAllocated ? 'border-[#9FC0AE] bg-[#9FC0AE]/10 shadow-md' : 'border-gray-200'
                                            } ${!isAvailable || hasConflict || isAlreadyInBlock ? 'opacity-60' : ''}`}
                                          >
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <h4 className="font-medium">{teacher.name}</h4>
                                                <p className="text-sm text-gray-500">{teacher.email}</p>
                                                {isAllocated && (
                                                  <p className="text-xs text-[#9FC0AE] mt-1">Selected</p>
                                                )}
                                                <div className="mt-2">
                                                  <p className="text-xs text-gray-500">Specializations:</p>
                                                  <div className="flex flex-wrap gap-1 mt-1">
                                                    {teacher.subjects?.map((subject) => (
                                                      <span
                                                        key={subject}
                                                        className={`px-2 py-1 text-xs rounded-full ${
                                                          subject.toLowerCase() === examSlot.subject.toLowerCase() ||
                                                          examSlot.subject.toLowerCase().includes(subject.toLowerCase()) ||
                                                          subject.toLowerCase().includes(examSlot.subject.toLowerCase())
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100'
                                                        }`}
                                                      >
                                                        {subject}
                                                      </span>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                              <button
                                                onClick={() => handleTeacherSelection(teacher._id)}
                                                disabled={!isAvailable || hasConflict || isAlreadyInBlock}
                                                aria-label={isAllocated ? `Remove ${teacher.name}` : `Select ${teacher.name}`}
                                                className={`p-2 rounded-full transition-all duration-200 ${
                                                  isAllocated ? 'bg-[#9FC0AE] text-white scale-110' : 'bg-gray-100'
                                                } ${
                                                  (!isAvailable || hasConflict || isAlreadyInBlock) ? 
                                                    'opacity-50 cursor-not-allowed' : 'hover:bg-[#8BAF9A] hover:scale-105'
                                                }`}
                                              >
                                                {isAllocated ? <Check size={16} /> : '+'}
                                              </button>
                                            </div>
                                            {!isAvailable && (
                                              <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <AlertCircle size={14} className="mr-1" />
                                                Not available on this date
                                              </p>
                                            )}
                                            {hasConflict && (
                                              <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <AlertCircle size={14} className="mr-1" />
                                                Time conflict with another exam
                                              </p>
                                            )}
                                            {isAlreadyInBlock && (
                                              <p className="mt-2 text-sm text-orange-500 flex items-center">
                                                <AlertCircle size={14} className="mr-1" />
                                                Already assigned to another block
                                              </p>
                                            )}
                                            {!isQualified && (
                                              <p className="mt-2 text-sm text-yellow-500 flex items-center">
                                                <AlertTriangle size={14} className="mr-1" />
                                                Not specialized in this subject
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-6 flex justify-end">
                                    <button
                                      onClick={() => {
                                        setSelectedSlot('');
                                        setSelectedBlock(null);
                                        setSelectedTeachers([]);
                                        setIsBlockMode(false);
                                      }}
                                      className="mr-4 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleAllocation}
                                      disabled={
                                        selectedTeachers.length === 0 || 
                                        (isBlockMode && selectedBlock === null) || 
                                        (isBlockMode && selectedTeachers.length !== 1)
                                      }
                                      className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                      {isBlockMode && selectedBlock !== null ? 'Assign Invigilator to Block' : 'Allocate Selected Teachers'}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}