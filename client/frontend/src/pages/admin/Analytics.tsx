import React from "react";
import Navbar from "../../components/LandingPageComponents/Navbar"; // Import Navbar Component
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { PieChart } from "@mui/x-charts/PieChart";

// Data for Line Chart (Monthly Allocation Trend)
const lineData = [
  { month: "Jan", allocated: 50, vacant: 20, pending: 10 },
  { month: "Feb", allocated: 60, vacant: 18, pending: 12 },
  { month: "Mar", allocated: 70, vacant: 15, pending: 8 },
  { month: "Apr", allocated: 80, vacant: 12, pending: 6 },
  { month: "May", allocated: 90, vacant: 10, pending: 5 },
  { month: "Jun", allocated: 100, vacant: 8, pending: 3 },
];

// Data for Bar Chart (Branch-wise Allocation)
const branchData = [
  { branch: "IT", allocated: 30, vacant: 10, pending: 5 },
  { branch: "Computer Science", allocated: 35, vacant: 8, pending: 7 },
  { branch: "AI & DS", allocated: 25, vacant: 12, pending: 6 },
  { branch: "EXTC", allocated: 20, vacant: 15, pending: 4 },
];

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>

        {/* Stats and Pie Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Total Teachers */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold text-gray-700">Total Teachers</h2>
              <p className="text-2xl font-bold text-gray-900">120</p>
            </div>

            {/* Teachers Allocated */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold text-gray-700">Teachers Allocated</h2>
              <p className="text-2xl font-bold text-green-600">80</p>
            </div>

            {/* Vacant Teachers */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold text-gray-700">Vacant Teachers</h2>
              <p className="text-2xl font-bold text-red-500">30</p>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold text-gray-700">Pending Approvals</h2>
              <p className="text-2xl font-bold text-yellow-500">10</p>
            </div>
          </div>

          {/* Pie Chart Section */}
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Teacher Allocation Overview</h2>
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: 40 },
                    { id: 1, value: 30 },
                    { id: 2, value: 20 },
                  ],
                },
              ]}
              width={300}
              height={300}
            />
            {/* Legend */}
            <div className="mt-4 flex space-x-4">
              <div className="flex items-center">
                <span className="w-4 h-4 bg-teal-400 inline-block mr-2"></span>
                Teachers Allocated
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-blue-400 inline-block mr-2"></span>
                Vacant Teachers
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-[#B800D8] inline-block mr-2"></span>
                Pending Approvals
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Teacher Allocation Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="allocated" stroke="#34D399" strokeWidth={2} />
              <Line type="monotone" dataKey="vacant" stroke="#F87171" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#FBBF24" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Branch-Wise Teacher Allocation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="allocated" fill="#34D399" barSize={40} name="Allocated" />
              <Bar dataKey="vacant" fill="#F87171" barSize={40} name="Vacant" />
              <Bar dataKey="pending" fill="#FBBF24" barSize={40} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
