import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ip: text("ip").notNull(),
  mac: text("mac").notNull().unique(),
  deviceType: text("device_type").notNull(),
  status: text("status").notNull().default("offline"), // online, offline, blocked, unknown
  lastSeen: timestamp("last_seen").defaultNow(),
  totalDataUsed: real("total_data_used").default(0), // in MB
  currentUsage: real("current_usage").default(0), // current Mbps
  quotaLimit: real("quota_limit"), // in MB, null for unlimited
  quotaPeriod: text("quota_period").default("daily"), // daily, weekly, monthly
  quotaAction: text("quota_action").default("block"), // block, throttle, notify
  isBlocked: boolean("is_blocked").default(false),
  vendor: text("vendor"), // Device manufacturer from MAC lookup
  hostname: text("hostname"), // Network hostname
  openPorts: text("open_ports"), // JSON array of open ports
  vulnerabilities: text("vulnerabilities"), // JSON array of security issues
  firewallRules: text("firewall_rules"), // JSON array of custom firewall rules
  priority: integer("priority").default(3), // 1-5, network QoS priority
  bandwidthLimit: real("bandwidth_limit"), // Speed limit in Mbps
  isParentalControlled: boolean("is_parental_controlled").default(false),
  allowedTimeSlots: text("allowed_time_slots"), // JSON array of time restrictions
  blockedDomains: text("blocked_domains"), // JSON array of blocked websites
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // quota_exceeded, new_device, high_usage
  title: text("title").notNull(),
  message: text("message").notNull(),
  deviceId: integer("device_id").references(() => devices.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const networkStats = pgTable("network_stats", {
  id: serial("id").primaryKey(),
  totalDevices: integer("total_devices").notNull(),
  activeConnections: integer("active_connections").notNull(),
  totalBandwidth: real("total_bandwidth").notNull(),
  dataToday: real("data_today").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const routerConfig = pgTable("router_config", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(), // huawei, tp-link, asus, etc.
  model: text("model").notNull(),
  ipAddress: text("ip_address").notNull(),
  username: text("username"),
  password: text("password"),
  apiEndpoint: text("api_endpoint"),
  isConnected: boolean("is_connected").default(false),
  lastSync: timestamp("last_sync"),
  capabilities: text("capabilities"), // JSON array of supported features
});

export const firewallRules = pgTable("firewall_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceIp: text("source_ip"),
  destinationIp: text("destination_ip"),
  port: integer("port"),
  protocol: text("protocol").default("tcp"), // tcp, udp, icmp
  action: text("action").notNull(), // allow, block, reject
  priority: integer("priority").default(100),
  isActive: boolean("is_active").default(true),
  deviceId: integer("device_id").references(() => devices.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const networkScans = pgTable("network_scans", {
  id: serial("id").primaryKey(),
  scanType: text("scan_type").notNull(), // port_scan, device_discovery, vulnerability_scan
  targetIp: text("target_ip").notNull(),
  results: text("results"), // JSON object with scan results
  status: text("status").default("pending"), // pending, running, completed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const trafficAnalytics = pgTable("traffic_analytics", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id),
  protocol: text("protocol"), // http, https, dns, etc.
  domain: text("domain"),
  bytesIn: real("bytes_in").default(0),
  bytesOut: real("bytes_out").default(0),
  packetsIn: integer("packets_in").default(0),
  packetsOut: integer("packets_out").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  lastSeen: true,
  totalDataUsed: true,
  currentUsage: true,
  isBlocked: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertNetworkStatsSchema = createInsertSchema(networkStats).omit({
  id: true,
  timestamp: true,
});

export const insertRouterConfigSchema = createInsertSchema(routerConfig).omit({
  id: true,
  lastSync: true,
  isConnected: true,
});

export const insertFirewallRuleSchema = createInsertSchema(firewallRules).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkScanSchema = createInsertSchema(networkScans).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertTrafficAnalyticsSchema = createInsertSchema(trafficAnalytics).omit({
  id: true,
  timestamp: true,
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type NetworkStats = typeof networkStats.$inferSelect;
export type InsertNetworkStats = z.infer<typeof insertNetworkStatsSchema>;
export type RouterConfig = typeof routerConfig.$inferSelect;
export type InsertRouterConfig = z.infer<typeof insertRouterConfigSchema>;
export type FirewallRule = typeof firewallRules.$inferSelect;
export type InsertFirewallRule = z.infer<typeof insertFirewallRuleSchema>;
export type NetworkScan = typeof networkScans.$inferSelect;
export type InsertNetworkScan = z.infer<typeof insertNetworkScanSchema>;
export type TrafficAnalytics = typeof trafficAnalytics.$inferSelect;
export type InsertTrafficAnalytics = z.infer<typeof insertTrafficAnalyticsSchema>;
