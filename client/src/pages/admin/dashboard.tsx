import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { 
  Users, 
  Key, 
  Ticket,
  UserPlus,
  CreditCard
} from "lucide-react";

export default function AdminDashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch resellers for activity list
  const { data: resellers, isLoading: isLoadingResellers } = useQuery({
    queryKey: ['/api/admin/resellers'],
  });

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Resellers</p>
                <h3 className="text-3xl font-semibold mt-1">
                  {isLoadingStats ? "..." : stats?.totalResellers || 0}
                </h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Active Keys</p>
                <h3 className="text-3xl font-semibold mt-1">
                  {isLoadingStats ? "..." : stats?.activeKeys || 0}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Key className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Available Tokens</p>
                <h3 className="text-3xl font-semibold mt-1">
                  {isLoadingStats ? "..." : stats?.availableTokens || 0}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Ticket className="text-purple-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingResellers ? (
            <div className="p-4 text-center text-gray-500">Loading activity...</div>
          ) : resellers && resellers.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {resellers.slice(0, 5).map((reseller) => (
                <div key={reseller.id} className="py-3 px-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <UserPlus className="text-blue-600 h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Reseller registered: <span className="font-medium">{reseller.username}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(reseller.registrationDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No recent activity</div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
