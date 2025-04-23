import { useQuery } from "@tanstack/react-query";
import ResellerLayout from "@/layouts/reseller-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CreditCard, Key, ClockIcon, User } from "lucide-react";

export default function ResellerDashboard() {
  // Fetch reseller profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/reseller/profile'],
  });

  // Mock activities for now
  const activities = [
    {
      id: 1,
      type: "key",
      description: "Generated new keys for PUBG MOBILE",
      date: new Date(Date.now() - 3600 * 1000), // 1 hour ago
    },
    {
      id: 2,
      type: "credit",
      description: "Received credits from admin",
      date: new Date(Date.now() - 86400 * 1000), // 1 day ago
    },
    {
      id: 3,
      type: "account",
      description: "Account created",
      date: profile?.registrationDate,
    },
  ];

  return (
    <ResellerLayout>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Available Credits</p>
                <h3 className="text-3xl font-semibold mt-1">
                  {isLoading ? "..." : profile?.credits || 0}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CreditCard className="text-green-600 h-6 w-6" />
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
                  {isLoading ? "..." : profile?.activeKeys || 0}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Key className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Expired Keys</p>
                <h3 className="text-3xl font-semibold mt-1">
                  {isLoading ? "..." : profile?.expiredKeys || 0}
                </h3>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ClockIcon className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading activities...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <div key={activity.id} className="py-3 px-6">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      activity.type === 'key' 
                        ? 'bg-blue-100' 
                        : activity.type === 'credit'
                          ? 'bg-green-100'
                          : 'bg-purple-100'
                    }`}>
                      {activity.type === 'key' ? (
                        <Key className={`h-4 w-4 text-blue-600`} />
                      ) : activity.type === 'credit' ? (
                        <CreditCard className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <User className={`h-4 w-4 text-purple-600`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.date ? formatDate(activity.date) : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ResellerLayout>
  );
}
