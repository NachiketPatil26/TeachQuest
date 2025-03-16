import React from "react";
import Logo from "../../assets/TeachQuestLogo.png"
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-4">
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo & Name */}
        <div className="flex items-center space-x-2">
          <img src={Logo} alt="TeachQuest" className="h-8" />
          <h1 className="text-xl font-bold text-gray-800">TeachQuest</h1>
        </div>

        {/* Notification & Sign Out Buttons */}
        <div className="flex items-center space-x-6">
          {/* Notification Button */}
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            🔔
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Sign Out Button */}
          <button className="bg-[#2A4F8F] text-white px-4 py-2 rounded-lg hover:bg-[#1F3A70] transition">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
