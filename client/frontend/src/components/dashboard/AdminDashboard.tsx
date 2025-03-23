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
import LogoAdminDashboard from '../../assets/TeachQuestLogo.png';
import AdminDashboardImage from '../../assets/Online test-bro.png';
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
interface StatsCardProps {
  title: string;
  value: number | string;
  trend: number;
  className?: string;
}
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

import {  useRef } from "react";
// import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [branches, setBranches] = useState<string[]>([
    "Computer Science",
    "Artificial Intelligence & Data Science",
    "Information Technology",
  ]);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState("");

  const [selectedBranch, setSelectedBranch] = useState<string>("Computer Science");

  // **Fix for input focus issue**
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Keep focus on the input field
    }
  }, [newBranch]); // Runs every time `newBranch` updates

  const handleAddBranch = () => {
    if (newBranch.trim() && !branches.includes(newBranch.trim())) {
      setBranches([...branches, newBranch.trim()]);
      setNewBranch("");
      setShowAddBranch(false);
    }
  };

  // Branch Selector with Add Branch button
  const BranchSelector = () => (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Branch Management</h3>
        <button
          onClick={() => setShowAddBranch(!showAddBranch)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
        >
          + Add New Branch
        </button>
      </div>
      
      {showAddBranch && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef} // Attach ref to the input field
              type="text"
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              placeholder="Enter branch name"
              className="flex-1 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE] rounded-md shadow-sm"
            />
            <button
              onClick={handleAddBranch}
              className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-[#9FC0AE] focus:ring-offset-2 shadow-sm"
            >
              Add Branch
            </button>
          </div>
        </div>
      )}
      
      <div className="relative">
        <select
          id="branch"
          name="branch"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#9FC0AE] focus:border-[#9FC0AE] rounded-md shadow-sm appearance-none"  // **Fix applied here**
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branches.map((branch) => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
);


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
      bgColor: 'bg-gradient-to-br from-[#D4ECDD] to-[#C2DFC5] text-black hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Teacher Info',
      description: 'Manage teacher information',
      icon: <Users size={24} />,
      onClick: () => navigate(`/admin/allocation/${selectedBranch}`),
      bgColor: 'bg-white text-black border border-gray-300 hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View workload and subject analytics',
      icon: <BarChart2 size={24} />,
      onClick: () => navigate(`/admin/analytics/${selectedBranch}`),
      bgColor: 'bg-gradient-to-br from-[#D4ECDD] to-[#C2DFC5] text-black hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Upload Excel Data',
      description: 'Import timetables and teacher data',
      icon: <Upload size={24} />,
      onClick: () => document.getElementById('excelUpload')?.click(),
      bgColor: 'bg-white text-black border border-gray-300 hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Duty Reports',
      description: 'View and track teacher duties',
      icon: <ClipboardList size={24} />,
      onClick: () => navigate(`/admin/duties/${selectedBranch}`),
      bgColor: 'bg-gradient-to-br from-[#D4ECDD] to-[#C2DFC5] text-black hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
    {
      title: 'Remuneration',
      description: 'Manage payment and compensation',
      icon: <DollarSign size={24} />,
      onClick: () => navigate(`/admin/remuneration/${selectedBranch}`),
      bgColor: 'bg-white text-black border border-gray-300 hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out'
    },
  
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
          <div className="flex items-center space-x-2"> {/* Added flex and spacing */}
          <img src={LogoAdminDashboard} className="h-8 w-8" alt="LogoAdminDashboard" />
          <h1 className="text-xl font-bold text-gray-800">TeachQuest</h1>
       </div>
      <div className="hidden md:block">
        <div className="ml-10 flex items-baseline space-x-4">
          {/* <button onClick={() => navigate('/admin/dashboard')} className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</button> */}
          {/* <button onClick={() => navigate('/admin/settings')} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Settings</button> */}
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
          <div className="mb-8 flex items-center">
            <img src={AdminDashboardImage} className="w-60 h-60" alt="Hero Section Image" />
              <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Greetings, Admin</h1>
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
        {/* Branch Selector */}
        <BranchSelector />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Active Teachers"
            value="124"
            trend={5}
            className="transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          />
          <StatsCard
            title="Pending Allocations"
            value="47"
            trend={-2}
            className="transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          />
          <StatsCard
            title="Total Duties This Month"
            value="256"
            trend={12}
            className="transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          />
        </div>

        {/* Upcoming Exams Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Upcoming Examinations</h2>
              <p className="mt-1 text-sm text-gray-500">View and manage upcoming exam schedule</p>
            </div>
            <button
              onClick={() => navigate(`/admin/timetable/${selectedBranch}`)}
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
                <tr className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">2024-03-15</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Mathematics</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">09:00 AM</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Allocated
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">2024-03-16</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Physics</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">10:00 AM</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                      Pending
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
