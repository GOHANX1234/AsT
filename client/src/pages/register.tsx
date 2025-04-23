import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralToken: z.string().min(1, "Referral token is required"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      referralToken: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      await register(values.username, values.password, values.referralToken);
      toast({
        title: "Success",
        description: "Account registered successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to register",
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
            <p className="text-muted-foreground mt-2">Reseller Registration</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Choose a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="referralToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your referral token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Account"}
              </Button>

              <div className="text-center mt-2">
                <Link href="/">
                  <Button variant="link" className="text-primary hover:text-primary/90">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
