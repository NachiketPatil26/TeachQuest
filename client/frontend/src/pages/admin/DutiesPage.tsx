import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, Download, ClipboardList, CheckCircle, XCircle } from 'lucide-react';

interface DutyRecord {
  id: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
  status: 'completed' | 'missed' | 'upcoming';
  remarks?: string;
}

export default function DutiesPage() {
  const { branch } = useParams<{ branch: string }>();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  const duties: DutyRecord[] = [
    {
      id: '1',
      teacherName: 'Dr. John Smith',
      subject: 'Data Structures',
      date: '2024-03-15',
      time: '09:00 AM',
      venue: 'Block A - Room 101',
      status: 'completed',
      remarks: 'Conducted smoothly'
    },
    {
      id: '2',
      teacherName: 'Prof. Sarah Johnson',
      subject: 'Computer Networks',
      date: '2024-03-16',
      time: '02:00 PM',
      venue: 'Block B - Room 201',
      status: 'upcoming'
    },
  ];

  const getStatusColor = (status: DutyRecord['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DutyRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Duty Records</h1>
              <p className="mt-1 text-sm text-gray-500">{branch} Department</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9FC0AE] hover:bg-[#8BAF9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]"
              >
                <ClipboardList className="-ml-1 mr-2 h-5 w-5" />
                Generate Report
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
                    placeholder="Search duties..."
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
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 p-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Completed Duties</h3>
              <p className="mt-2 text-3xl font-bold text-green-900">45</p>
              <p className="mt-1 text-sm text-green-700">Last 30 days</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800">Missed Duties</h3>
              <p className="mt-2 text-3xl font-bold text-red-900">3</p>
              <p className="mt-1 text-sm text-red-700">Last 30 days</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Upcoming Duties</h3>
              <p className="mt-2 text-3xl font-bold text-blue-900">12</p>
              <p className="mt-1 text-sm text-blue-700">Next 7 days</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {duties.map((duty) => (
                  <tr key={duty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{duty.teacherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duty.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duty.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duty.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duty.venue}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(duty.status)}
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(duty.status)}`}>
                          {duty.status.charAt(0).toUpperCase() + duty.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duty.remarks || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-[#9FC0AE] hover:text-[#8BAF9A]">View Details</button>
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