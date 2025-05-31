import { Device } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeviceListProps {
  devices: Device[];
  onDeviceSelect: (device: Device) => void;
  onAddDevice: () => void;
}

export default function DeviceList({ devices, onDeviceSelect, onAddDevice }: DeviceListProps) {
  const { toast } = useToast();

  const pauseDeviceMutation = useMutation({
    mutationFn: (deviceId: number) => apiRequest("POST", `/api/devices/${deviceId}/pause`),
    onSuccess: () => {
      toast({
        title: "Device Paused",
        description: "Device internet access has been paused.",
      });
    },
  });

  const resumeDeviceMutation = useMutation({
    mutationFn: (deviceId: number) => apiRequest("POST", `/api/devices/${deviceId}/resume`),
    onSuccess: () => {
      toast({
        title: "Device Resumed",
        description: "Device internet access has been resumed.",
      });
    },
  });

  const blockDeviceMutation = useMutation({
    mutationFn: (deviceId: number) => apiRequest("POST", `/api/devices/${deviceId}/block`),
    onSuccess: () => {
      toast({
        title: "Device Blocked",
        description: "Device has been blocked.",
        variant: "destructive",
      });
    },
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "laptop": return "fas fa-laptop";
      case "mobile": return "fas fa-mobile-alt";
      case "tv": return "fas fa-tv";
      case "tablet": return "fas fa-tablet-alt";
      case "gaming": return "fas fa-gamepad";
      default: return "fas fa-question";
    }
  };

  const getDeviceIconColor = (deviceType: string) => {
    switch (deviceType) {
      case "laptop": return "text-blue-600 bg-blue-100";
      case "mobile": return "text-green-600 bg-green-100";
      case "tv": return "text-purple-600 bg-purple-100";
      case "tablet": return "text-orange-600 bg-orange-100";
      case "gaming": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-300";
    }
  };

  const getStatusIndicator = (device: Device) => {
    if (device.status === "blocked" || device.isBlocked) {
      return <div className="w-3 h-3 bg-red-500 rounded-full" title="Blocked"></div>;
    }
    if (device.status === "online") {
      return <div className="w-3 h-3 bg-green-500 rounded-full" title="Online"></div>;
    }
    if (device.status === "unknown") {
      return <div className="w-3 h-3 bg-orange-500 rounded-full" title="Unknown"></div>;
    }
    return <div className="w-3 h-3 bg-gray-400 rounded-full" title="Offline"></div>;
  };

  const getQuotaPercentage = (device: Device) => {
    if (!device.quotaLimit || device.quotaLimit === 0) return null;
    return Math.min(100, (device.totalDataUsed! / device.quotaLimit) * 100);
  };

  const getQuotaColor = (percentage: number | null) => {
    if (percentage === null) return "text-gray-600 bg-gray-100";
    if (percentage >= 100) return "text-red-600 bg-red-100";
    if (percentage >= 90) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Connected Devices</h3>
          <div className="flex items-center space-x-2">
            <button className="px-2 sm:px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <i className="fas fa-filter mr-1"></i>
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button 
              onClick={onAddDevice}
              className="px-2 sm:px-3 py-1 text-sm bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors"
            >
              <i className="fas fa-plus mr-1"></i>
              <span className="hidden sm:inline">Add Device</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {devices.map((device) => {
            const quotaPercentage = getQuotaPercentage(device);
            
            return (
              <div 
                key={device.id} 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors space-y-3 sm:space-y-0"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center ${getDeviceIconColor(device.deviceType)}`}>
                    <i className={`${getDeviceIcon(device.deviceType)} text-base sm:text-lg`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{device.name}</h4>
                    <p className="text-sm text-gray-600">{device.ip}</p>
                    <p className="text-xs text-gray-500 truncate sm:hidden">{device.mac}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="text-left sm:text-right">
                      {device.status === "blocked" ? (
                        <p className="text-sm font-medium text-red-600">BLOCKED</p>
                      ) : (
                        <p className="text-sm font-medium text-slate-900">
                          {device.currentUsage?.toFixed(1)} Mbps
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {device.status === "blocked" ? "Quota exceeded" : "Data usage"}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIndicator(device)}
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${getQuotaColor(quotaPercentage)}`}>
                        <p className="text-xs font-bold">
                          {quotaPercentage ? `${Math.round(quotaPercentage)}%` : "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 sm:space-x-2">
                    {device.status === "blocked" || device.isBlocked ? (
                      <button 
                        onClick={() => resumeDeviceMutation.mutate(device.id)}
                        disabled={resumeDeviceMutation.isPending}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors"
                        title="Resume Internet"
                      >
                        <i className="fas fa-play text-green-600 text-xs sm:text-sm"></i>
                      </button>
                    ) : device.status === "unknown" ? (
                      <button 
                        onClick={() => blockDeviceMutation.mutate(device.id)}
                        disabled={blockDeviceMutation.isPending}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors"
                        title="Block Device"
                      >
                        <i className="fas fa-ban text-red-600 text-xs sm:text-sm"></i>
                      </button>
                    ) : (
                      <button 
                        onClick={() => pauseDeviceMutation.mutate(device.id)}
                        disabled={pauseDeviceMutation.isPending}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                        title="Pause Internet"
                      >
                        <i className="fas fa-pause text-gray-600 text-xs sm:text-sm"></i>
                      </button>
                    )}
                    <button 
                      onClick={() => onDeviceSelect(device)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                      title="Manage Device"
                    >
                      <i className="fas fa-cog text-gray-600 text-xs sm:text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            View All Devices ({devices.length}) <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
