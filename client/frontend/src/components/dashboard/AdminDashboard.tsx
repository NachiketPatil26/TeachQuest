import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BarChart2, 
  Settings, 
  FileText, 
  Bell, 
  Activity,
  LogOut,
  ChevronDown,
  Search
} from 'lucide-react';

// Loading skeleton component for cards
function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

// Dashboard card component
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor?: string;
}

function DashboardCard({ title, description, icon, onClick, bgColor = 'bg-white' }: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${bgColor} p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 w-full text-left group`}
      aria-label={title}
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-[#E8EFEB] rounded-lg text-[#475F54] group-hover:bg-[#475F54] group-hover:text-white transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1 text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    // Add logout logic here
    navigate('/admin/login');
  };

  const dashboardCards = [
    {
      title: 'User Management',
      description: 'Manage teachers and staff accounts',
      icon: <Users size={24} />,
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Analytics & Reports',
      description: 'View detailed statistics and generate reports',
      icon: <BarChart2 size={24} />,
      onClick: () => navigate('/admin/analytics')
    },
    {
      title: 'Settings & Configuration',
      description: 'Configure system preferences and options',
      icon: <Settings size={24} />,
      onClick: () => navigate('/admin/settings')
    },
    {
      title: 'Content Management',
      description: 'Manage timetables and schedules',
      icon: <FileText size={24} />,
      onClick: () => navigate('/admin/content')
    },
    {
      title: 'System Notifications',
      description: 'View and manage system notifications',
      icon: <Bell size={24} />,
      onClick: () => navigate('/admin/notifications')
    },
    {
      title: 'Activity Logs',
      description: 'Track system and user activities',
      icon: <Activity size={24} />,
      onClick: () => navigate('/admin/logs')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/teachquest-logo.png" alt="TeachQuest" className="h-8" />
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9FC0AE] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=40&h=40"
                    alt="Admin"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Admin</h1>
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Show loading skeletons
            Array(6).fill(null).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          ) : (
            // Show dashboard cards
            dashboardCards.map((card, index) => (
              <DashboardCard
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onClick={card.onClick}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}