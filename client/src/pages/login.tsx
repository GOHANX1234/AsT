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
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-primary">KeyMaster</h1>
            <p className="text-muted-foreground mt-2">Professional License Management</p>
          </div>

          <Tabs defaultValue="admin" onValueChange={(value) => setActiveTab(value as "admin" | "reseller")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
              <TabsTrigger value="reseller">Reseller Login</TabsTrigger>
            </TabsList>

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
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
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
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login as Reseller"}
                  </Button>
                </form>
              </Form>

              <div className="text-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Don't have an account?</p>
                <Link href="/register">
                  <Button variant="link" className="mt-1 font-medium">
                    Register with Referral Token
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
