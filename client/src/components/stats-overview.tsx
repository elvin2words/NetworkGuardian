import { Device, NetworkStats } from "@shared/schema";

interface StatsOverviewProps {
  networkStats?: NetworkStats;
  devices: Device[];
}

export default function StatsOverview({ networkStats, devices }: StatsOverviewProps) {
  const totalDevices = devices.length;
  const activeConnections = devices.filter(device => device.status === "online").length;
  const totalBandwidth = networkStats?.totalBandwidth || 0;
  const dataToday = networkStats?.dataToday || 0;

  const stats = [
    {
      title: "Total Devices",
      value: totalDevices,
      change: "+2 today",
      icon: "fas fa-laptop",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-green-600"
    },
    {
      title: "Active Connections",
      value: activeConnections,
      change: "Online now",
      icon: "fas fa-wifi",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600"
    },
    {
      title: "Total Bandwidth",
      value: `${totalBandwidth.toFixed(1)}`,
      subtitle: "Mbps",
      change: "Peak usage",
      icon: "fas fa-tachometer-alt",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-yellow-600"
    },
    {
      title: "Data Today",
      value: `${dataToday.toFixed(1)}`,
      subtitle: "GB",
      change: "Within limits",
      icon: "fas fa-database",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      changeColor: "text-blue-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              )}
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <i className={`${stat.icon} ${stat.iconColor} text-xl`}></i>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className={`${stat.changeColor} text-sm font-medium`}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
