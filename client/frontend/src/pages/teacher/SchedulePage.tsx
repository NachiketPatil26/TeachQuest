// <<<<<<< HEAD

// import { Calendar } from 'lucide-react';

// export default function SchedulePage() {
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center mb-8">
//           <Calendar className="w-8 h-8 text-[#9FC0AE] mr-4" />
//           <h1 className="text-2xl font-bold">Exam Schedule</h1>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {/* Example row - Replace with actual data */}
//                 <tr>
//                   <td className="px-6 py-4 whitespace-nowrap">2024-03-15</td>
//                   <td className="px-6 py-4 whitespace-nowrap">Mathematics</td>
//                   <td className="px-6 py-4 whitespace-nowrap">09:00 AM</td>
//                   <td className="px-6 py-4 whitespace-nowrap">Room 101</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                       Scheduled
//                     </span>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// =======
import { Calendar } from "lucide-react";
import TeachQuestLogo from "../../assets/TeachQuestLogo.png";
import { useEffect, useState } from "react";

export default function SchedulePage() {
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowTable(true), 200); // Smooth animation delay
  }, []);

  return (
    <div className="relative bg-[#F0F7F4] min-h-screen"> {/* Light pastel green background */}
      
      {/* Fixed Navbar with White Background */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center justify-between">
        {/* Left Side: Logo & Heading */}
        <div className="flex items-center gap-3">
          <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
          <h1 className="text-2xl font-bold text-gray-900">Exam Schedule</h1>
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex gap-4">
          <button className="text-gray-800 hover:text-gray-900 font-medium">Dashboard</button>
          <button className="text-gray-800 hover:text-gray-900 font-medium">Timetable</button>
          <button className="text-gray-800 hover:text-gray-900 font-medium">Settings</button>
          <button className="px-4 py-2 bg-[#9FC0AE] text-white rounded-md hover:bg-[#8BAF9A]">
            Logout
          </button>
        </div>
      </div>

      {/* Page Content (Padding to prevent overlap with navbar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Heading with Calendar Icon */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#9FC0AE]" /> {/* Calendar Icon in Pastel Green */}
          Your Exam Schedule
        </h2>

        <p className="text-gray-700 mb-6">
          Here is your upcoming exam schedule. Please ensure you arrive on time and prepare accordingly.
        </p>

        {/* White Section for the Table */}
        <div
          className={`bg-white rounded-lg shadow-md p-6 transition-all duration-500 ${
            showTable ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Exams</h3>

          {/* Stylish Table for Exam Schedule */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-[#B8D8C4] text-gray-900 text-left"> {/* Pastel green header */}
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Subject</th>
                  <th className="py-3 px-6 font-semibold">Time</th>
                  <th className="py-3 px-6 font-semibold">Room</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "2024-03-15", subject: "Mathematics", time: "09:00 AM", room: "Room 101", status: "Scheduled" },
                  { date: "2024-03-18", subject: "Physics", time: "11:00 AM", room: "Room 202", status: "Pending" },
                  { date: "2024-03-20", subject: "Computer Science", time: "01:00 PM", room: "Lab 5", status: "Scheduled" }
                ].map((exam, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-[#D6E8DB] transition-all duration-200 ease-in-out"
                  >
                    <td className="py-4 px-6">{exam.date}</td>
                    <td className="py-4 px-6">{exam.subject}</td>
                    <td className="py-4 px-6">{exam.time}</td>
                    <td className="py-4 px-6">{exam.room}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exam.status === "Scheduled"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> {/* End White Section */}
      </div>
    </div>
  );
}
>>>>>>> 86f3823 (trial of git)
