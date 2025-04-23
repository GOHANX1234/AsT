import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ResellerLayout from "@/layouts/reseller-layout";
import KeyDetailsModal from "@/components/key-details-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Search, Eye, Trash2 } from "lucide-react";

export default function ResellerKeys() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [keyDetailsOpen, setKeyDetailsOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<number | null>(null);

  // Fetch keys
  const { data: keys, isLoading } = useQuery({
    queryKey: ['/api/reseller/keys'],
  });

  // Revoke key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/reseller/keys/${keyId}/revoke`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reseller/keys'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reseller/profile'] });
      toast({
        title: "Success",
        description: "Key revoked successfully",
      });
      setRevokeDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke key",
        variant: "destructive",
      });
    },
  });

  const handleViewKey = (keyId: number) => {
    setSelectedKeyId(keyId);
    setKeyDetailsOpen(true);
  };

  const handleRevokeKey = (keyId: number) => {
    setKeyToRevoke(keyId);
    setRevokeDialogOpen(true);
  };

  const confirmRevokeKey = () => {
    if (keyToRevoke) {
      revokeKeyMutation.mutate(keyToRevoke);
    }
  };

  // Filter keys
  const filteredKeys = keys?.filter((key) => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      key.keyString.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by game
    const matchesGame = gameFilter === "all" || key.game === gameFilter;
    
    return matchesSearch && matchesGame;
  });

  return (
    <ResellerLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Keys</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search keys..."
              className="pl-9 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={gameFilter}
            onValueChange={setGameFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="PUBG MOBILE">PUBG MOBILE</SelectItem>
              <SelectItem value="LAST ISLAND OF SURVIVAL">LAST ISLAND OF SURVIVAL</SelectItem>
              <SelectItem value="STANDOFF2">STANDOFF2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Game
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expiry
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Devices
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading keys...
                    </td>
                  </tr>
                ) : filteredKeys && filteredKeys.length > 0 ? (
                  filteredKeys.map((key) => {
                    const statusColor = getStatusColor(key.status);
                    return (
                      <tr key={key.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {key.keyString.length > 20 
                              ? `${key.keyString.substring(0, 20)}...` 
                              : key.keyString}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {key.game}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(key.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(key.expiryDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {key.devices}/{key.deviceLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant="outline"
                            className={`${statusColor.bg} ${statusColor.text} border-none`}
                          >
                            {key.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:text-primary/90"
                              onClick={() => handleViewKey(key.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            {key.status === "ACTIVE" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleRevokeKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Revoke
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No keys found. {searchTerm || gameFilter !== "all" ? "Try changing your search filters." : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Details Modal */}
      <KeyDetailsModal
        keyId={selectedKeyId}
        open={keyDetailsOpen}
        onOpenChange={setKeyDetailsOpen}
      />

      {/* Revoke Key Confirmation Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke License Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this key? This action cannot be undone.
              Users will no longer be able to use this license key after revocation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRevokeKey}
              disabled={revokeKeyMutation.isPending}
            >
              {revokeKeyMutation.isPending ? "Revoking..." : "Revoke Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResellerLayout>
  );
}
