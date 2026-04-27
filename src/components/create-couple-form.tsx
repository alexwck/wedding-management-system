"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCoupleFormSchema,
  type CreateCoupleFormData,
} from "@/lib/validations/admin";
import { createCoupleAccount } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

export function CreateCoupleForm() {
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  const form = useForm<CreateCoupleFormData>({
    resolver: zodResolver(createCoupleFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    },
  });

  async function onSubmit(data: CreateCoupleFormData) {
    setServerMessage(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("displayName", data.displayName);

    const result = await createCoupleAccount(formData);

    if (result.success) {
      setServerMessage({
        type: "success",
        text: `Couple account created! Wedding slug: ${result.slug}`,
      });
      form.reset();
      router.refresh();
    } else {
      setServerMessage({ type: "error", text: result.message ?? "Failed to create couple account." });
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create Couple</h3>

      {serverMessage && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            serverMessage.type === "success"
              ? "border-green-500/50 bg-green-500/10 text-green-700"
              : "border-destructive/50 bg-destructive/10 text-destructive"
          }`}
        >
          {serverMessage.text}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="couple@example.com"
                    className="min-h-[44px]"
                    {...field}
                  />
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
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className="min-h-[44px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    className="min-h-[44px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Jane Doe"
                    className="min-h-[44px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full min-h-[44px]">
            {form.formState.isSubmitting ? "Creating..." : "Create Couple"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
