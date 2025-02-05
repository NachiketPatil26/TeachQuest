import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  ClipboardList,
  DollarSign,
  Bell,
  LogOut,
  Clock,
  Settings,
  Search,
  Calendar
} from 'lucide-react';

// StatsCard Component
function StatsCard({ title, value, trend, icon: Icon }: { title: string; value: string; trend: number; icon: any }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span className="text-sm">{trend}% from last month</span>
          </div>
        </div>
        <Icon className="h-8 w-8 text-[#9FC0AE]" />
      </div>
    </div>
  );
}

// DashboardCard Component
function DashboardCard({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: any; onClick: () => void }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">{title}</div>
        <Icon className="h-6 w-6 text-[#9FC0AE]" />
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/teacher/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE]"></div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'View Duties',
      description: 'Check your upcoming invigilation duties',
      icon: ClipboardList,
      onClick: () => navigate('/teacher/duties')
    },
    {
      title: 'Check Remuneration',
      description: 'View your payment status and history',
      icon: DollarSign,
      onClick: () => navigate('/teacher/remuneration')
    },
    {
      title: 'Notifications',
      description: 'View important updates and announcements',
      icon: Bell,
      onClick: () => navigate('/teacher/notifications')
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
                  <a href="#" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]">
                  <span className="sr-only">View notifications</span>
                  <Bell size={24} />
                </button>
                <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-3">
                  <span className="sr-only">Search</span>
                  <Search size={24} />
                </button>
                <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-3">
                  <span className="sr-only">Settings</span>
                  <Settings size={24} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-3"
                >
                  <span className="sr-only">Log out</span>
                  <LogOut size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Clock className="h-4 w-4" />
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
            value="5"
            trend={10}
            icon={Calendar}
          />
          <StatsCard
            title="Pending Remuneration"
            value="₹15,000"
            trend={5}
            icon={DollarSign}
          />
          <StatsCard
            title="New Notifications"
            value="3"
            trend={-2}
            icon={Bell}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              onClick={card.onClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}