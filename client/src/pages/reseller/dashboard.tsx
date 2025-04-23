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
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm">Manage your license keys</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white py-5 px-6 w-full sm:w-auto text-base shadow-lg shadow-purple-900/20 border border-purple-500/20"
          onClick={() => window.location.href = "/reseller/generate"}
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Generate New Key
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Stats Cards */}
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="bg-green-900/30 p-3 rounded-full border border-green-500/20 mr-4">
                <CreditCard className="text-green-400 h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Available Credits</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {isLoading ? "..." : profile?.credits || 0}
                </h3>
              </div>
            </div>
            <div className="bg-green-900/10 h-1 w-full"></div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="bg-blue-900/30 p-3 rounded-full border border-blue-500/20 mr-4">
                <Key className="text-blue-400 h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Keys</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  {isLoading ? "..." : profile?.activeKeys || 0}
                </h3>
              </div>
            </div>
            <div className="bg-blue-900/10 h-1 w-full"></div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="bg-amber-900/30 p-3 rounded-full border border-amber-500/20 mr-4">
                <ClockIcon className="text-amber-400 h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Expired Keys</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                  {isLoading ? "..." : profile?.expiredKeys || 0}
                </h3>
              </div>
            </div>
            <div className="bg-amber-900/10 h-1 w-full"></div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
          <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-purple-900/30 rounded-full mb-2"></div>
                <div className="h-2.5 bg-purple-900/30 rounded-full w-24 mb-1.5"></div>
                <div className="h-2 bg-purple-900/20 rounded-full w-16"></div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((activity) => (
                <div key={activity.id} className="py-3 px-6 hover:bg-purple-900/5 transition-colors">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 border ${
                      activity.type === 'key' 
                        ? 'bg-blue-900/30 border-blue-500/20' 
                        : activity.type === 'credit'
                          ? 'bg-green-900/30 border-green-500/20'
                          : 'bg-purple-900/30 border-purple-500/20'
                    }`}>
                      {activity.type === 'key' ? (
                        <Key className="h-4 w-4 text-blue-400" />
                      ) : activity.type === 'credit' ? (
                        <CreditCard className="h-4 w-4 text-green-400" />
                      ) : (
                        <User className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{activity.description}</p>
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
