import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Lock, 
  UserCheck, 
  User, 
  MailCheck, 
  ShieldCheck,
  LogIn,
  UserPlus
} from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["admin", "reseller"]).default("reseller")
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  referralToken: z.string().min(4, "Referral token is required")
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isAuthenticated, login, register } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");

  // If user is already logged in, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    return <Redirect to={user.role === "admin" ? "/admin" : "/reseller"} />;
  }

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "reseller"
    }
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      referralToken: ""
    }
  });

  const onLoginSubmit = async (values: LoginValues) => {
    try {
      await login(values.role, values.username, values.password);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not login. Please check your credentials.",
        variant: "destructive"
      });
    }
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    try {
      await register(values.username, values.password, values.referralToken);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register. Please check your information.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-xl overflow-hidden shadow-xl shadow-purple-900/20 border border-purple-500/20">
        {/* Left Column - Form */}
        <div className="bg-black/60 p-8">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent glow-text">AestrialHack</h1>
            <span className="ml-3 px-3 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-md border border-purple-500/20">
              License System
            </span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:shadow-sm">
                <LogIn className="h-4 w-4 mr-2" /> Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:shadow-sm">
                <UserPlus className="h-4 w-4 mr-2" /> Register
              </TabsTrigger>
            </TabsList>

            {/* Login Content */}
            <TabsContent value="login">
              <Card className="border-purple-500/20 bg-black/40 shadow-lg shadow-purple-500/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
                  <CardDescription>Login to manage your license keys</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Login As</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                type="button" 
                                variant={field.value === "admin" ? "default" : "outline"}
                                className={field.value === "admin" ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-900/20 border-purple-500/20"} 
                                onClick={() => loginForm.setValue("role", "admin")}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" /> Admin
                              </Button>
                              <Button 
                                type="button" 
                                variant={field.value === "reseller" ? "default" : "outline"}
                                className={field.value === "reseller" ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-900/20 border-purple-500/20"} 
                                onClick={() => loginForm.setValue("role", "reseller")}
                              >
                                <User className="h-4 w-4 mr-2" /> Reseller
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="Enter your username" 
                                  className="pl-10 bg-black/20 border-purple-500/20 focus:border-purple-500 focus-visible:ring-purple-500/20" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder="Enter your password" 
                                  className="pl-10 bg-black/20 border-purple-500/20 focus:border-purple-500 focus-visible:ring-purple-500/20" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6 mt-2 glow"
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {loginForm.formState.isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Logging in...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <LogIn className="h-5 w-5 mr-2" /> Login
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setActiveTab("register")} 
                      className="text-purple-400 hover:text-purple-300 hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Register Content */}
            <TabsContent value="register">
              <Card className="border-purple-500/20 bg-black/40 shadow-lg shadow-purple-500/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Create Account</CardTitle>
                  <CardDescription>Register as a reseller using your referral token</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="Choose a username" 
                                  className="pl-10 bg-black/20 border-purple-500/20 focus:border-purple-500 focus-visible:ring-purple-500/20" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder="Create a password" 
                                  className="pl-10 bg-black/20 border-purple-500/20 focus:border-purple-500 focus-visible:ring-purple-500/20" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="referralToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referral Token</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MailCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="Enter your referral token" 
                                  className="pl-10 bg-black/20 border-purple-500/20 focus:border-purple-500 focus-visible:ring-purple-500/20" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6 mt-2 glow"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Registering...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <UserPlus className="h-5 w-5 mr-2" /> Register
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setActiveTab("login")} 
                      className="text-purple-400 hover:text-purple-300 hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Hero */}
        <div className="hidden lg:block bg-gradient-to-br from-purple-900/40 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTI5LCAzOSwgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
          <div className="relative h-full flex flex-col justify-center p-12 z-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">AestrialHack License System</h2>
              <p className="text-lg text-purple-100 mb-6">A powerful platform for managing game hack licenses with advanced features.</p>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-start">
                  <div className="rounded-full bg-purple-600/20 p-2 mr-4">
                    <ShieldCheck className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Secure Key Management</h3>
                    <p className="text-purple-200/70">Generate and manage secure license keys for multiple games</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-purple-600/20 p-2 mr-4">
                    <User className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Reseller Portal</h3>
                    <p className="text-purple-200/70">Dedicated dashboard for resellers to manage keys and customers</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-purple-600/20 p-2 mr-4">
                    <Lock className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Device Restriction</h3>
                    <p className="text-purple-200/70">Limit the number of devices per license key</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="border-t border-purple-500/20 pt-6">
                <p className="text-sm text-purple-300">© 2025 AestrialHack. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}