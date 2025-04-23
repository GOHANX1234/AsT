import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ResellerLayout from "@/layouts/reseller-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { CreditCard, Key, ClockIcon, User, PlusCircle } from "lucide-react";

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
        <Link href="/reseller/generate">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white py-6 px-8 w-full md:w-auto text-lg glow">
            <PlusCircle className="mr-2 h-6 w-6" /> ✨ GENERATE NEW KEY ✨
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Available Credits</p>
                <h3 className="text-3xl font-semibold mt-1 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {isLoading ? "..." : profile?.credits || 0}
                </h3>
              </div>
              <div className="bg-green-900/30 p-3 rounded-full border border-green-500/20">
                <CreditCard className="text-green-400 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Active Keys</p>
                <h3 className="text-3xl font-semibold mt-1 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  {isLoading ? "..." : profile?.activeKeys || 0}
                </h3>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-full border border-blue-500/20">
                <Key className="text-blue-400 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Expired Keys</p>
                <h3 className="text-3xl font-semibold mt-1 bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                  {isLoading ? "..." : profile?.expiredKeys || 0}
                </h3>
              </div>
              <div className="bg-red-900/30 p-3 rounded-full border border-red-500/20">
                <ClockIcon className="text-red-400 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading activities...</div>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((activity) => (
                <div key={activity.id} className="py-3 px-6">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 border ${
                      activity.type === 'key' 
                        ? 'bg-blue-900/30 border-blue-500/20' 
                        : activity.type === 'credit'
                          ? 'bg-green-900/30 border-green-500/20'
                          : 'bg-purple-900/30 border-purple-500/20'
                    }`}>
                      {activity.type === 'key' ? (
                        <Key className={`h-4 w-4 text-blue-400`} />
                      ) : activity.type === 'credit' ? (
                        <CreditCard className={`h-4 w-4 text-green-400`} />
                      ) : (
                        <User className={`h-4 w-4 text-purple-400`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
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
