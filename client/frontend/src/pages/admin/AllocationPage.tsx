import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Search, Filter, Download, UserPlus } from 'lucide-react';

interface TeacherAllocation {
  id: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
  status: 'pending' | 'accepted' | 'declined';
}

export default function AllocationPage() {
  const { branch } = useParams<{ branch: string }>();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  const allocations: TeacherAllocation[] = [
    {
      id: '1',
      teacherName: 'Dr. John Smith',
      subject: 'Data Structures',
      date: '2024-03-15',
      time: '09:00 AM',
      venue: 'Block A - Room 101',
      status: 'accepted'
    },
    {
      id: '2',
      teacherName: 'Prof. Sarah Johnson',
      subject: 'Computer Networks',
      date: '2024-03-16',
      time: '02:00 PM',
      venue: 'Block B - Room 201',
      status: 'pending'
    },
  ];

  const getStatusColor = (status: TeacherAllocation['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Allocation</h1>
              <p className="mt-1 text-sm text-gray-500">{branch} Department</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5" />
                Assign Teacher
              </button>
              <button
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
                    placeholder="Search allocations..."
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
                  <Users className="-ml-1 mr-2 h-5 w-5" />
                  View Teachers
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{allocation.teacherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.venue}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(allocation.status)}`}>
                        {allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-[#9FC0AE] hover:text-[#8BAF9A]">Reassign</button>
                      <span className="mx-2">|</span>
                      <button className="text-red-600 hover:text-red-900">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}