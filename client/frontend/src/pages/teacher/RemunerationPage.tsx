
import { DollarSign } from "lucide-react";
import TeachQuestLogo from "../../assets/TeachQuestLogo.png";
import { useEffect, useState } from "react";

export default function RemunerationPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Remuneration</h1>
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

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        
        {/* Section Title with Icon */}
        <div className="flex items-center mb-6">
          <DollarSign className="w-8 h-8 text-[#9FC0AE] mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Your Payment & Compensation</h2>
        </div>

        <p className="text-gray-700 mb-6">
          Here you can view details about your remuneration, including exam invigilation duties and payment status.
        </p>

        {/* White Section for the Table */}
        <div
          className={`bg-white rounded-lg shadow-md p-6 transition-all duration-500 ${
            showTable ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Remuneration Details</h3>

          {/* Stylish Table for Remuneration */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-[#B8D8C4] text-gray-900 text-left"> {/* Pastel green header */}
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Exam Duty</th>
                  <th className="py-3 px-6 font-semibold">Hours</th>
                  <th className="py-3 px-6 font-semibold">Payment</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "2024-03-15", duty: "Mathematics", hours: 3, payment: "₹1500", status: "Paid" },
                  { date: "2024-03-18", duty: "Physics", hours: 2, payment: "₹1000", status: "Pending" },
                  { date: "2024-03-20", duty: "Computer Science", hours: 4, payment: "₹2000", status: "Paid" }
                ].map((remuneration, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-[#D6E8DB] transition-all duration-200 ease-in-out"
                  >
                    <td className="py-4 px-6">{remuneration.date}</td>
                    <td className="py-4 px-6">{remuneration.duty}</td>
                    <td className="py-4 px-6">{remuneration.hours} hrs</td>
                    <td className="py-4 px-6">{remuneration.payment}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          remuneration.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {remuneration.status}
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

export default RemunerationPage;
