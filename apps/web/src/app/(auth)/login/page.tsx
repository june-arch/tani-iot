"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Leaf, AlertTriangle, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex bg-warm-parchment">
      {/* Left — editorial */}
      <div className="hidden flex-1 flex-col justify-between border-r border-soft-mist bg-paper-white p-8 lg:flex">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight-wine text-paper-white">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-sans text-base font-bold tracking-tight text-ink-charcoal">Tani IoT</span>
          <span className="rounded-pill bg-lilac-mist px-2 py-1 text-xs font-semibold text-ink-charcoal">Multi-Kebun</span>
        </Link>
        <div>
          <h1 className="font-sans text-[42px] font-[460] leading-[0.96] tracking-[-0.028em] text-ink-charcoal [text-wrap:balance]">Sawah, sensor, dan panen — dalam satu layar.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-gray [text-wrap:pretty]">Kelola 1..N kebun, lahan, device & threshold. Full Bahasa Indonesia, offline-tolerant, BOM transparan.</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { k: "QoS1", v: "MQTT retain" },
              { k: "<2 dtk", v: "Telemetry WS" },
              { k: "60+", v: "Komoditas" },
            ].map((s) => (
              <div key={s.k} className="rounded-card border border-soft-mist bg-warm-parchment p-3">
                <p className="font-sans text-sm font-bold text-ink-charcoal">{s.k}</p>
                <p className="text-xs text-stone-gray">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-stone-gray">© Tani IoT • Warm Parchment editorial • Superhuman world</p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        {toast && (
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-fg">
            {toast}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[420px]"
        >
          <div className="mb-6 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight-wine text-paper-white">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="font-sans text-base font-bold tracking-tight">Tani IoT</span>
            </Link>
            <h2 className="mt-4 font-sans text-[26px] font-bold tracking-tight text-ink-charcoal [text-wrap:balance]">Masuk ke Tani IoT</h2>
            <p className="mt-1 text-sm leading-6 text-stone-gray [text-wrap:pretty]">Masuk untuk kelola kebun, lahan, dan sensor.</p>
          </div>

          <Card className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />

              {err && (
                <div className="flex items-center gap-1.5 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {err}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full gap-1.5">
                {loading ? "Memproses..." : "Masuk"} {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="flex justify-between text-xs">
              <Link href="/" className="font-medium text-royal-violet hover:underline">
                ← Kembali ke Beranda
              </Link>
              <span className="text-stone-gray">Lupa password? Hubungi admin</span>
            </div>
          </Card>
          <p className="mt-4 text-center text-xs leading-4 text-stone-gray [text-wrap:pretty]">Dengan masuk, Anda menyetujui data petani adalah milik petani — tidak dijual, export kapan saja.</p>
        </motion.div>
      </div>
    </div>
  );
}
