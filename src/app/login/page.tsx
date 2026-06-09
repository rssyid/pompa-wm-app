"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to dashboard
        router.push("/dashboard");
        router.refresh(); // Refresh the layout to update the session state
      } else {
        setError(data.error || "Gagal login. Periksa username dan password.");
      }
    } catch (err) {
      setError("Kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nb-yellow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Title Block */}
        <div className="border-4 border-black bg-white p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight">POMPA<span className="text-nb-purple">WM</span></h1>
          <div className="h-2 bg-black w-24 mx-auto mt-4 mb-2"></div>
          <p className="font-bold text-gray-600">Sistem Manajemen Aset Pompa</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border-4 border-black bg-nb-red p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black text-white uppercase text-sm">⚠️ Error: {error}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 bg-nb-cyan inline-block px-3 py-1 border-2 border-black">🔑 Login</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border-4 border-black bg-gray-50 text-black font-bold px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 focus:-translate-x-1 outline-none transition-all"
                placeholder="Masukkan username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-4 border-black bg-gray-50 text-black font-bold px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 focus:-translate-x-1 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-nb-pink border-4 border-black font-black text-lg text-black uppercase py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Memproses..." : "Masuk Sistem"}
            </button>
          </form>
        </div>


      </div>
    </div>
  );
}
