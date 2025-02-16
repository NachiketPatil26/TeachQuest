



import { Calendar } from "lucide-react"; // Importing the calendar icon
import TeachQuestLogo from '../../assets/TeachQuestLogo.png';

const DutiesPage = () => {
  return (
    <div className="relative bg-[#F0F7F4] min-h-screen"> {/* Light pastel green background */}
      
      {/* Fixed Navbar with White Background */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex items-center justify-between">
        {/* Left Side: Logo & Heading */}
        <div className="flex items-center gap-3">
          <img className="h-10 w-10" src={TeachQuestLogo} alt="TeachQuest Logo" />
          <h1 className="text-2xl font-bold text-gray-900">My Duties</h1>
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
          Your Assigned Exam Duties
        </h2>

        <p className="text-gray-700 mb-6">
          Below is a list of your assigned duties for the upcoming exams. Please review your assignments carefully.
        </p>

        {/* White Section for the Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Duty Schedule</h3>

          {/* Stylish Table for Duties */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-[#B8D8C4] text-gray-900 text-left"> {/* Pastel green header */}
                  <th className="py-3 px-6 font-semibold">Subject</th>
                  <th className="py-3 px-6 font-semibold">Room</th>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { subject: "Mathematics", room: "Room 101", date: "March 10, 2025", time: "10:00 AM - 1:00 PM" },
                  { subject: "Physics", room: "Room 203", date: "March 12, 2025", time: "2:00 PM - 5:00 PM" },
                  { subject: "Computer Science", room: "Lab 5", date: "March 15, 2025", time: "9:00 AM - 12:00 PM" }
                ].map((duty, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-[#D6E8DB] transition-all duration-200 ease-in-out"
                  >
                    <td className="py-4 px-6">{duty.subject}</td>
                    <td className="py-4 px-6">{duty.room}</td>
                    <td className="py-4 px-6">{duty.date}</td>
                    <td className="py-4 px-6">{duty.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> {/* End White Section */}
      </div>

    </div>
  );
};


export default DutiesPage;



