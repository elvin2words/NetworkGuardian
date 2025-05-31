import { Alert } from "@shared/schema";

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "quota_exceeded": return "fas fa-exclamation-triangle";
      case "new_device": return "fas fa-user-plus";
      case "high_usage": return "fas fa-chart-line";
      default: return "fas fa-info-circle";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "quota_exceeded": return "bg-red-50 border-red-200 text-red-600";
      case "new_device": return "bg-orange-50 border-orange-200 text-orange-600";
      case "high_usage": return "bg-yellow-50 border-yellow-200 text-yellow-600";
      default: return "bg-blue-50 border-blue-200 text-blue-600";
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case "quota_exceeded": return "text-red-800";
      case "new_device": return "text-orange-800";
      case "high_usage": return "text-yellow-800";
      default: return "text-blue-800";
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Alerts</h3>
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start space-x-3 p-3 border rounded-lg ${getAlertColor(alert.type)}`}
            >
              <i className={`${getAlertIcon(alert.type)} ${getAlertColor(alert.type).split(' ')[2]} mt-0.5`}></i>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getAlertTextColor(alert.type)}`}>
                  {alert.title}
                </p>
                <p className={`text-xs mt-1 ${getAlertColor(alert.type).split(' ')[2]}`}>
                  {formatRelativeTime(alert.createdAt!)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-bell-slash text-gray-400 text-2xl mb-2"></i>
            <p className="text-gray-500 text-sm">No recent alerts</p>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          View All Alerts <i className="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}
