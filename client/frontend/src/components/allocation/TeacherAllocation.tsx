import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';

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
  const [blocks] = useState(['A', 'B', 'C', 'D']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch teachers
        const teachersResponse = await fetch('/api/users/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const teachersData = await teachersResponse.json();
        setTeachers(teachersData);

        // Fetch exam slots
        const examsResponse = await fetch(`/api/exams/${branch}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const examsData = await examsResponse.json();
        setExamSlots(examsData);

      } catch (error) {
        console.error('Error fetching data:', error);
console.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branch]);

  const handleBlockAssignment = async (slotId: string, block: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/exams/${slotId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ block })
      });

      setExamSlots(slots =>
        slots.map(slot =>
          slot.id === slotId ? { ...slot, block } : slot
        )
      );
    } catch (error) {
      console.error('Error updating block:', error);
      console.error('Failed to update block assignment');
    }
  };

  const handleTeacherSelection = (teacherId: string) => {
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(teachers => teachers.filter(id => id !== teacherId));
    } else {
      setSelectedTeachers(teachers => [...teachers, teacherId]);
    }
  };

  const handleAllocation = async () => {
    if (selectedSlot && selectedTeachers.length > 0) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/exams/${selectedSlot}/allocate`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ teacherIds: selectedTeachers })
        });

        setExamSlots(slots =>
          slots.map(slot =>
            slot.id === selectedSlot
              ? { ...slot, allocatedTeachers: selectedTeachers }
              : slot
          )
        );

        // Reset selection
        setSelectedSlot('');
        setSelectedTeachers([]);
      } catch (error) {
        console.error('Error allocating teachers:', error);
console.error('Failed to allocate teachers');
      }
    }
  };

  const isTeacherAvailable = (teacher: Teacher, date: string) => {
    return teacher.availability.includes(date);
  };

const isTeacherSubjectConflict = (teacher: Teacher, subjectId: string) => {
  // Check if the teacher's subjects array includes the exam subject ID
  if (!teacher.subjects || teacher.subjects.length === 0) {
    return true; // If teacher has no subjects, consider it a conflict
  }
  
  return !teacher.subjects.includes(subjectId);
};
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teacher Allocation</h2>
            <p className="mt-1 text-sm text-gray-500">{branch}</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{slot.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={slot.block}
                        onChange={(e) => handleBlockAssignment(slot.id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-[#9FC0AE] focus:ring-[#9FC0AE]"
                      >
                        {blocks.map((block) => (
                          <option key={block} value={block}>Block {block}</option>
                        ))}
                      </select>
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
                const isAvailable = slot ? isTeacherAvailable(teacher, slot.date) : true;
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