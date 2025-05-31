import { useState, useEffect } from "react";
import { Device } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DeviceModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function DeviceModal({ device, isOpen, onClose, onSave }: DeviceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    deviceType: "",
    quotaLimit: "",
    quotaPeriod: "daily",
    quotaAction: "block"
  });

  const { toast } = useToast();

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        deviceType: device.deviceType,
        quotaLimit: device.quotaLimit ? (device.quotaLimit / 1000).toString() : "",
        quotaPeriod: device.quotaPeriod,
        quotaAction: device.quotaAction
      });
    } else {
      setFormData({
        name: "",
        deviceType: "laptop",
        quotaLimit: "",
        quotaPeriod: "daily",
        quotaAction: "block"
      });
    }
  }, [device]);

  const saveDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      if (device) {
        return apiRequest("PATCH", `/api/devices/${device.id}`, data);
      } else {
        return apiRequest("POST", "/api/devices", data);
      }
    },
    onSuccess: () => {
      toast({
        title: device ? "Device Updated" : "Device Added",
        description: `Device has been ${device ? "updated" : "added"} successfully.`,
      });
      onSave();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${device ? "update" : "add"} device.`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const data = {
      name: formData.name,
      deviceType: formData.deviceType,
      quotaLimit: formData.quotaLimit ? parseFloat(formData.quotaLimit) * 1000 : null,
      quotaPeriod: formData.quotaPeriod,
      quotaAction: formData.quotaAction,
      ...(device ? {} : {
        ip: "192.168.1." + Math.floor(Math.random() * 254 + 1),
        mac: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase(),
        status: "online"
      })
    };

    saveDeviceMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {device ? "Edit Device" : "Add New Device"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter device name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={formData.deviceType}
                onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="mobile">Smartphone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="tv">Smart TV</SelectItem>
                  <SelectItem value="gaming">Gaming Console</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Data Quota</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <Input
                  type="number"
                  value={formData.quotaLimit}
                  onChange={(e) => setFormData({ ...formData, quotaLimit: e.target.value })}
                  placeholder="Amount (GB)"
                />
              </div>
              <div>
                <Select
                  value={formData.quotaPeriod}
                  onValueChange={(value) => setFormData({ ...formData, quotaPeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Per Day</SelectItem>
                    <SelectItem value="weekly">Per Week</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label>Action on Quota Breach</Label>
            <RadioGroup
              value={formData.quotaAction}
              onValueChange={(value) => setFormData({ ...formData, quotaAction: value })}
              className="mt-2 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="block" id="block" />
                <Label htmlFor="block" className="text-sm">Block internet access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="throttle" id="throttle" />
                <Label htmlFor="throttle" className="text-sm">Throttle to low speed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notify" id="notify" />
                <Label htmlFor="notify" className="text-sm">Notify only</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={saveDeviceMutation.isPending || !formData.name}
              className="w-full sm:flex-1"
            >
              {saveDeviceMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
