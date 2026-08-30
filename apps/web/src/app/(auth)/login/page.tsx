"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Leaf, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type LoginResponse = {
  user: { id: string; email: string; nama: string; role: string };
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password.trim()) {
      const m = "Email dan password wajib diisi.";
      setErr(m);
      showToast(m);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });
      setToken(res.accessToken, res.refreshToken, res.user);
      showToast("Login berhasil! Mengalihkan...");
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      const msg =
        (e as { message?: string })?.message ??
        (e as { pesan?: string })?.pesan ??
        "Gagal masuk. Periksa email/password.";
      let friendly = msg;
      if (/401|403|Email atau password salah/i.test(msg)) friendly = "Email atau password salah. Coba lagi.";
      else if (/terkunci/i.test(msg)) friendly = msg;
      setErr(friendly);
      showToast(friendly);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      {toast && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-fg shadow-lg">
          {toast}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[440px]"
      >
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-sm">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-sans text-lg font-bold tracking-tight [text-wrap:balance]">Tani IoT</span>
          </Link>
          <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight [text-wrap:balance]">Masuk ke Tani IoT</h1>
          <p className="mt-1 text-sm leading-6 text-muted-fg [text-wrap:pretty]">Masuk untuk kelola kebun, lahan, dan sensor.</p>
        </div>

        <Card className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {err && (
              <div className="flex items-center gap-1.5 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-[#991B1B]">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {err}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="flex justify-center text-xs">
            <Link href="/" className="font-semibold text-muted-fg hover:text-foreground">
              ← Kembali ke Beranda
            </Link>
          </div>
        </Card>

        <p className="mt-4 text-center text-xs leading-4 text-muted-fg">
          Pendaftaran akun baru hanya via Admin. <br />
          Hubungi admin kebun untuk dibuatkan akun.
        </p>
        <p className="mt-2 text-center text-xs text-muted-fg">Kredensial: admin@tani-iot.local / Admin123! (SUPERADMIN)</p>
      </motion.div>
    </div>
  );
}
