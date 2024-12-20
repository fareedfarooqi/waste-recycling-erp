import React from "react";
import { FaUsers, FaBox, FaCalendarAlt, FaQuestion, FaCog } from "react-icons/fa";

const Sidebar = (): JSX.Element => {
  return (
    <div className="w-64 bg-green-700 text-white p-6 flex flex-col space-y-6">
      {/* Logo */}
      <div className="text-2xl font-bold mb-12">LOGO</div>

      {/* Main Menu */}
      <div className="space-y-4">
        <div className="font-bold text-xl">Main Menu</div>
        <div className="space-y-3 text-lg">
          <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
            <FaUsers />
            <div>Customers</div>
          </div>
          <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
            <FaBox />
            <div>Inventory</div>
          </div>
          <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
            <FaCalendarAlt />
            <div>Schedule Pickup</div>
          </div>
          <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
            <FaQuestion />
            <div>Requests</div>
          </div>
          <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
            <FaBox />
            <div>Containers</div>
          </div>
        </div>
      </div>

      {/* Help/Settings */}
      <div className="space-y-3 mt-auto">
        <div className="font-bold text-xl">Help/Settings</div>
        <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
          <FaCog />
          <div className="font-bold">Settings</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
