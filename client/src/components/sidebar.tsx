import { Alert } from "@shared/schema";

interface SidebarProps {
  alerts: Alert[];
  onClose?: () => void;
}

export default function Sidebar({ alerts, onClose }: SidebarProps) {
  const unreadAlertsCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">NetSentinel</h1>
              <p className="text-sm text-gray-500">Home Network</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times text-gray-600 text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a 
              href="#dashboard" 
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20"
            >
              <i className="fas fa-tachometer-alt w-5"></i>
              <span className="font-medium">Dashboard</span>
            </a>
          </li>
          <li>
            <a 
              href="#devices" 
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-laptop w-5"></i>
              <span>Devices</span>
            </a>
          </li>
          <li>
            <a 
              href="#traffic" 
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-chart-line w-5"></i>
              <span>Traffic Monitor</span>
            </a>
          </li>
          <li>
            <a 
              href="#quotas" 
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-database w-5"></i>
              <span>Data Quotas</span>
            </a>
          </li>
          <li>
            <a 
              href="#alerts" 
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-bell w-5"></i>
              <span>Alerts</span>
              {unreadAlertsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadAlertsCount}
                </span>
              )}
            </a>
          </li>
          <li>
            <a 
              href="#settings" 
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-cog w-5"></i>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Network Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Network Online</span>
          </div>
          <p className="text-xs text-green-600 mt-1">192.168.1.1 • 24 devices</p>
        </div>
      </div>
    </div>
  );
}
