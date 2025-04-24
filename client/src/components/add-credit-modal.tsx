import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
} from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddCreditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const addCreditSchema = z.object({
  resellerId: z.string().min(1, "Please select a reseller"),
  amount: z.string().min(1, "Amount is required").transform((val) => parseInt(val, 10)),
});

type AddCreditValues = z.infer<typeof addCreditSchema>;

export default function AddCreditModal({
  open,
  onOpenChange,
}: AddCreditModalProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch resellers
  const { data: resellers = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/resellers'],
    enabled: open,
  });

  const form = useForm<AddCreditValues>({
    resolver: zodResolver(addCreditSchema),
    defaultValues: {
      resellerId: "",
      amount: "",
    },
  });

  // Add credit mutation
  const addCreditMutation = useMutation({
    mutationFn: async (values: AddCreditValues) => {
      const response = await apiRequest("POST", "/api/admin/resellers/credits", {
        resellerId: parseInt(values.resellerId),
        amount: values.amount,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Credits added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add credits",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AddCreditValues) {
    addCreditMutation.mutate(values);
  }

  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="resellerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Reseller</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reseller" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {resellers.map((reseller: any) => (
                    <SelectItem key={reseller.id} value={reseller.id.toString()}>
                      {reseller.username} - Current: {reseller.credits} credits
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter amount to add"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={addCreditMutation.isPending}
        >
          {addCreditMutation.isPending ? "Adding..." : "Add Credit"}
        </Button>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <MobileDialog open={open} onOpenChange={onOpenChange}>
        <MobileDialogContent>
          <MobileDialogHeader>
            <MobileDialogTitle>Add Credit to Reseller</MobileDialogTitle>
          </MobileDialogHeader>
          <div className="p-4">
            {renderForm()}
          </div>
        </MobileDialogContent>
      </MobileDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Credit to Reseller</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
