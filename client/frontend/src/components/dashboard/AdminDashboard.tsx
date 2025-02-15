import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BarChart2, 
  Settings, 
  Calendar,
  Upload,
  ClipboardList,
  DollarSign,
  Bell,
  Search,
  LogOut,
  Menu,
  X
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

// New Stats Card Component
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [branches, setBranches] = useState<string[]>(['Computer Science', 'Artificial Intelligence & Data Science', 'Information Technology']);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Science');

  const handleAddBranch = () => {
    if (newBranch.trim() && !branches.includes(newBranch.trim())) {
      setBranches([...branches, newBranch.trim()]);
      setNewBranch('');
      setShowAddBranch(false);
    }
  };

  // Branch Selector with Add Branch button
  <div className="mb-8 space-y-4">
    <div className="flex justify-between items-center">
      <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Select Branch</label>
      <button
        onClick={() => setShowAddBranch(!showAddBranch)}
        className="text-sm text-[#9FC0AE] hover:text-[#8BAF9A] focus:outline-none"
      >
        + Add New Branch
      </button>
    </div>
    {showAddBranch && (
      <div className="flex gap-2">
        <input
          type="text"
          value={newBranch}
          onChange={(e) => setNewBranch(e.target.value)}
          placeholder="Enter branch name"
          className="flex-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE] sm:text-sm rounded-md"
        />
        <button
          onClick={handleAddBranch}
          className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-[#9FC0AE] focus:ring-offset-2"
        >
          Add
        </button>
      </div>
    )}
    <select
      id="branch"
      name="branch"
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE] sm:text-sm rounded-md"
      value={selectedBranch}
      onChange={(e) => setSelectedBranch(e.target.value)}
    >
      {branches.map((branch) => (
        <option key={branch} value={branch}>{branch}</option>
      ))}
    </select>
  </div>

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 1000);
    // Update current time every minute
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dashboardCards = [
    {
      title: 'Exam Timetable',
      description: 'Upload and manage examination schedules',
      icon: <Calendar size={24} />,
      onClick: () => navigate(`/admin/timetable/${selectedBranch}`),
      bgColor: 'bg-gradient-to-br from-[#9FC0AE] to-[#8BAF9A] text-white'
    },
    {
      title: 'Teacher Allocation',
      description: 'Manage exam duty assignments',
      icon: <Users size={24} />,
      onClick: () => navigate(`/admin/allocation/${selectedBranch}`)
    },
    {
      title: 'Upload Excel Data',
      description: 'Import timetables and teacher data',
      icon: <Upload size={24} />,
      onClick: () => document.getElementById('excelUpload')?.click()
    },
    {
      title: 'Duty Reports',
      description: 'View and track teacher duties',
      icon: <ClipboardList size={24} />,
      onClick: () => navigate(`/admin/duties/${selectedBranch}`)
    },
    {
      title: 'Remuneration',
      description: 'Manage payment and compensation',
      icon: <DollarSign size={24} />,
      onClick: () => navigate(`/admin/remuneration/${selectedBranch}`)
    },
    {
      title: 'Analytics',
      description: 'View duty statistics and insights',
      icon: <BarChart2 size={24} />,
      onClick: () => navigate(`/admin/analytics/${selectedBranch}`)
    }
  ];

  // Handle excel file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('Uploading file:', file.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        type="file"
        id="excelUpload"
        hidden
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
      />

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
                  <button onClick={() => navigate('/admin/dashboard')} className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</button>
                  <button onClick={() => navigate('/admin/settings')} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Settings</button>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button 
                  onClick={() => navigate('/admin/notifications')}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]">
                  <span className="sr-only">View notifications</span>
                  <Bell size={24} />
                </button>
                <button 
                  onClick={() => navigate('/admin/search')}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-3">
                  <span className="sr-only">Search</span>
                  <Search size={24} />
                </button>
                <button 
                  onClick={() => navigate('/admin/settings')}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE] ml-3">
                  <span className="sr-only">Settings</span>
                  <Settings size={24} />
                </button>
                <button 
                  onClick={() => navigate('/admin/login')}
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
                  onClick={() => navigate('/admin/dashboard')}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 w-full text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                >
                  Settings
                </button>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src="/admin-avatar.png" alt="Admin" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">Admin User</div>
                    <div className="text-sm font-medium text-gray-500">admin@example.com</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={() => navigate('/admin/notifications')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => navigate('/admin/search')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => navigate('/admin/login')}
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

        {/* Branch Selector */}
        <div className="mb-8">
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Select Branch</label>
          <select
            id="branch"
            name="branch"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branches.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Active Teachers"
            value="124"
            trend={5}
          />
          <StatsCard
            title="Pending Allocations"
            value="47"
            trend={-2}
          />
          <StatsCard
            title="Total Duties This Month"
            value="256"
            trend={12}
          />
        </div>

        {/* Upcoming Exams Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upcoming Examinations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Example row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">2024-03-15</td>
                  <td className="px-6 py-4 whitespace-nowrap">Mathematics</td>
                  <td className="px-6 py-4 whitespace-nowrap">09:00 AM</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Allocated
                    </span>
                  </td>
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