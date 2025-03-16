import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const TeacherAllocationPie = () => {
  return (
    <div className="flex justify-between items-center w-full px-6">
      
      {/* Left Side: Greetings Text */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Greetings, Admin
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-gray-600">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Right Side: Pie Chart + Legend Side by Side */}
      <div className="flex items-center ">
        {/* Pie Chart */}
        <PieChart
          series={[
            {
              data: [
                { id: 0, value: 40,},
                { id: 1, value: 30 },
                { id: 2, value: 20 },
              ],
            },
          ]}
          width={300}
          height={300}
        />

        {/* Legend (Aligned Next to Pie Chart) */}
        <div className="flex flex-col ">
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
  );
};

export default TeacherAllocationPie;
