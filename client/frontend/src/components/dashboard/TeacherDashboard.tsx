import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Stats Card Component
function StatsCard({ title, value, trend }: { title: string; value: string; trend: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        <span className="text-sm">{trend}% from last month</span>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 1000);
    // Update current time every minute
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dashboardCards = [
    {
      title: 'Upcoming Duties',
      description: 'View your assigned examination duties',
      icon: <Calendar size={24} />,
      onClick: () => navigate('/teacher/duties'),
      bgColor: 'bg-gradient-to-br from-[#9FC0AE] to-[#8BAF9A] text-white'
    },
    {
      title: 'Exam Schedule',
      description: 'Check examination timetables',
      icon: <Clock size={24} />,
      onClick: () => navigate('/teacher/schedule')
    },
    {
      title: 'Submit Reports',
      description: 'Submit examination duty reports',
      icon: <FileText size={24} />,
      onClick: () => navigate('/teacher/reports')
    },
    {
      title: 'Duty History',
      description: 'View past examination duties',
      icon: <ClipboardList size={24} />,
      onClick: () => navigate('/teacher/history')
    },
    {
      title: 'Remuneration',
      description: 'Track payment and compensation',
      icon: <DollarSign size={24} />,
      onClick: () => navigate('/teacher/remuneration')
    },
    {
      title: 'Support',
      description: 'Get help and contact admin',
      icon: <MessageSquare size={24} />,
      onClick: () => navigate('/teacher/support')
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
                <img className="h-8 w-8" src="/logo.svg" alt="Logo" />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Teacher</h1>
          <p className="text-gray-600">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Upcoming Duties"
            value="3"
            trend={0}
          />
          <StatsCard
            title="Completed Duties"
            value="12"
            trend={8}
          />
          <StatsCard
            title="Pending Reports"
            value="2"
            trend={-1}
          />
        </div>

        {/* Upcoming Duties Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upcoming Duties</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">2024-03-15</td>
                  <td className="px-6 py-4 whitespace-nowrap">Mathematics</td>
                  <td className="px-6 py-4 whitespace-nowrap">09:00 AM</td>
                  <td className="px-6 py-4 whitespace-nowrap">Room 101</td>
                </tr>
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