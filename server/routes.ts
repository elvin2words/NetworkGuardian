import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertDeviceSchema, insertAlertSchema } from "@shared/schema";
import { networkEngine } from "./network-engine";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    // Send initial data
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Device routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.getDevice(id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      broadcast({ type: 'device_added', device });
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const device = await storage.updateDevice(id, updates);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      broadcast({ type: 'device_updated', device });
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDevice(id);
      if (!success) {
        return res.status(404).json({ message: "Device not found" });
      }
      broadcast({ type: 'device_removed', deviceId: id });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Device control routes
  app.post("/api/devices/:id/pause", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.updateDevice(id, { status: "blocked", isBlocked: true });
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      broadcast({ type: 'device_paused', device });
      res.json({ message: "Device paused successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to pause device" });
    }
  });

  app.post("/api/devices/:id/resume", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.updateDevice(id, { status: "online", isBlocked: false });
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      broadcast({ type: 'device_resumed', device });
      res.json({ message: "Device resumed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to resume device" });
    }
  });

  app.post("/api/devices/:id/block", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.updateDevice(id, { status: "blocked", isBlocked: true });
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      broadcast({ type: 'device_blocked', device });
      res.json({ message: "Device blocked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to block device" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/unread", async (req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread alerts" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markAlertAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json({ message: "Alert marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // Network stats routes
  app.get("/api/network-stats", async (req, res) => {
    try {
      const stats = await storage.getLatestNetworkStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network stats" });
    }
  });

  // Quick actions
  app.post("/api/actions/pause-all", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      for (const device of devices) {
        if (device.status === "online") {
          await storage.updateDevice(device.id, { status: "blocked", isBlocked: true });
        }
      }
      broadcast({ type: 'all_devices_paused' });
      res.json({ message: "All devices paused successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to pause all devices" });
    }
  });

  app.post("/api/actions/scan-devices", async (req, res) => {
    try {
      // Simulate device scanning
      broadcast({ type: 'device_scan_started' });
      res.json({ message: "Device scan initiated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start device scan" });
    }
  });

  app.post("/api/actions/reset-quotas", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      for (const device of devices) {
        await storage.updateDevice(device.id, { totalDataUsed: 0, isBlocked: false });
      }
      broadcast({ type: 'quotas_reset' });
      res.json({ message: "All quotas reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset quotas" });
    }
  });

  // Network Control & Security Routes

  // Device discovery (Fing-style network scanning)
  app.post("/api/network/discover", async (req, res) => {
    try {
      const discoveredDevices = await networkEngine.discoverDevices();
      
      // Update storage with discovered devices
      for (const device of discoveredDevices) {
        const existing = await storage.getDeviceByMac(device.mac);
        if (!existing) {
          await storage.createDevice({
            name: device.hostname || `Device-${device.ip}`,
            ip: device.ip,
            mac: device.mac,
            deviceType: device.vendor || "Unknown",
            vendor: device.vendor,
            hostname: device.hostname,
            openPorts: JSON.stringify(device.openPorts),
            status: device.isOnline ? "online" : "offline"
          });
        } else {
          await storage.updateDevice(existing.id, {
            status: device.isOnline ? "online" : "offline",
            lastSeen: new Date(),
            vendor: device.vendor,
            hostname: device.hostname,
            openPorts: JSON.stringify(device.openPorts)
          });
        }
      }
      
      res.json({ 
        devices: discoveredDevices,
        count: discoveredDevices.length 
      });
      
      broadcast({ type: "devices_discovered", count: discoveredDevices.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Block device (NetCut functionality)
  app.post("/api/network/block/:deviceId", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const device = await storage.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      const success = await networkEngine.blockDevice(device.ip, device.mac);
      
      if (success) {
        await storage.updateDevice(deviceId, { 
          isBlocked: true,
          status: "blocked" 
        });
        
        await storage.createAlert({
          type: "device_blocked",
          title: "Device Blocked",
          message: `${device.name} (${device.ip}) has been blocked from network access`,
          deviceId: deviceId
        });
        
        broadcast({ type: "device_blocked", deviceId });
      }
      
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unblock device
  app.post("/api/network/unblock/:deviceId", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const device = await storage.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      const success = await networkEngine.unblockDevice(device.ip);
      
      if (success) {
        await storage.updateDevice(deviceId, { 
          isBlocked: false,
          status: "online" 
        });
        
        await storage.createAlert({
          type: "device_unblocked",
          title: "Device Unblocked",
          message: `${device.name} (${device.ip}) has been restored to network access`,
          deviceId: deviceId
        });
        
        broadcast({ type: "device_unblocked", deviceId });
      }
      
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Port scan device
  app.post("/api/network/scan/:deviceId", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const device = await storage.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      const openPorts = await networkEngine.scanPorts(device.ip);
      const vulnerabilities = await networkEngine.scanVulnerabilities(device.ip);
      
      await storage.updateDevice(deviceId, {
        openPorts: JSON.stringify(openPorts),
        vulnerabilities: JSON.stringify(vulnerabilities)
      });
      
      res.json({ 
        openPorts,
        vulnerabilities,
        deviceId 
      });
      
      if (vulnerabilities.length > 0) {
        await storage.createAlert({
          type: "security_vulnerability",
          title: "Security Vulnerabilities Found",
          message: `${device.name} has ${vulnerabilities.length} potential security issues`,
          deviceId: deviceId
        });
      }
      
      broadcast({ type: "device_scanned", deviceId, vulnerabilities: vulnerabilities.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bandwidth limiting
  app.post("/api/network/limit-bandwidth/:deviceId", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const { downloadLimit, uploadLimit } = req.body;
      const device = await storage.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      const success = await networkEngine.limitBandwidth(device.ip, downloadLimit, uploadLimit);
      
      if (success) {
        await storage.updateDevice(deviceId, {
          bandwidthLimit: downloadLimit
        });
        
        broadcast({ type: "bandwidth_limited", deviceId, downloadLimit, uploadLimit });
      }
      
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Traffic analysis
  app.get("/api/network/traffic/:deviceId", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const device = await storage.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      const trafficData = await networkEngine.analyzeTraffic(device.ip);
      
      res.json(trafficData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Firewall management
  app.post("/api/firewall/rules", async (req, res) => {
    try {
      const { name, sourceIp, destinationIp, port, protocol, action, deviceId } = req.body;
      
      const rule = {
        name,
        sourceIp,
        destinationIp,
        port,
        protocol,
        action
      };
      
      const success = await networkEngine.createFirewallRule(rule);
      
      res.json({ success, rule });
      
      if (success) {
        broadcast({ type: "firewall_rule_created", rule });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Parental controls - block domain
  app.post("/api/parental/block-domain", async (req, res) => {
    try {
      const { domain, deviceId } = req.body;
      
      const success = await networkEngine.blockDomain(domain);
      
      if (success && deviceId) {
        const device = await storage.getDevice(deviceId);
        if (device) {
          const blockedDomains = device.blockedDomains ? 
            JSON.parse(device.blockedDomains) : [];
          blockedDomains.push(domain);
          
          await storage.updateDevice(deviceId, {
            blockedDomains: JSON.stringify(blockedDomains)
          });
        }
      }
      
      res.json({ success });
      
      if (success) {
        broadcast({ type: "domain_blocked", domain, deviceId });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Router connection status
  app.get("/api/router/status", async (req, res) => {
    try {
      const connected = await networkEngine.connectToHuaweiRouter();
      res.json({ connected, brand: "huawei" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Network performance monitoring
  app.get("/api/network/performance", async (req, res) => {
    try {
      const performance = await networkEngine.getNetworkPerformance();
      res.json(performance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Simulate real-time data updates
  setInterval(async () => {
    try {
      const devices = await storage.getDevices();
      const updatedDevices = devices.map(device => ({
        ...device,
        currentUsage: device.status === "online" ? Math.random() * 50 : 0,
        totalDataUsed: device.status === "online" ? device.totalDataUsed! + Math.random() * 10 : device.totalDataUsed!
      }));

      for (const device of updatedDevices) {
        await storage.updateDevice(device.id, device);
      }

      broadcast({ type: 'devices_updated', devices: updatedDevices });
    } catch (error) {
      console.error('Error updating device data:', error);
    }
  }, 10000); // Update every 10 seconds

  return httpServer;
}
