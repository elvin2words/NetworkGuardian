import { devices, alerts, networkStats, type Device, type InsertDevice, type Alert, type InsertAlert, type NetworkStats, type InsertNetworkStats } from "@shared/schema";

export interface IStorage {
  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByMac(mac: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, updates: Partial<Device>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;

  // Alert operations
  getAlerts(): Promise<Alert[]>;
  getUnreadAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<boolean>;

  // Network stats operations
  getLatestNetworkStats(): Promise<NetworkStats | undefined>;
  createNetworkStats(stats: InsertNetworkStats): Promise<NetworkStats>;
}

export class MemStorage implements IStorage {
  private devices: Map<number, Device>;
  private alerts: Map<number, Alert>;
  private networkStats: Map<number, NetworkStats>;
  private currentDeviceId: number;
  private currentAlertId: number;
  private currentStatsId: number;

  constructor() {
    this.devices = new Map();
    this.alerts = new Map();
    this.networkStats = new Map();
    this.currentDeviceId = 1;
    this.currentAlertId = 1;
    this.currentStatsId = 1;

    // Initialize with sample devices
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample devices
    const sampleDevices: InsertDevice[] = [
      {
        name: "MacBook Pro",
        ip: "192.168.1.105",
        mac: "AA:BB:CC:DD:EE:FF",
        deviceType: "laptop",
        status: "online",
        currentUsage: 45.2,
        totalDataUsed: 3892.5,
        quotaLimit: 5000,
        quotaPeriod: "daily",
        quotaAction: "block"
      },
      {
        name: "iPhone 14",
        ip: "192.168.1.142",
        mac: "11:22:33:44:55:66",
        deviceType: "mobile",
        status: "online",
        currentUsage: 12.8,
        totalDataUsed: 4600,
        quotaLimit: 5000,
        quotaPeriod: "daily",
        quotaAction: "block"
      },
      {
        name: "Smart TV",
        ip: "192.168.1.201",
        mac: "AA:11:BB:22:CC:33",
        deviceType: "tv",
        status: "blocked",
        currentUsage: 0,
        totalDataUsed: 8000,
        quotaLimit: 8000,
        quotaPeriod: "daily",
        quotaAction: "block",
        isBlocked: true
      },
      {
        name: "Unknown Device",
        ip: "192.168.1.237",
        mac: "FF:EE:DD:CC:BB:AA",
        deviceType: "unknown",
        status: "unknown",
        currentUsage: 2.1,
        totalDataUsed: 156.3,
        quotaLimit: null,
        quotaPeriod: "daily",
        quotaAction: "notify"
      }
    ];

    for (const device of sampleDevices) {
      await this.createDevice(device);
    }

    // Sample alerts
    const sampleAlerts: InsertAlert[] = [
      {
        type: "quota_exceeded",
        title: "Smart TV quota exceeded",
        message: "Smart TV has exceeded its daily data quota of 8GB",
        deviceId: 3
      },
      {
        type: "new_device",
        title: "New device detected",
        message: "Unknown device detected on network: 192.168.1.237",
        deviceId: 4
      },
      {
        type: "high_usage",
        title: "High bandwidth usage",
        message: "Network bandwidth usage is at 87% capacity",
        deviceId: null
      }
    ];

    for (const alert of sampleAlerts) {
      await this.createAlert(alert);
    }

    // Sample network stats
    await this.createNetworkStats({
      totalDevices: 24,
      activeConnections: 18,
      totalBandwidth: 245.8,
      dataToday: 12.4
    });
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByMac(mac: string): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(device => device.mac === mac);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const device: Device = {
      ...insertDevice,
      id,
      lastSeen: new Date(),
      totalDataUsed: insertDevice.totalDataUsed || 0,
      currentUsage: insertDevice.currentUsage || 0,
      isBlocked: insertDevice.isBlocked || false,
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;

    const updatedDevice = { ...device, ...updates };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<boolean> {
    return this.devices.delete(id);
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.isRead)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    alert.isRead = true;
    this.alerts.set(id, alert);
    return true;
  }

  async getLatestNetworkStats(): Promise<NetworkStats | undefined> {
    const stats = Array.from(this.networkStats.values());
    return stats.length > 0 ? stats[stats.length - 1] : undefined;
  }

  async createNetworkStats(insertStats: InsertNetworkStats): Promise<NetworkStats> {
    const id = this.currentStatsId++;
    const stats: NetworkStats = {
      ...insertStats,
      id,
      timestamp: new Date(),
    };
    this.networkStats.set(id, stats);
    return stats;
  }
}

export const storage = new MemStorage();
