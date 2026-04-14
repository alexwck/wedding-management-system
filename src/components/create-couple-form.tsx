"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCoupleSchema,
  type CreateCoupleFormData,
} from "@/lib/validations/admin";
import { createCoupleAccount } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function CreateCoupleForm() {
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCoupleFormData>({
    resolver: zodResolver(createCoupleSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      coupleName: "",
    },
  });

  async function onSubmit(data: CreateCoupleFormData) {
    setServerMessage(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("displayName", data.displayName);
    formData.append("coupleName", data.coupleName);

    const result = await createCoupleAccount(formData);

    if (result.success) {
      setServerMessage({
        type: "success",
        text: `Couple account created! Wedding slug: ${result.slug}`,
      });
      reset();
    } else {
      setServerMessage({ type: "error", text: result.message ?? "Failed to create couple account." });
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create Couple Account</h3>

      {serverMessage?.type === "success" && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700">
          {serverMessage.text}
        </div>
      )}

      {serverMessage?.type === "error" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {serverMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="couple@example.com"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="text-sm font-medium leading-none"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            placeholder="Jane Doe"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className="text-sm text-destructive">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="coupleName"
            className="text-sm font-medium leading-none"
          >
            Couple Name
          </label>
          <input
            id="coupleName"
            type="text"
            placeholder="Jane & John"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("coupleName")}
          />
          {errors.coupleName && (
            <p className="text-sm text-destructive">
              {errors.coupleName.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Couple"}
        </Button>
      </form>
    </div>
  );
}
