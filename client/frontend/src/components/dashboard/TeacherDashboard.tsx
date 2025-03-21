import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Calendar,
  ClipboardList,
  DollarSign,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Clock,
  FileText,
  MessageSquare
} from 'lucide-react';
import LogoTeacherDashboard from '../../assets/TeachQuestLogo.png';
import TeacherDashboardImage from '../../assets/Teacher-pana.png';
import { getTeacherStats, getTeacherUpcomingDuties } from '../../services/api';

interface TeacherStats {
  upcomingDuties: number;
  completedDuties: number;
  pendingReports: number;
  totalDuties: number;
}

interface UpcomingDuty {
  _id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}
// CardSkeleton Component
function CardSkeleton() {
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-300 rounded w-full"></div>
    </div>
  );
}

// DashboardCard Component
function DashboardCard({ title, description, icon, onClick, bgColor }: { title: string; description: string; icon: React.ReactNode; onClick: () => void; bgColor?: string }) {
  return (
    <div className={`p-6 rounded-lg shadow-md cursor-pointer ${bgColor || 'bg-white'}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">{title}</div>
        {icon}
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
interface StatsCardProps {
  title: string;
  value: number | string;
  trend: number;
  className?: string;
}

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, className = "" }) => {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      
      {/* Trend Display */}
      <p className={`mt-2 text-sm font-medium ${
        trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500"
      }`}>
        {trend > 0 ? `▲ +${trend}` : trend < 0 ? `▼ ${trend}` : "—"}
      </p>
    </div>
  );
};


// function StatsCard({ title, value, trend }: { title: string; value: string; trend: number }) {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-sm font-medium text-gray-500">{title}</h3>
//       <p className="text-2xl font-bold mt-2">{value}</p>
//       <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//         <span className="text-sm">{trend}% from last month</span>
//       </div>
//     </div>
//   );
// }

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [upcomingDuties, setUpcomingDuties] = useState<UpcomingDuty[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        
        // Fetch teacher stats
        const teacherStats = await getTeacherStats();
        setStats(teacherStats);
        
        // Fetch upcoming duties (limit to 5 for dashboard)
        const duties = await getTeacherUpcomingDuties(undefined, 5);
        setUpcomingDuties(duties);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError('Failed to load teacher data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeacherData();
    }
    
    // Update current time every minute
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, [user]);

  const dashboardCards = [
    {
      title: 'Upcoming Duties',
      description: 'View your assigned examination duties',
      icon: <Calendar size={24} />,
      onClick: () => navigate('/teacher/duties'),
      bgColor: 'bg-gradient-to-br from-[#D4ECDD] to-[#C2DFC5] text-black hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Exam Schedule',
      description: 'Check examination timetables',
      icon: <Clock size={24} />,
      onClick: () => navigate('/teacher/schedule'),
      bgColor: 'bg-white text-black border border-gray-300 hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Submit Reports',
      description: 'Submit examination duty reports',
      icon: <FileText size={24} />,
      onClick: () => navigate('/teacher/reports'),
      bgColor: 'bg-gradient-to-br from-[#D4ECDD] to-[#C2DFC5] text-black hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Duty History',
      description: 'View past examination duties',
      icon: <ClipboardList size={24} />,
      onClick: () => navigate('/teacher/history'),
      bgColor: 'bg-white text-black border border-gray-300 hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Remuneration',
      description: 'Track payment and compensation',
      icon: <DollarSign size={24} />,
      onClick: () => navigate('/teacher/remuneration'),
      bgColor: 'bg-gradient-to-br from-[#D4ECDD] to-[#C2DFC5] text-black hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Support',
      description: 'Get help and contact admin',
      icon: <MessageSquare size={24} />,
      onClick: () => navigate('/teacher/support'),
      bgColor: 'bg-white text-black border border-gray-300 hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-8" src={LogoTeacherDashboard} alt="Logo" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <button onClick={() => navigate('/teacher/dashboard')} className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</button>
                  <button onClick={() => navigate('/teacher/profile')} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Profile</button>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button 
                  onClick={() => navigate('/teacher/notifications')}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]">
                  <span className="sr-only">View notifications</span>
                  <Bell size={24} />
                </button>
                <button 
                  onClick={() => navigate('/teacher/search')}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-3">
                  <span className="sr-only">Search</span>
                  <Search size={24} />
                </button>
                <button 
                  onClick={() => navigate('/teacher/login')}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-3">
                  <span className="sr-only">Log out</span>
                  <LogOut size={24} />
                </button>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 w-full text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/teacher/profile')}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                >
                  Profile
                </button>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src="/teacher-avatar.png" alt="Teacher" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">Teacher Name</div>
                    <div className="text-sm font-medium text-gray-500">teacher@example.com</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={() => navigate('/teacher/notifications')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => navigate('/teacher/search')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => navigate('/teacher/login')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="mb-8">
  <div className="mb-8 flex items-center">
    <img src={TeacherDashboardImage} className="w-60 h-60" alt="Hero Section Image" />
    <div className="ml-4">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Teacher'}</h1>
      <p className="text-gray-600">
        {currentTime.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <p className="text-gray-600">
        {currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  </div>
</div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </>
          ) : (
            <>
              <StatsCard
                title="Upcoming Duties"
                value={stats?.upcomingDuties || 0}
                trend={0}
                className="transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              />
              <StatsCard
                title="Completed Duties"
                value={stats?.completedDuties || 0}
                trend={0}
                className="transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              />
              <StatsCard
                title="Pending Reports"
                value={stats?.pendingReports || 0}
                trend={0}
                className="transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              />
            </>
          )}
        </div>

        {/* Upcoming Duties Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Upcoming Duties</h2>
              <p className="mt-1 text-sm text-gray-500">View and manage your examination duties</p>
            </div>
            <button
              onClick={() => navigate('/teacher/duties')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto ring-1 ring-gray-300 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subject</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Loading duties...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : upcomingDuties.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                      No upcoming duties found.
                    </td>
                  </tr>
                ) : (
                  upcomingDuties.map((duty) => (
                    <tr key={duty._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {new Date(duty.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {duty.subject}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {duty.startTime} - {duty.endTime}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          duty.status === 'scheduled' 
                            ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' 
                            : duty.status === 'in-progress' 
                            ? 'bg-blue-50 text-blue-700 ring-blue-600/20' 
                            : 'bg-green-50 text-green-700 ring-green-600/20'
                        }`}>
                          {duty.status === 'scheduled' 
                            ? 'Scheduled' 
                            : duty.status === 'in-progress' 
                            ? 'In Progress' 
                            : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {loading ? (
    Array(6).fill(null).map((_, index) => (
      <CardSkeleton key={index} />
    ))
  ) : (
    dashboardCards.map((card, index) => (
      <DashboardCard
        key={index}
        title={card.title}
        description={card.description}
        icon={card.icon}
        onClick={card.onClick}
        bgColor={card.bgColor}
        
      />
    ))
  )}
</div>

      </main>
    </div>
  );
}