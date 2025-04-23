import { useState } from "react";
import { X, Copy, Trash } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface KeyDetailsModalProps {
  keyId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KeyDetailsModal({
  keyId,
  open,
  onOpenChange,
}: KeyDetailsModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch key details
  const { data: keyDetails, isLoading } = useQuery({
    queryKey: [`/api/reseller/keys/${keyId}`],
    enabled: open && !!keyId,
  });

  // Remove device mutation
  const removeDeviceMutation = useMutation({
    mutationFn: async ({ keyId, deviceId }: { keyId: number; deviceId: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/reseller/keys/${keyId}/devices/${deviceId}/remove`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reseller/keys/${keyId}`] });
      toast({
        title: "Success",
        description: "Device removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove device",
        variant: "destructive",
      });
    },
  });

  const handleCopyKey = () => {
    if (keyDetails?.keyString) {
      navigator.clipboard.writeText(keyDetails.keyString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "License key copied to clipboard",
      });
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    if (keyId) {
      removeDeviceMutation.mutate({ keyId, deviceId });
    }
  };

  const statusColor = keyDetails?.status 
    ? getStatusColor(keyDetails.status)
    : { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Key Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-6 flex justify-center">
            <div className="animate-pulse">Loading key details...</div>
          </div>
        ) : keyDetails ? (
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500 block">License Key</span>
              <div className="flex items-center mt-1">
                <code className="font-mono text-sm bg-gray-100 p-2 rounded flex-grow overflow-x-auto">
                  {keyDetails.keyString}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 block">Game</span>
                <span className="text-sm font-medium block mt-1">
                  {keyDetails.game}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Status</span>
                <Badge 
                  variant="outline" 
                  className={`mt-1 ${statusColor.bg} ${statusColor.text} border-none`}
                >
                  {keyDetails.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Created</span>
                <span className="text-sm block mt-1">
                  {formatDate(keyDetails.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Expires</span>
                <span className="text-sm block mt-1">
                  {formatDate(keyDetails.expiryDate)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500 block">Connected Devices</span>
              {keyDetails.devices && keyDetails.devices.length > 0 ? (
                <div className="mt-2 border rounded-md divide-y">
                  {keyDetails.devices.map((device) => (
                    <div
                      key={device.id}
                      className="p-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="text-sm font-medium block">
                          Device ID: {device.deviceId}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          First connected: {formatDate(device.firstConnected)}
                        </span>
                      </div>
                      {keyDetails.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-900 text-sm"
                          onClick={() => handleRemoveDevice(device.deviceId)}
                          disabled={removeDeviceMutation.isPending}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500 p-3 border rounded-md bg-gray-50">
                  No devices connected to this key yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">
            Key details not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
