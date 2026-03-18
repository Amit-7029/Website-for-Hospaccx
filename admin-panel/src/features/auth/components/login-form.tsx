"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { useLogin } from "@/features/auth/hooks/use-login";

export function LoginForm() {
  const { form, onSubmit } = useLogin();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md"
    >
      <Card className="overflow-hidden border-white/40 bg-white/85 shadow-soft backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Admin sign in</CardTitle>
            <CardDescription>
              Secure access for admin and staff to manage doctors, appointments, reviews, and website content.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <FormField label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
              <Input id="email" type="email" placeholder="admin@hospaccx.com" {...form.register("email")} />
            </FormField>
            <FormField label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
              <Input id="password" type="password" placeholder="Enter your password" {...form.register("password")} />
            </FormField>
            <Button className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Sign in securely"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
