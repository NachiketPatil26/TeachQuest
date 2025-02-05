import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  ClipboardList,
  DollarSign,
  Bell,
  LogOut,
  Clock,
  LucideIcon
} from 'lucide-react';

function StatsCard({ title, value, trend, icon: Icon }: { title: string; value: string; trend: number; icon: LucideIcon }) {
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
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Upcoming Duties"
            value="5"
            trend={10}
            icon={ClipboardList}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/teacher/duties')}
            className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <ClipboardList className="h-6 w-6 text-blue-500" />
            <span>View Duties</span>
          </button>
          <button
            onClick={() => navigate('/teacher/remuneration')}
            className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <DollarSign className="h-6 w-6 text-green-500" />
            <span>Check Remuneration</span>
          </button>
          <button
            onClick={() => navigate('/teacher/notifications')}
            className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Bell className="h-6 w-6 text-yellow-500" />
            <span>View Notifications</span>
          </button>
        </div>
      </main>
    </div>
  );
}