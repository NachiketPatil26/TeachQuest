import { useState, useEffect, useCallback } from 'react';
import { getTeachers, getExams } from '../../services/api';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subjects: string[];
  availability: string[];
  workload?: number; // Number of allocated duties
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
}

interface WorkloadManagerProps {
  branch?: string;
  semester?: string;
  onTeachersSelected?: (teacherIds: string[]) => void;
  examId?: string;
}

export default function WorkloadManager({ branch, semester, onTeachersSelected, examId }: WorkloadManagerProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<ExamSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamSlot | null>(null);
  const [suggestedTeachers, setSuggestedTeachers] = useState<Teacher[]>([]);
  const [allocationStrategy, setAllocationStrategy] = useState<'balanced' | 'expertise' | 'availability'>('balanced');

  // Function to check if a teacher is available on a specific date
  const isTeacherAvailable = useCallback((teacher: Teacher, examDate: string): boolean => {
    if (!teacher.availability || !Array.isArray(teacher.availability)) {
      return false;
    }
    
    try {
      // Ensure the date is properly formatted
      let dateObj;
      if (examDate.includes('T')) {
        // If the date is in ISO format
        dateObj = new Date(examDate);
      } else if (examDate.includes('-')) {
        // If the date is in YYYY-MM-DD format
        const [year, month, day] = examDate.split('-').map(Number);
        dateObj = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
      } else if (examDate.includes('/')) {
        // If the date is in MM/DD/YYYY format
        const [month, day, year] = examDate.split('/').map(Number);
        dateObj = new Date(year, month - 1, day);
      } else {
        // Try direct parsing as a fallback
        dateObj = new Date(examDate);
      }
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date format:', examDate);
        return false;
      }
      
      // Get the weekday name from the exam date
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      console.log('Checking availability for', teacher.name, 'on', weekday, '- Available days:', teacher.availability);
      
      // Check if the teacher is available on this weekday
      return teacher.availability.includes(weekday);
    } catch (error) {
      console.error('Error checking teacher availability:', error);
      return false;
    }
  }, []);

  // Function to check if a teacher has subject expertise
  const hasSubjectExpertise = useCallback((teacher: Teacher, subject: string): boolean => {
    if (!teacher.subjects || !Array.isArray(teacher.subjects)) {
      return false;
    }
    return teacher.subjects.some(s => s.toLowerCase() === subject.toLowerCase());
  }, []);

  // Function to check for scheduling conflicts
  const hasSchedulingConflict = useCallback((teacher: Teacher, exam: ExamSlot): boolean => {
    // Check if teacher is already allocated to another exam on the same date and time
    try {
      if (!exam || !exam.date || !exam.startTime || !exam.endTime) {
        console.error('Invalid exam data for conflict check:', exam);
        return true; // Assume conflict if exam data is invalid
      }

      const hasConflict = exams.some(e => {
        // Skip if comparing with the same exam
        if (e._id === exam._id) return false;
        
        // Skip if teacher is not allocated to this exam
        if (!e.allocatedTeachers || !e.allocatedTeachers.includes(teacher._id)) return false;
        
        // Skip if not on the same date
        if (e.date !== exam.date) return false;
        
        // Check for time overlap
        const timeOverlap = (
          (e.startTime <= exam.startTime && e.endTime > exam.startTime) || 
          (e.startTime < exam.endTime && e.endTime >= exam.endTime) ||
          (exam.startTime <= e.startTime && exam.endTime >= e.endTime)
        );
        
        if (timeOverlap) {
          console.log(`Scheduling conflict found for ${teacher.name} with exam ${e.subject} at ${e.startTime}-${e.endTime}`);
        }
        
        return timeOverlap;
      });
      
      return hasConflict;
    } catch (error) {
      console.error('Error checking scheduling conflict:', error);
      return true; // Assume conflict if there's an error
    }
  }, [exams]);

  // Generate suggested teachers based on the selected strategy
  const generateSuggestedTeachers = useCallback((exam: ExamSlot | null, teachersList: Teacher[], strategy: string) => {
    if (!exam) {
      console.log('No exam selected for teacher suggestions');
      setSuggestedTeachers([]);
      return;
    }

    console.log('Generating suggested teachers for exam:', exam.subject, 'with strategy:', strategy);
    
    // Filter out teachers with scheduling conflicts
    const availableTeachers = teachersList.filter(teacher => {
      const noConflict = !hasSchedulingConflict(teacher, exam);
      const isAvailable = isTeacherAvailable(teacher, exam.date);
      
      if (!isAvailable) {
        console.log(`Teacher ${teacher.name} is not available on ${exam.date}`);
      }
      
      if (!noConflict) {
        console.log(`Teacher ${teacher.name} has a scheduling conflict`);
      }
      
      return noConflict && isAvailable;
    });

    console.log('Available teachers count:', availableTeachers.length);
    
    let suggested: Teacher[] = [];

    switch (strategy) {
      case 'balanced':
        // Sort by workload (ascending) to balance duties
        suggested = [...availableTeachers].sort((a, b) => (a.workload || 0) - (b.workload || 0));
        break;
      case 'expertise':
        // Prioritize teachers with subject expertise
        suggested = [...availableTeachers].sort((a, b) => {
          const aHasExpertise = hasSubjectExpertise(a, exam.subject) ? 1 : 0;
          const bHasExpertise = hasSubjectExpertise(b, exam.subject) ? 1 : 0;
          return bHasExpertise - aHasExpertise || (a.workload || 0) - (b.workload || 0);
        });
        break;
      case 'availability':
        // Sort by availability (teachers with more available days first)
        suggested = [...availableTeachers].sort((a, b) => 
          (b.availability?.length || 0) - (a.availability?.length || 0)
        );
        break;
      default:
        suggested = availableTeachers;
    }

    const topSuggestions = suggested.slice(0, 10); // Limit to top 10 suggestions
    console.log('Top suggested teachers:', topSuggestions.map(t => t.name).join(', '));
    setSuggestedTeachers(topSuggestions);
  }, [hasSchedulingConflict, isTeacherAvailable, hasSubjectExpertise]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch teachers
        const teachersData = await getTeachers();
        if (!teachersData || !Array.isArray(teachersData)) {
          throw new Error('Invalid teachers data received');
        }

        // Fetch exams
        if (branch && semester) {
          const examsData = await getExams(branch, semester);
          if (!examsData || !Array.isArray(examsData)) {
            throw new Error('Invalid exam data received');
          }
          setExams(examsData);

          // Calculate current workload for each teacher
          const teacherWorkload: Record<string, number> = {};
          examsData.forEach(exam => {
            exam.allocatedTeachers.forEach((teacherId: string) => {
              teacherWorkload[teacherId] = (teacherWorkload[teacherId] || 0) + 1;
            });
          });

          // Add workload to teacher objects
          const teachersWithWorkload = teachersData.map(teacher => ({
            ...teacher,
            workload: teacherWorkload[teacher._id] || 0
          }));

          setTeachers(teachersWithWorkload);

          // If examId is provided and not empty, find the selected exam
          if (examId && examId.trim() !== '') {
            const exam = examsData.find(e => e._id === examId);
            if (exam) {
              setSelectedExam(exam);
              // Call the function directly here instead of using the callback
              console.log('Found exam for ID:', examId, 'Subject:', exam.subject);
              generateSuggestedTeachers(exam, teachersWithWorkload, allocationStrategy);
            } else {
              console.log('No exam found for ID:', examId);
              setSuggestedTeachers([]);
            }
          } else {
            // Don't log an error for empty examId as this is an expected initial state
            setSuggestedTeachers([]);
          }
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
  }, [branch, semester, examId, allocationStrategy, hasSchedulingConflict, isTeacherAvailable, hasSubjectExpertise]);
  // Removed generateSuggestedTeachers from dependencies to avoid infinite loop

  const handleStrategyChange = (strategy: 'balanced' | 'expertise' | 'availability') => {
    console.log('Changing allocation strategy to:', strategy);
    setAllocationStrategy(strategy);
    if (selectedExam) {
      console.log('Regenerating teacher suggestions with new strategy');
      generateSuggestedTeachers(selectedExam, teachers, strategy);
    } else {
      console.log('No exam selected, cannot generate teacher suggestions');
    }
  };

  const handleSelectTeachers = () => {
    if (onTeachersSelected && suggestedTeachers.length > 0) {
      // Select top 3 teachers or all if less than 3
      const selectedIds = suggestedTeachers
        .slice(0, Math.min(3, suggestedTeachers.length))
        .map(teacher => teacher._id);
      onTeachersSelected(selectedIds);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Workload Management</h2>
      
      {/* Allocation Strategy Selector */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Allocation Strategy</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleStrategyChange('balanced')}
            className={`px-3 py-1 rounded text-sm ${allocationStrategy === 'balanced' ? 'bg-[#9FC0AE] text-white' : 'bg-gray-100'}`}
          >
            Balanced Workload
          </button>
          <button
            onClick={() => handleStrategyChange('expertise')}
            className={`px-3 py-1 rounded text-sm ${allocationStrategy === 'expertise' ? 'bg-[#9FC0AE] text-white' : 'bg-gray-100'}`}
          >
            Subject Expertise
          </button>
          <button
            onClick={() => handleStrategyChange('availability')}
            className={`px-3 py-1 rounded text-sm ${allocationStrategy === 'availability' ? 'bg-[#9FC0AE] text-white' : 'bg-gray-100'}`}
          >
            Availability
          </button>
        </div>
      </div>

      {/* Suggested Teachers */}
      <div>
        <h3 className="text-md font-medium mb-2">Suggested Teachers</h3>
        {suggestedTeachers.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {suggestedTeachers.map(teacher => (
              <div key={teacher._id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{teacher.name}</div>
                  <div className="text-sm text-gray-500">
                    Current workload: {teacher.workload} duties
                    {hasSubjectExpertise(teacher, selectedExam?.subject || '') && 
                      <span className="ml-2 text-green-500">• Subject expert</span>}
                  </div>
                </div>
                <div className="text-sm">
                  Available: {teacher.availability?.join(', ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No suggested teachers available</div>
        )}

        {suggestedTeachers.length > 0 && onTeachersSelected && (
          <button
            onClick={handleSelectTeachers}
            className="mt-4 px-4 py-2 bg-[#9FC0AE] text-white rounded hover:bg-[#8BAF9A] transition-colors"
          >
            Auto-Allocate Teachers
          </button>
        )}
      </div>

      {/* Workload Summary */}
      <div className="mt-6">
        <h3 className="text-md font-medium mb-2">Workload Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Total Teachers</div>
            <div className="text-xl font-semibold">{teachers.length}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Total Exams</div>
            <div className="text-xl font-semibold">{exams.length}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Avg. Duties/Teacher</div>
            <div className="text-xl font-semibold">
              {teachers.length > 0 
                ? (teachers.reduce((sum, t) => sum + (t.workload || 0), 0) / teachers.length).toFixed(1) 
                : '0'}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Max Workload</div>
            <div className="text-xl font-semibold">
              {teachers.length > 0 
                ? Math.max(...teachers.map(t => t.workload || 0))
                : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}