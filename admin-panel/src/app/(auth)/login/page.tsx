import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getSessionUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.20),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_30%)]" />
      <div className="absolute inset-y-10 left-10 hidden w-80 rounded-full bg-primary/15 blur-3xl lg:block" />
      <div className="absolute bottom-0 right-10 hidden h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl lg:block" />
      <div className="relative flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200">Hospaccx Admin Panel</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight lg:text-6xl">
            Production-ready control room for Banerjee Diagnostic Foundation and Hospaccx.
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-300 lg:text-lg">
            Manage doctors, diagnostic services, patient reviews, appointments, and core website content from one
            secure dashboard.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
