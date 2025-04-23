import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/admin-layout";
import AddCreditModal from "@/components/add-credit-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Edit, Ban } from "lucide-react";

export default function AdminResellers() {
  const { toast } = useToast();
  const [addCreditModalOpen, setAddCreditModalOpen] = useState(false);

  // Fetch resellers
  const { data: resellers, isLoading } = useQuery({
    queryKey: ['/api/admin/resellers'],
  });

  // Toggle reseller status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/resellers/${id}/toggle-status`,
        { isActive }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resellers'] });
      toast({
        title: "Success",
        description: "Reseller status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reseller status",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Resellers</h2>
        <Button
          onClick={() => setAddCreditModalOpen(true)}
          className="flex items-center"
        >
          <PlusCircle className="mr-1 h-4 w-4" /> Add Credit
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Credit Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Keys
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
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading resellers...
                    </td>
                  </tr>
                ) : resellers && resellers.length > 0 ? (
                  resellers.map((reseller) => (
                    <tr key={reseller.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {reseller.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {reseller.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(reseller.registrationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {reseller.credits}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reseller.totalKeys || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={reseller.isActive ? "success" : "secondary"}>
                          {reseller.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleToggleStatus(reseller.id, reseller.isActive)}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {reseller.isActive ? (
                              <>
                                <Ban className="h-4 w-4 mr-1" /> Suspend
                              </>
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No resellers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddCreditModal
        open={addCreditModalOpen}
        onOpenChange={setAddCreditModalOpen}
      />
    </AdminLayout>
  );
}
