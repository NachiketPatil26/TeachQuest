/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Plus, Search, Filter, Download, X } from 'lucide-react';
import ExamForm from '../../components/exam/ExamForm';

interface ExamSchedule {
  id: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  venue: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  maxStudents?: number;
}

interface ExamFormSubmitData {
  subject: string;
  date: string;
  startTime: string;
  duration: number;
  venue: string;
  block: string;
  maxStudents: number;
}

export default function TimetablePage() {
  const { branch } = useParams<{ branch: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [error, setError] = useState<string>('');
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    fetchExams();
  }, [branch]);

  const fetchExams = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:3000/api/exams?branch=${branch}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch exams');
      }

      const data = await response.json();
      setExamSchedules(data.map((exam: any) => ({
        id: exam._id,
        subject: exam.subject,
        date: exam.date,
        time: exam.startTime,
        duration: `${Math.floor(exam.duration / 60)} hours ${exam.duration % 60 > 0 ? `${exam.duration % 60} minutes` : ''}`,
        venue: `${exam.block} - ${exam.venue}`,
        status: exam.status || 'scheduled',
        maxStudents: exam.maxStudents
      })));
    } catch (err) {
      console.error('Error fetching exams:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exams';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamSubmit = async (examData: ExamFormSubmitData & { cancelled?: boolean }) => {
    if (examData.cancelled) {
      setIsModalOpen(false);
      setEditingExam(null);
      return;
    }

    setIsLoading(true);
    setError('');
  
    try {
      const endpoint = editingExam 
        ? `http://localhost:3000/api/exams/${editingExam.id}`
        : 'http://localhost:3000/api/exams';
    
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(endpoint, {
        method: editingExam ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: examData.subject,
          date: examData.date,
          startTime: examData.startTime,
          duration: examData.duration,
          venue: examData.venue,
          block: examData.block,
          maxStudents: examData.maxStudents,
          branch: branch,
          status: 'scheduled'
        })
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save exam');
      }

      const result = await response.json();
      console.log('Exam saved successfully:', result);
    
      await fetchExams(); // Refresh the exam list
      setIsModalOpen(false);
      setEditingExam(null);
    } catch (err) {
      console.error('Error saving exam:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save exam';
      setError(errorMessage);
      alert(errorMessage); // Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }

      await fetchExams(); // Refresh the exam list
      setError('');
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete exam');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExams = () => {
    try {
      const csvContent = [
        ['Subject', 'Date', 'Time', 'Duration', 'Venue', 'Status'].join(','),
        ...examSchedules.map(exam => [
          exam.subject,
          exam.date,
          exam.time,
          exam.duration,
          exam.venue,
          exam.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `exam_schedule_${branch}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Frontend: Error exporting exams:', err);
      setError(err instanceof Error ? err.message : 'Failed to export exams');
    }
  };

  const getStatusColor = (status: ExamSchedule['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Exam Timetable</h1>
              <p className="mt-1 text-sm text-gray-500">{branch} Department</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Exam
              </button>
              <button
                onClick={handleExportExams}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
              >
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-sm">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-[#9FC0AE] focus:border-[#9FC0AE] block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                >
                  <Filter className="-ml-1 mr-2 h-5 w-5" />
                  Filter
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
                >
                  <Calendar className="-ml-1 mr-2 h-5 w-5" />
                  Calendar View
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examSchedules.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.venue}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setEditingExam(exam);
                          setIsModalOpen(true);
                        }}
                        className="text-[#9FC0AE] hover:text-[#8BAF9A]"
                      >
                        Edit
                      </button>
                      <span className="mx-2">|</span>
                      <button 
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

   
    {isModalOpen && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-3xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingExam ? 'Edit Exam' : 'Add New Exam'}
            </h2>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingExam(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <ExamForm
            onSubmit={handleExamSubmit}
            initialData={editingExam ? {
              subject: editingExam.subject,
              date: editingExam.date,
              startTime: editingExam.time,
              duration: parseInt(editingExam.duration),
              venue: editingExam.venue,
              block: editingExam.venue.split(' - ')[0],
              maxStudents: 60 // Default value
            } : undefined}
            isEditing={!!editingExam}
          />
        </div>
      </div>
    )}
  </>
  )
}