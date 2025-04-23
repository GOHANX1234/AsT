import React, { useState } from "react";
import ResellerLayout from "@/layouts/reseller-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { generateRandomKey } from "@/lib/utils";

const generateKeySchema = z.object({
  game: z.string().min(1, "Game selection is required"),
  deviceLimit: z.string().min(1, "Device limit is required"),
  days: z.number().min(1, "Must be at least 1 day").default(30),
  keyCount: z.number().min(1, "Must generate at least 1 key").default(1),
  customKey: z.string().optional(),
});

type GenerateKeyValues = z.infer<typeof generateKeySchema>;

export default function ResellerGenerate() {
  const { toast } = useToast();
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);

  // Fetch reseller profile
  const { data: profile } = useQuery({
    queryKey: ['/api/reseller/profile'],
  });

  const form = useForm<GenerateKeyValues>({
    resolver: zodResolver(generateKeySchema),
    defaultValues: {
      game: "",
      deviceLimit: "1",
      days: 30,
      keyCount: 1,
      customKey: "",
    },
  });

  // Generate key mutation
  const generateKeyMutation = useMutation({
    mutationFn: async (values: GenerateKeyValues) => {
      // Parse the device limit as a number
      const deviceLimit = parseInt(values.deviceLimit);
      
      // Calculate expiry date based on days
      const today = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(today.getDate() + values.days);
      
      // Get user ID for resellerId
      const user = (await apiRequest("GET", "/api/auth/session").then(res => res.json())).user;
      
      if (!user || !user.id) {
        throw new Error("User session not found. Please log in again.");
      }
      
      const payload = {
        game: values.game,
        deviceLimit: deviceLimit,
        expiryDate: expiryDate,
        keyString: values.customKey || undefined,
        count: values.keyCount,
        resellerId: user.id, // Add the resellerId from session
      };
      
      console.log("Sending payload:", payload);
      
      const response = await apiRequest("POST", "/api/reseller/keys/generate", payload);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate key");
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reseller/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reseller/keys'] });
      
      if (data.keys && data.keys.length > 0) {
        setGeneratedKeys(data.keys.map((key: any) => key.keyString));
        
        toast({
          title: "Success",
          description: `Generated ${data.keys.length} key(s) successfully`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate keys",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: GenerateKeyValues) {
    generateKeyMutation.mutate(values);
  }

  const handleGenerateRandomKey = () => {
    const game = form.getValues("game");
    if (!game) {
      toast({
        title: "Error",
        description: "Please select a game first",
        variant: "destructive",
      });
      return;
    }
    
    const randomKey = generateRandomKey(game);
    form.setValue("customKey", randomKey);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Key copied to clipboard",
    });
  };

  return (
    <ResellerLayout>
      <h2 className="text-2xl font-semibold mb-6">Generate New Keys</h2>
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="game"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Game</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBG MOBILE">PUBG MOBILE</SelectItem>
                        <SelectItem value="LAST ISLAND OF SURVIVAL">LAST ISLAND OF SURVIVAL</SelectItem>
                        <SelectItem value="STANDOFF2">STANDOFF2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deviceLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Limit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device limit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Device</SelectItem>
                        <SelectItem value="2">2 Devices</SelectItem>
                        <SelectItem value="100">100 Devices (Unlimited)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={field.value.toString()}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        className="glow-input"
                      />
                    </FormControl>
                    <FormDescription>
                      License will be valid for this many days from today
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="keyCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Keys</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={field.value.toString()}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          className="glow-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Key (Optional)</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            placeholder="Leave empty for auto-generate"
                            {...field}
                            className="glow-input"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateRandomKey}
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-900/40"
                        >
                          Random
                        </Button>
                      </div>
                      <FormDescription>
                        Custom key will be used only for the first key if generating multiple
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Alert className="bg-purple-900/30 text-purple-100 border border-purple-500/30">
                <Info className="h-4 w-4 text-purple-400" />
                <AlertTitle className="text-purple-300 font-bold">Cost Information</AlertTitle>
                <AlertDescription className="text-purple-100">
                  Cost per key: <span className="font-medium text-white">1 credit</span>. You have{" "}
                  <span className="font-medium text-white">{profile?.credits || 0}</span> credits available.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 glow"
                disabled={generateKeyMutation.isPending}
              >
                {generateKeyMutation.isPending
                  ? "Generating..."
                  : "✨ GENERATE KEYS ✨"}
              </Button>
            </form>
          </Form>

          {generatedKeys.length > 0 && (
            <div className="mt-6 p-4 border border-purple-500/30 rounded-md bg-gradient">
              <h3 className="text-lg font-medium mb-4 text-purple-300">✨ Your Generated Keys:</h3>
              <div className="space-y-3">
                {generatedKeys.map((key, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <code className="flex-1 font-mono text-sm bg-purple-900/40 text-purple-100 p-3 rounded-md border border-purple-500/20">
                      {key}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-900/40 hover:text-purple-100"
                      onClick={() => copyToClipboard(key)}
                    >
                      Copy Key
                    </Button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-purple-300 opacity-70">Remember to keep your keys secure and share them only with trusted users.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </ResellerLayout>
  );
}