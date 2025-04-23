import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [activeTab, setActiveTab] = useState<"admin" | "reseller">("admin");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const adminForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const resellerForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onAdminSubmit(values: LoginValues) {
    try {
      await login("admin", values.username, values.password);
      toast({
        title: "Success",
        description: "Logged in as admin successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    }
  }

  async function onResellerSubmit(values: LoginValues) {
    try {
      await login("reseller", values.username, values.password);
      toast({
        title: "Success",
        description: "Logged in as reseller successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 bg-gradient-to-br from-background via-background to-purple-950/20 moving-glow">
      <Card className="max-w-md w-full border border-purple-500/30 shadow-xl shadow-purple-500/10 backdrop-blur-sm bg-background/80 border-glow relative z-10">
        <CardContent className="pt-6">
          <div className="text-center mb-8 float">
            <h1 className="text-4xl font-bold text-primary bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent pb-1 glow-text shine-effect">AestrialHack</h1>
            <p className="text-muted-foreground mt-2">Professional License Management</p>
          </div>

          <Tabs defaultValue="admin" onValueChange={(value) => setActiveTab(value as "admin" | "reseller")}>
            <div className="flex justify-center mb-4">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-background/80 p-1 border border-purple-500/20">
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:shadow-none px-4 py-1.5 text-sm font-medium"
                >
                  Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="reseller" 
                  className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:shadow-none px-4 py-1.5 text-sm font-medium"
                >
                  Reseller
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="admin">
              <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter admin username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adminForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter admin password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 glow shine-effect relative" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login as Admin"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="reseller">
              <Form {...resellerForm}>
                <form onSubmit={resellerForm.handleSubmit(onResellerSubmit)} className="space-y-4">
                  <FormField
                    control={resellerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter reseller username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resellerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter reseller password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login as Reseller"}
                  </Button>
                </form>
              </Form>

              <div className="text-center mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Don't have an account?</p>
                <Button 
                  variant="link" 
                  className="mt-1 text-purple-400 hover:text-purple-300"
                  onClick={() => window.location.href = "/register"}
                >
                  Register with Referral Token
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
