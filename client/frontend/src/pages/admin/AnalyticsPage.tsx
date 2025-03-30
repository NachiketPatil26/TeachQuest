import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar, 
  PieChart, Pie, Cell,  AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, 
} from 'recharts';
import {  BookOpen, Users, CheckCircle, TrendingUp } from 'lucide-react';

import { getExams, getTeachers } from '../../services/api';
import { getAnalyticsData } from '../../services/api-analytics';




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

interface ExamStatusData {
  status: string;
  count: number;
}

interface TeacherPerformance {
  name: string;
  completionRate: number;
  responseTime: number;
  score: number;
}

interface TimeDistribution {
  time: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FCCDE5', '#8DD1E1', '#A4DE6C', '#D0ED57'];
const CARD_SHADOW = 'shadow-md hover:shadow-lg transition-shadow duration-300';

export default function AnalyticsPage() {
  const { branch, semester } = useParams<{ branch: string; semester?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjectDistribution, setSubjectDistribution] = useState<SubjectDistribution[]>([]);
  const [teacherWorkload, setTeacherWorkload] = useState<TeacherWorkload[]>([]);
  const [workloadMetrics, setWorkloadMetrics] = useState<WorkloadMetric[]>([]);
  const [examStatusData, setExamStatusData] = useState<ExamStatusData[]>([]);
  const [teacherPerformance, setTeacherPerformance] = useState<TeacherPerformance[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch teachers for reference
        const teachersData = await getTeachers();
        if (!teachersData || !Array.isArray(teachersData)) {
          throw new Error('Invalid teachers data received');
        }
        setTeachers(teachersData);

        // Fetch analytics data
        if (branch) {
          // Get analytics data from the API
          const analyticsData = await getAnalyticsData(branch, semester ? Number(semester) : undefined);
          
          // Set exam slots if needed for other components
          if (semester) {
            const examsData = await getExams(branch, Number(semester));
            if (!examsData || !Array.isArray(examsData)) {
              throw new Error('Invalid exam slots data received');
            }
            setExamSlots(examsData);
          }
          
          // Set subject distribution from analytics data
          setSubjectDistribution(analyticsData.subjectDistribution || []);
          
          // Set exam status distribution
          if (analyticsData.statusDistribution && analyticsData.statusDistribution.length > 0) {
            setExamStatusData(analyticsData.statusDistribution);
          } else {
            // Provide default data if no status distribution is available
            setExamStatusData([
              { status: 'Scheduled', count: 0 },
              { status: 'In Progress', count: 0 },
              { status: 'Completed', count: 0 }
            ]);
          }
          console.log('Exam status distribution:', analyticsData.statusDistribution);
          
          // Set teacher workload from analytics data
          // Map to the format expected by the component
          console.log('Analytics data received:', analyticsData);
          console.log('Teacher workload data:', analyticsData.teacherWorkload);
          
          // Check if teacherWorkload array exists and has items
          if (!analyticsData.teacherWorkload || analyticsData.teacherWorkload.length === 0) {
            console.warn('No teacher workload data available');
            setTeacherWorkload([]);
          } else {
            const workloadData = analyticsData.teacherWorkload
              .map((item) => ({
                name: item.teacherName || 'Unknown Teacher',
                duties: item.totalDuties || 0,
              }))
              .sort((a, b) => b.duties - a.duties)
              .slice(0, 10); // Top 10 teachers by workload
            
            console.log('Processed workload data:', workloadData);
            setTeacherWorkload(workloadData);
          }
          
          // Calculate workload distribution metrics
          const workloadRanges = [
            { range: '0 duties', count: 0 },
            { range: '1-2 duties', count: 0 },
            { range: '3-5 duties', count: 0 },
            { range: '6+ duties', count: 0 },
          ];

          // Use the analytics data to populate workload ranges
          if (analyticsData.teacherWorkload && analyticsData.teacherWorkload.length > 0) {
            analyticsData.teacherWorkload.forEach((teacher) => {
              const duties = teacher.totalDuties || 0;
              if (duties === 0) workloadRanges[0].count++;
              else if (duties <= 2) workloadRanges[1].count++;
              else if (duties <= 5) workloadRanges[2].count++;
              else workloadRanges[3].count++;
            });
          } else {
            console.warn('No teacher workload data available for metrics calculation');
          }
          
          console.log('Workload metrics:', workloadRanges);

          setWorkloadMetrics(workloadRanges);
          
          // Generate teacher performance data (simulated for now)
          if (analyticsData.teacherWorkload && analyticsData.teacherWorkload.length > 0) {
            const performanceData = analyticsData.teacherWorkload
              .slice(0, 5)
              .map(teacher => ({
                name: teacher.teacherName || 'Unknown',
                completionRate: teacher.completedDuties / Math.max(teacher.totalDuties, 1) * 100,
                responseTime: Math.floor(Math.random() * 24) + 1, // Simulated response time in hours
                score: Math.floor(Math.random() * 30) + 70 // Simulated performance score out of 100
              }));
            setTeacherPerformance(performanceData);
          }
          
          // Generate time distribution data (simulated for now)
          const timeSlots = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];
          const timeData = timeSlots.map(time => ({
            time,
            count: Math.floor(Math.random() * 10) + 1
          }));
          setTimeDistribution(timeData);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Analytics Dashboard</h1>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Summary Statistics - Row 1 */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} flex items-center col-span-1`}>
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Exams</h3>
            <p className="text-2xl font-bold text-gray-800">{examSlots.length}</p>
          </div>
        </div>
        
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} flex items-center col-span-1`}>
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Teachers</h3>
            <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
          </div>
        </div>
        
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} flex items-center col-span-1`}>
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Avg. Duties</h3>
            <p className="text-2xl font-bold text-gray-800">
              {teachers.length > 0
                ? (teacherWorkload.reduce((sum, item) => sum + item.duties, 0) / teachers.length).toFixed(1)
                : '0'}
            </p>
          </div>
        </div>
        
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} flex items-center col-span-1`}>
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <CheckCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="text-2xl font-bold text-gray-800">
              {`${((teacherWorkload.filter(item => item.duties > 0).length / Math.max(teachers.length, 1)) * 100).toFixed(1)}%`}
            </p>
          </div>
        </div>
        
        {/* Subject Distribution - Spans 2 columns */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} col-span-2 row-span-2`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Subject Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
                <Legend />
                <Bar dataKey="count" fill="#9FC0AE" name="Number of Exams" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Exam Status Distribution - Spans 2 columns */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} col-span-2 row-span-2`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Exam Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={examStatusData && examStatusData.length > 0 ? examStatusData : [
                    { status: 'No Data', count: 1 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {examStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Teacher Workload - Spans full width */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} col-span-full`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Teacher Workload (Top 10)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherWorkload} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
                <Legend />
                <Bar dataKey="duties" fill="#8884d8" name="Number of Duties" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Workload Distribution - Spans 2 columns */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} col-span-2`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Workload Distribution</h2>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="range"
                  label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {workloadMetrics.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Exam Time Distribution - Spans 2 columns */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} col-span-2`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Exam Time Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeDistribution}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" name="Number of Exams" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Teacher Performance Radar - Spans 2 columns */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} col-span-2`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Teacher Performance</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teacherPerformance}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Radar name="Performance Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Completion Rate" dataKey="completionRate" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Legend />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Response Time Scatter - Spans 2 columns */}
        <div className={`p-6 bg-white rounded-lg ${CARD_SHADOW} col-span-2`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Response Time vs Completion Rate</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="responseTime" name="Response Time (hours)" tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="completionRate" name="Completion Rate (%)" tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
                <Scatter name="Teachers" data={teacherPerformance} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}