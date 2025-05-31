import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();

  const pauseAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/actions/pause-all"),
    onSuccess: () => {
      toast({
        title: "All Devices Paused",
        description: "Internet access has been paused for all devices.",
        variant: "destructive",
      });
    },
  });

  const scanDevicesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/actions/scan-devices"),
    onSuccess: () => {
      toast({
        title: "Scanning for Devices",
        description: "Network scan initiated. New devices will appear shortly.",
      });
    },
  });

  const resetQuotasMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/actions/reset-quotas"),
    onSuccess: () => {
      toast({
        title: "Quotas Reset",
        description: "All device quotas have been reset successfully.",
      });
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button 
          onClick={() => pauseAllMutation.mutate()}
          disabled={pauseAllMutation.isPending}
          className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <i className="fas fa-pause-circle text-red-600"></i>
            <span className="font-medium text-red-700">Pause All Internet</span>
          </div>
          <i className="fas fa-chevron-right text-red-600 text-sm"></i>
        </button>
        
        <button 
          onClick={() => scanDevicesMutation.mutate()}
          disabled={scanDevicesMutation.isPending}
          className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <i className="fas fa-search text-blue-600"></i>
            <span className="font-medium text-blue-700">Scan for New Devices</span>
          </div>
          <i className="fas fa-chevron-right text-blue-600 text-sm"></i>
        </button>
        
        <button 
          onClick={() => resetQuotasMutation.mutate()}
          disabled={resetQuotasMutation.isPending}
          className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <i className="fas fa-redo text-green-600"></i>
            <span className="font-medium text-green-700">Reset All Quotas</span>
          </div>
          <i className="fas fa-chevron-right text-green-600 text-sm"></i>
        </button>
      </div>
    </div>
  );
}
