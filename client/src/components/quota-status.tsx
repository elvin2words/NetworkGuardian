import { Device } from "@shared/schema";

interface QuotaStatusProps {
  devices: Device[];
}

export default function QuotaStatus({ devices }: QuotaStatusProps) {
  const devicesWithQuotas = devices.filter(device => device.quotaLimit && device.quotaLimit > 0);
  
  const totalDataUsed = devices.reduce((sum, device) => sum + (device.totalDataUsed || 0), 0);
  const totalQuotaLimit = 50000; // 50GB daily limit example

  const getQuotaPercentage = (used: number, limit: number) => {
    return Math.min(100, (used / limit) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 90) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Quota Status</h3>
      <div className="space-y-4">
        {/* Daily Total */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-900">Daily Total</span>
            <span className="text-sm text-gray-600">
              {(totalDataUsed / 1000).toFixed(1)} / {(totalQuotaLimit / 1000).toFixed(0)} GB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(getQuotaPercentage(totalDataUsed, totalQuotaLimit))}`}
              style={{ width: `${getQuotaPercentage(totalDataUsed, totalQuotaLimit)}%` }}
            ></div>
          </div>
        </div>

        {/* Individual devices with quotas */}
        {devicesWithQuotas.slice(0, 3).map((device) => {
          const percentage = getQuotaPercentage(device.totalDataUsed!, device.quotaLimit!);
          
          return (
            <div key={device.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">{device.name}</span>
                <span className={`text-sm ${percentage >= 100 ? 'text-red-600' : 'text-gray-600'}`}>
                  {(device.totalDataUsed! / 1000).toFixed(1)} / {(device.quotaLimit! / 1000).toFixed(0)} GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        {devicesWithQuotas.length === 0 && (
          <div className="text-center py-4">
            <i className="fas fa-database text-gray-400 text-2xl mb-2"></i>
            <p className="text-gray-500 text-sm">No quota limits set</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          Manage Quotas <i className="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}
