"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";

interface Aset {
  asset_code: string;
  asset_name: string;
  kondisi_terkini: string;
  estate_name: string;
  estate_deployed_name: string;
  block_deployed: string;
}
interface Inspeksi {
  id_inspeksi: number;
  tgl_inspeksi: string;
  asset_name: string;
  asset_code: string;
  estate_name: string;
  block: string;
  issues_opened: any[];
}
interface Mutasi {
  id_mutasi: number;
  tgl_pindah: string;
  asset_name: string;
  estate_tujuan: string;
}

export default function DashboardPage() {
  const [totalAset, setTotalAset] = useState(0);
  const [totalInspeksi, setTotalInspeksi] = useState(0);
  const [totalMutasi, setTotalMutasi] = useState(0);
  const [recentMutasi, setRecentMutasi] = useState<Mutasi[]>([]);
  const [brokenAsets, setBrokenAsets] = useState<Aset[]>([]);

  useEffect(() => {
    // Fetch summary data
    Promise.all([
      fetch("/api/aset").then((res) => res.json()),
      fetch("/api/inspeksi").then((res) => res.json()),
      fetch("/api/mutasi").then((res) => res.json()),
    ]).then(([asetData, inspeksiData, mutasiData]) => {
      if (Array.isArray(asetData)) {
        setTotalAset(asetData.length);
        // Filter aset dengan kondisi bermasalah (bukan 'baik')
        // Sumber kebenaran: field kondisi_terkini yang diupdate otomatis saat inspeksi
        const broken = asetData.filter(
          (a: Aset) => a.kondisi_terkini && a.kondisi_terkini !== "baik"
        );
        setBrokenAsets(broken.slice(0, 5));
      }

      if (Array.isArray(inspeksiData)) {
        setTotalInspeksi(inspeksiData.length);
      }

      if (Array.isArray(mutasiData)) {
        setTotalMutasi(mutasiData.length);
        // Sort mutasi desc by tgl_pindah
        const sorted = mutasiData.sort(
          (a, b) => new Date(b.tgl_pindah).getTime() - new Date(a.tgl_pindah).getTime()
        );
        setRecentMutasi(sorted.slice(0, 5));
      }
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tight">
          Control Center
        </h1>
        <div className="h-2 bg-nb-pink border-2 border-black mt-2 w-48" />
        <p className="mt-4 font-bold text-black/70 dark:text-white/70">
          Ringkasan status terkini pergerakan dan kesehatan aset pompa Anda.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Aset Pompa"
          value={totalAset.toString()}
          color="bg-nb-cyan"
          trend="neutral"
          trendValue="Di seluruh area"
          icon={<span className="text-2xl">🏭</span>}
        />
        <StatCard
          title="Pompa Bermasalah"
          value={brokenAsets.length.toString()}
          color="bg-nb-red"
          trend="up"
          trendValue="Kondisi tidak baik"
          icon={<span className="text-2xl">🚨</span>}
        />
        <StatCard
          title="Total Inspeksi"
          value={totalInspeksi.toString()}
          color="bg-nb-green"
          trend="up"
          trendValue="Tercatat di sistem"
          icon={<span className="text-2xl">🔍</span>}
        />
        <StatCard
          title="Total Mutasi"
          value={totalMutasi.toString()}
          color="bg-nb-purple"
          trend="up"
          trendValue="Tercatat di sistem"
          icon={<span className="text-2xl">🔄</span>}
        />
      </div>

      {/* Quick Actions */}
      <div className="border-4 border-black bg-nb-yellow p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black text-black uppercase mb-4">
          ⚡ Jalan Pintas
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/inspeksi"
            className="btn-nb bg-nb-green text-black px-6 py-3 text-lg no-underline flex-1 text-center"
          >
            🔍 Inspeksi Baru
          </Link>
          <Link
            href="/dashboard/mutasi"
            className="btn-nb bg-nb-cyan text-black px-6 py-3 text-lg no-underline flex-1 text-center"
          >
            🔄 Mutasi Pompa
          </Link>
          <Link
            href="/dashboard/aset"
            className="btn-nb bg-white text-black px-6 py-3 text-lg no-underline flex-1 text-center"
          >
            ➕ Tambah Aset
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Critical Issues */}
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-nb-red border-b-4 border-black p-4">
            <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
              <span>⚠️</span> Peringatan Kerusakan
            </h2>
          </div>
          <div className="p-0">
            {brokenAsets.length === 0 ? (
              <div className="p-8 text-center font-bold text-black/70 dark:text-white/70">
                ✅ Tidak ada isu kerusakan terbuka. Semua pompa dalam kondisi baik.
              </div>
            ) : (
              <ul className="divide-y-4 divide-black">
                {brokenAsets.map((aset, idx) => (
                  <li
                    key={idx}
                    className="p-4 hover:bg-nb-pink/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black text-lg text-black dark:text-white">
                        {aset.asset_name}
                      </div>
                      <span className="badge-nb bg-nb-red text-white text-xs uppercase">
                        {aset.kondisi_terkini}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-black/70 dark:text-white/70">
                      📍 {aset.estate_deployed_name || aset.estate_name}
                      {aset.block_deployed ? ` — Blok ${aset.block_deployed}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {brokenAsets.length > 0 && (
              <div className="p-4 border-t-4 border-black bg-gray-50 dark:bg-gray-800 text-center">
                <Link
                  href="/dashboard/inspeksi"
                  className="font-black text-black dark:text-white underline decoration-4 decoration-nb-red hover:bg-nb-red hover:text-white transition-colors"
                >
                  Lihat Semua Inspeksi
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities (Mutasi) */}
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-nb-cyan border-b-4 border-black p-4">
            <h2 className="text-xl font-black text-black uppercase flex items-center gap-2">
              <span>📜</span> Mutasi Terakhir
            </h2>
          </div>
          <div className="p-0">
            {recentMutasi.length === 0 ? (
              <div className="p-8 text-center font-bold text-black/70 dark:text-white/70">
                Belum ada riwayat pemindahan pompa.
              </div>
            ) : (
              <ul className="divide-y-4 divide-black">
                {recentMutasi.map((m, idx) => (
                  <li
                    key={idx}
                    className="p-4 hover:bg-nb-cyan/10 transition-colors flex items-center gap-4"
                  >
                    <div className="h-12 w-12 flex-shrink-0 border-4 border-black bg-nb-yellow flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      🚜
                    </div>
                    <div>
                      <div className="font-bold text-black dark:text-white text-sm">
                        <span className="font-black">{m.asset_name}</span>{" "}
                        dipindahkan ke{" "}
                        <span className="font-black">{m.estate_tujuan}</span>
                      </div>
                      <div className="text-xs font-bold text-black/50 dark:text-white/50 mt-1">
                        Tanggal:{" "}
                        {new Date(m.tgl_pindah).toLocaleDateString("en-GB")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {recentMutasi.length > 0 && (
              <div className="p-4 border-t-4 border-black bg-gray-50 dark:bg-gray-800 text-center">
                <Link
                  href="/dashboard/mutasi"
                  className="font-black text-black dark:text-white underline decoration-4 decoration-nb-cyan hover:bg-nb-cyan hover:text-white transition-colors"
                >
                  Lihat Semua Riwayat Mutasi
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
