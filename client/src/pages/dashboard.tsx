import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/lib/websocket";
import Sidebar from "@/components/sidebar";
import StatsOverview from "@/components/stats-overview";
import DeviceList from "@/components/device-list";
import QuickActions from "@/components/quick-actions";
import AlertsPanel from "@/components/alerts-panel";
import QuotaStatus from "@/components/quota-status";
import DeviceModal from "@/components/device-modal";
import { Device } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: devices = [], refetch: refetchDevices } = useQuery({
    queryKey: ["/api/devices"],
  });

  const { data: networkStats } = useQuery({
    queryKey: ["/api/network-stats"],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });

  // WebSocket connection for real-time updates
  useWebSocket((message) => {
    switch (message.type) {
      case 'device_updated':
      case 'device_added':
      case 'device_removed':
      case 'devices_updated':
        refetchDevices();
        break;
      case 'device_paused':
        toast({
          title: "Device Paused",
          description: `${message.device?.name} internet access has been paused.`,
        });
        refetchDevices();
        break;
      case 'device_resumed':
        toast({
          title: "Device Resumed",
          description: `${message.device?.name} internet access has been resumed.`,
        });
        refetchDevices();
        break;
      case 'device_blocked':
        toast({
          title: "Device Blocked",
          description: `${message.device?.name} has been blocked.`,
          variant: "destructive",
        });
        refetchDevices();
        break;
      case 'all_devices_paused':
        toast({
          title: "All Devices Paused",
          description: "Internet access has been paused for all devices.",
          variant: "destructive",
        });
        refetchDevices();
        break;
      case 'quotas_reset':
        toast({
          title: "Quotas Reset",
          description: "All device quotas have been reset successfully.",
        });
        refetchDevices();
        break;
      case 'device_scan_started':
        toast({
          title: "Scanning for Devices",
          description: "Network scan initiated. New devices will appear shortly.",
        });
        break;
    }
  });

  const openDeviceModal = (device?: Device) => {
    setSelectedDevice(device || null);
    setIsModalOpen(true);
  };

  const closeDeviceModal = () => {
    setSelectedDevice(null);
    setIsModalOpen(false);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ease-in-out`}>
        <Sidebar alerts={alerts} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-bars text-gray-600"></i>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Network Dashboard</h2>
                <p className="text-gray-600 mt-1 text-sm hidden sm:block">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => refetchDevices()}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <i className="fas fa-sync-alt text-sm"></i>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-gray-600 text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
          <StatsOverview networkStats={networkStats} devices={devices} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-2">
              <DeviceList 
                devices={devices} 
                onDeviceSelect={openDeviceModal}
                onAddDevice={() => openDeviceModal()}
              />
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <QuickActions />
              <AlertsPanel alerts={alerts.slice(0, 3)} />
              <QuotaStatus devices={devices} />
            </div>
          </div>
        </main>
      </div>

      <DeviceModal
        device={selectedDevice}
        isOpen={isModalOpen}
        onClose={closeDeviceModal}
        onSave={() => {
          refetchDevices();
          closeDeviceModal();
        }}
      />
    </div>
  );
}
