"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Leaf, AlertTriangle, ArrowRight } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function friendlyError(msg: string) {
  if (/401|403|Email atau password salah|CredentialsSignin/i.test(msg))
    return "Email atau password salah. Coba lagi.";
  return msg;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const login = useMutation({
    mutationFn: async (v: LoginInput) => {
      const res = await signIn("credentials", {
        email: v.email.trim(),
        password: v.password,
        redirect: false,
      });
      if (!res || res.error) {
        throw new Error(res?.error ?? "Gagal masuk. Periksa email/password.");
      }
      return res;
    },
    onSuccess: () => {
      showToast("Login berhasil! Mengalihkan...");
      router.push("/");
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: { email: "", password: "" } as LoginInput,
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        await login.mutateAsync(value);
      } catch (e: unknown) {
        showToast(friendlyError((e as { message?: string })?.message ?? "Gagal masuk."));
      }
    },
  });

  return (
    <div className="flex min-h-screen bg-warm-parchment">
      <div className="hidden flex-1 flex-col justify-between border-r border-soft-mist bg-paper-white p-8 lg:flex">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight-wine text-paper-white">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-sans text-base font-bold tracking-tight text-ink-charcoal">Tani IoT</span>
          <span className="rounded-pill bg-lilac-mist px-2 py-1 text-xs font-semibold">Multi-Kebun</span>
        </Link>
        <div>
          <h1 className="font-sans text-[42px] font-[460] leading-[0.96] text-ink-charcoal">
            Sawah, sensor, dan panen — dalam satu layar.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-gray">
            Kelola 1..N kebun, lahan, device & threshold. Full Bahasa Indonesia.
          </p>
        </div>
        <p className="text-xs text-stone-gray">© Tani IoT • Warm Parchment editorial</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Toast message={toast} variant="error" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
          <h2 className="mt-4 font-sans text-[26px] font-[460] text-ink-charcoal">Masuk ke Tani IoT</h2>
          <p className="mt-1 text-sm text-stone-gray">Masuk untuk kelola kebun, lahan, dan sensor.</p>

          <Card className="mt-4 space-y-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <form.Field name="email">
                {(f) => (
                  <Input
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                    error={f.state.meta.errors[0]?.message}
                    autoComplete="email"
                    required
                  />
                )}
              </form.Field>
              <form.Field name="password">
                {(f) => (
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                    error={f.state.meta.errors[0]?.message}
                    autoComplete="current-password"
                    required
                  />
                )}
              </form.Field>

              {login.isError && (
                <div className="flex items-center gap-1.5 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {friendlyError((login.error as { message?: string })?.message ?? "Gagal masuk.")}
                </div>
              )}

              <Button type="submit" disabled={login.isPending} className="w-full gap-1.5">
                {login.isPending ? "Memproses..." : "Masuk"} {!login.isPending && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
