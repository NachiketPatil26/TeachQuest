import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar, PieChart, Pie, Cell } from 'recharts';

import { getExams, getTeachers } from '../../services/api';

interface AnalyticsProps {
  branch?: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subjects: string[];
  availability: string[];
  allocatedDuties?: number;
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

interface SubjectDistribution {
  subject: string;
  count: number;
}

interface TeacherWorkload {
  name: string;
  duties: number;
}

interface WorkloadMetric {
  range: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FCCDE5', '#8DD1E1', '#A4DE6C', '#D0ED57'];

export default function DashboardAnalytics({ branch }: AnalyticsProps) {
  const { semester } = useParams<{ semester: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjectDistribution, setSubjectDistribution] = useState<SubjectDistribution[]>([]);
  const [teacherWorkload, setTeacherWorkload] = useState<TeacherWorkload[]>([]);
  const [workloadMetrics, setWorkloadMetrics] = useState<WorkloadMetric[]>([]);

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
        setTeachers(teachersData);

        // Fetch exam slots
        if (branch && semester) {
          const examsData = await getExams(branch, Number(semester));
          if (!examsData || !Array.isArray(examsData)) {
            throw new Error('Invalid exam slots data received');
          }
          setExamSlots(examsData);

          // Calculate subject distribution
          const subjectCounts: Record<string, number> = {};
          examsData.forEach((exam) => {
            subjectCounts[exam.subject] = (subjectCounts[exam.subject] || 0) + 1;
          });

          const subjectData = Object.entries(subjectCounts).map(([subject, count]) => ({
            subject,
            count,
          }));
          setSubjectDistribution(subjectData);

          // Calculate teacher workload
          const teacherDutyCounts: Record<string, number> = {};
          examsData.forEach((exam) => {
            exam.allocatedTeachers.forEach((teacherId: string) => {
              teacherDutyCounts[teacherId] = (teacherDutyCounts[teacherId] || 0) + 1;
            });
          });

          const workloadData = teachersData
            .map((teacher) => ({
              name: teacher.name,
              duties: teacherDutyCounts[teacher._id] || 0,
            }))
            .sort((a, b) => b.duties - a.duties)
            .slice(0, 10); // Top 10 teachers by workload

          setTeacherWorkload(workloadData);

          // Calculate workload distribution metrics
          const workloadRanges = [
            { range: '0 duties', count: 0 },
            { range: '1-2 duties', count: 0 },
            { range: '3-5 duties', count: 0 },
            { range: '6+ duties', count: 0 },
          ];

          teachersData.forEach((teacher) => {
            const duties = teacherDutyCounts[teacher._id] || 0;
            if (duties === 0) workloadRanges[0].count++;
            else if (duties <= 2) workloadRanges[1].count++;
            else if (duties <= 5) workloadRanges[2].count++;
            else workloadRanges[3].count++;
          });

          setWorkloadMetrics(workloadRanges);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        console.error('Error fetching analytics data:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branch, semester]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Subject Distribution Chart */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Subject Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#9FC0AE" name="Number of Exams" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Teacher Workload Chart */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Teacher Workload (Top 10)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teacherWorkload} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="duties" fill="#8884d8" name="Number of Duties" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workload Distribution Pie Chart */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Workload Distribution</h2>
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={workloadMetrics}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
                nameKey="range"
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {workloadMetrics.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Exams</h3>
          <p className="text-3xl font-bold">{examSlots.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Teachers</h3>
          <p className="text-3xl font-bold">{teachers.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Average Duties Per Teacher</h3>
          <p className="text-3xl font-bold">
            {teachers.length > 0
              ? (teacherWorkload.reduce((sum, item) => sum + item.duties, 0) / teachers.length).toFixed(1)
              : '0'}
          </p>
        </div>
      </div>
    </div>
  );
}