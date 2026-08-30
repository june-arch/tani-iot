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
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
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
    if (mode === "register" && !nama.trim()) {
      const m = "Nama wajib diisi untuk registrasi.";
      setErr(m);
      showToast(m);
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const res = await api.post<LoginResponse>("/auth/register", {
          email: email.trim(),
          password,
          nama: nama.trim(),
        });
        setToken(res.accessToken, res.refreshToken, res.user);
        showToast("Registrasi berhasil! Mengalihkan...");
        router.push("/");
        router.refresh();
      } else {
        const res = await api.post<LoginResponse>("/auth/login", {
          email: email.trim(),
          password,
        });
        setToken(res.accessToken, res.refreshToken, res.user);
        showToast("Login berhasil! Mengalihkan...");
        router.push("/");
        router.refresh();
      }
    } catch (e: unknown) {
      const msg =
        (e as { message?: string })?.message ??
        (e as { pesan?: string })?.pesan ??
        "Gagal masuk. Periksa email/password.";
      // terjemahan ramah
      let friendly = msg;
      if (/401|403|Email atau password salah/i.test(msg)) friendly = "Email atau password salah. Coba lagi.";
      else if (/terkunci/i.test(msg)) friendly = msg;
      else if (/sudah terdaftar/i.test(msg)) friendly = "Email sudah terdaftar. Silakan login.";
      setErr(friendly);
      showToast(friendly);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      {/* toast */}
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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-sm"><Leaf className="h-4 w-4" /></span>
            <span className="font-sans text-lg font-bold tracking-tight [text-wrap:balance]">Tani IoT</span>
          </Link>
          <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight [text-wrap:balance]">
            {mode === "login" ? "Masuk ke Tani IoT" : "Buat akun baru"}
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-fg [text-wrap:pretty]">
            {mode === "login" ? "Masuk untuk kelola kebun, lahan, dan sensor." : "Daftar petani — mulai kelola kebun multi-lokasi."}
          </p>
        </div>

        <Card className="space-y-4">
          {/* mode switch */}
          <div className="flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setErr(null); }}
              className={["flex-1 rounded-full py-2 text-sm font-semibold transition-colors", mode === "login" ? "bg-primary text-primary-fg shadow" : "text-muted-fg hover:text-foreground"].join(" ")}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setErr(null); }}
              className={["flex-1 rounded-full py-2 text-sm font-semibold transition-colors", mode === "register" ? "bg-primary text-primary-fg shadow" : "text-muted-fg hover:text-foreground"].join(" ")}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {mode === "register" && (
              <Input
                label="Nama lengkap"
                placeholder="Budi Tani"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                autoComplete="name"
                required
              />
            )}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />

            {err && (
              <div className="flex items-center gap-1.5 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-[#991B1B]">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {err}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
            </Button>
          </form>

          <div className="flex items-center justify-between text-xs">
            <Link href="/" className="font-semibold text-muted-fg hover:text-foreground">
              ← Kembali ke Beranda
            </Link>
            <span className="text-muted-fg">
              {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "login" ? "Daftar" : "Masuk"}
              </button>
            </span>
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-fg">
          Akun demo: gunakan kredensial dari seed backend (admin@tani-iot.local / Admin123!)
        </p>
      </motion.div>
    </div>
  );
}
