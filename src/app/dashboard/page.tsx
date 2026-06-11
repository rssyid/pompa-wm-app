"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";

interface Aset {
  asset_code: string;
  asset_name: string;
  kondisi_terkini: string;
  company_code: string | null;
  estate_name: string;
  estate_deployed_name: string;
  block_deployed: string;
}

interface Mutasi {
  id_mutasi: number;
  tgl_pindah: string;
  asset_name: string;
  asset_code: string;
  estate_tujuan: string;
  company_code: string | null;
}

interface CompanySummary {
  company: string;
  total: number;
  baik: number;
  bermasalah: number;
  kondisiMap: Record<string, number>;
}

const KONDISI_COLORS: Record<string, { bg: string; text: string }> = {
  baik:               { bg: "bg-nb-green",  text: "text-black" },
  "rusak ringan":     { bg: "bg-nb-orange", text: "text-black" },
  "rusak berat":      { bg: "bg-nb-red",    text: "text-white" },
  "tidak beroperasi": { bg: "bg-gray-400",  text: "text-white" },
  "dalam perbaikan":  { bg: "bg-nb-cyan",   text: "text-black" },
};

export default function DashboardPage() {
  const [totalAset, setTotalAset] = useState(0);
  const [totalInspeksi, setTotalInspeksi] = useState(0);
  const [totalMutasi, setTotalMutasi] = useState(0);
  const [recentMutasi, setRecentMutasi] = useState<Mutasi[]>([]);
  const [brokenAsets, setBrokenAsets] = useState<Aset[]>([]);
  const [companySummaries, setCompanySummaries] = useState<CompanySummary[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/aset").then((res) => res.json()),
      fetch("/api/inspeksi").then((res) => res.json()),
      fetch("/api/mutasi").then((res) => res.json()),
    ]).then(([asetData, inspeksiData, mutasiData]) => {
      if (Array.isArray(asetData)) {
        setTotalAset(asetData.length);

        const broken = asetData.filter((a: Aset) => {
          const k = (a.kondisi_terkini || "").toLowerCase().trim();
          return k !== "" && k !== "baik";
        });
        setBrokenAsets(broken.slice(0, 5));

        // Build per-company summary
        const companyMap: Record<string, CompanySummary> = {};
        for (const a of asetData as Aset[]) {
          const co = a.company_code || "(Tidak Ada Company)";
          if (!companyMap[co]) {
            companyMap[co] = { company: co, total: 0, baik: 0, bermasalah: 0, kondisiMap: {} };
          }
          companyMap[co].total++;
          const k = (a.kondisi_terkini || "baik").toLowerCase().trim() || "baik";
          companyMap[co].kondisiMap[k] = (companyMap[co].kondisiMap[k] || 0) + 1;
          if (k === "baik") companyMap[co].baik++;
          else companyMap[co].bermasalah++;
        }
        // Sort by total desc
        const sorted = Object.values(companyMap).sort((a, b) => b.total - a.total);
        setCompanySummaries(sorted);
      }

      if (Array.isArray(inspeksiData)) {
        setTotalInspeksi(inspeksiData.length);
      }

      if (Array.isArray(mutasiData)) {
        setTotalMutasi(mutasiData.length);
        const sorted = [...mutasiData].sort(
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
          <Link href="/dashboard/inspeksi" className="btn-nb bg-nb-green text-black px-6 py-3 text-lg no-underline flex-1 text-center">
            🔍 Inspeksi Baru
          </Link>
          <Link href="/dashboard/mutasi" className="btn-nb bg-nb-cyan text-black px-6 py-3 text-lg no-underline flex-1 text-center">
            🔄 Mutasi Pompa
          </Link>
          <Link href="/dashboard/aset" className="btn-nb bg-white text-black px-6 py-3 text-lg no-underline flex-1 text-center">
            ➕ Tambah Aset
          </Link>
        </div>
      </div>

      {/* Company Summary */}
      {companySummaries.length > 0 && (
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-nb-purple border-b-4 border-black p-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-black uppercase flex items-center gap-2">
              🏢 Ringkasan Per Company
            </h2>
            <span className="badge-nb bg-white text-black">{companySummaries.length} company</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">Company</th>
                  <th className="p-3 text-center text-sm font-black uppercase tracking-wider border-r-2 border-white/20">Total Pompa</th>
                  <th className="p-3 text-center text-sm font-black uppercase tracking-wider border-r-2 border-white/20">✅ Baik</th>
                  <th className="p-3 text-center text-sm font-black uppercase tracking-wider border-r-2 border-white/20">⚠️ Bermasalah</th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider">Distribusi Kondisi</th>
                </tr>
              </thead>
              <tbody>
                {companySummaries.map((cs, idx) => {
                  const pct = Math.round((cs.baik / cs.total) * 100);
                  return (
                    <tr
                      key={cs.company}
                      className={`border-t-2 border-black/10 hover:bg-nb-purple/10 transition-colors ${
                        idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      {/* Company */}
                      <td className="p-3 border-r-2 border-black/10">
                        <div className="font-black text-black dark:text-white text-base">{cs.company}</div>
                      </td>
                      {/* Total */}
                      <td className="p-3 text-center border-r-2 border-black/10">
                        <span className="badge-nb bg-nb-cyan text-black text-lg font-black">{cs.total}</span>
                      </td>
                      {/* Baik */}
                      <td className="p-3 text-center border-r-2 border-black/10">
                        <span className="font-black text-black dark:text-white">{cs.baik}</span>
                      </td>
                      {/* Bermasalah */}
                      <td className="p-3 text-center border-r-2 border-black/10">
                        {cs.bermasalah > 0
                          ? <span className="badge-nb bg-nb-red text-white font-black">{cs.bermasalah}</span>
                          : <span className="font-bold text-black/40 dark:text-white/40">—</span>
                        }
                      </td>
                      {/* Kondisi Bar */}
                      <td className="p-3">
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-4 bg-black/10 border-2 border-black overflow-hidden">
                            <div
                              className="h-full bg-nb-green transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-black dark:text-white w-10 text-right">{pct}%</span>
                        </div>
                        {/* Kondisi badges */}
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(cs.kondisiMap)
                            .sort(([, a], [, b]) => b - a)
                            .map(([k, count]) => {
                              const c = KONDISI_COLORS[k] || { bg: "bg-gray-300", text: "text-black" };
                              return (
                                <span
                                  key={k}
                                  className={`text-xs font-bold px-2 py-0.5 border-2 border-black ${c.bg} ${c.text}`}
                                >
                                  {k}: {count}
                                </span>
                              );
                            })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  <li key={idx} className="p-4 hover:bg-nb-pink/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black text-lg text-black dark:text-white">
                        {aset.asset_code}
                        {aset.asset_name && <div className="text-xs font-bold text-black/40">{aset.asset_name}</div>}
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
                <Link href="/dashboard/inspeksi" className="font-black text-black dark:text-white underline decoration-4 decoration-nb-red hover:bg-nb-red hover:text-white transition-colors">
                  Lihat Semua Inspeksi
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Mutasi */}
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
                  <li key={idx} className="p-4 hover:bg-nb-cyan/10 transition-colors flex items-center gap-4">
                    <div className="h-12 w-12 flex-shrink-0 border-4 border-black bg-nb-yellow flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      🚜
                    </div>
                    <div>
                      <div className="font-black text-black dark:text-white text-base leading-tight">{m.asset_code}</div>
                      {m.asset_name && (
                        <div className="text-xs font-bold text-black/40 dark:text-white/40 mt-0.5 tracking-wide">{m.asset_name}</div>
                      )}
                      <div className="text-xs font-bold text-black/60 dark:text-white/60 mt-1">
                        → <span className="font-black">{m.estate_tujuan}</span>
                      </div>
                      <div className="text-xs font-bold text-black/40 dark:text-white/40 mt-0.5">
                        {new Date(m.tgl_pindah).toLocaleDateString("en-GB")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {recentMutasi.length > 0 && (
              <div className="p-4 border-t-4 border-black bg-gray-50 dark:bg-gray-800 text-center">
                <Link href="/dashboard/mutasi" className="font-black text-black dark:text-white underline decoration-4 decoration-nb-cyan hover:bg-nb-cyan hover:text-white transition-colors">
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
