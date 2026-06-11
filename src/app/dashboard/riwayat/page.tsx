"use client";

import { useEffect, useState, useCallback } from "react";
import SearchableSelect from "@/components/SearchableSelect";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface AsetOption {
  asset_code: string;
  asset_name: string;
  kondisi_terkini: string;
}

interface AsetInfo {
  asset_code: string;
  asset_name: string;
  kondisi_terkini: string;
  tahun_perolehan: number | null;
  jenis_pompa: string;
  merek: string;
  estate_asal: string;
  estate_deployed_name: string;
  block_deployed: string | null;
}

interface EventMutasi {
  type: "mutasi";
  tanggal: string;
  id: string;
  estate_tujuan_name: string;
  estate_tujuan: string;
  block_tujuan: string | null;
  pic_name: string | null;
  catatan: string | null;
}

interface IssueItem {
  id_issue: number;
  nama_kerusakan: string;
  kategori: string | null;
}

interface EventInspeksi {
  type: "inspeksi";
  tanggal: string;
  id: string;
  estate_name: string;
  block: string | null;
  inspektur_name: string | null;
  catatan: string | null;
  issues_opened: IssueItem[];
  issues_solved: IssueItem[];
  subtype: "kerusakan" | "selesai" | "normal";
}

type TimelineEvent = EventMutasi | EventInspeksi;

const KONDISI_COLORS: Record<string, string> = {
  baik: "bg-nb-green",
  "rusak ringan": "bg-nb-orange",
  "rusak berat": "bg-nb-red",
  "tidak beroperasi": "bg-gray-400",
  "dalam perbaikan": "bg-nb-cyan",
};

/* ------------------------------------------------------------------ */
/*  Helper: format tanggal                                             */
/* ------------------------------------------------------------------ */
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Event Card Component                                               */
/* ------------------------------------------------------------------ */
function EventCard({ event, side }: { event: TimelineEvent; side: "left" | "right" }) {
  if (event.type === "mutasi") {
    return (
      <div className="border-4 border-black bg-nb-pink shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔄</span>
          <span className="badge-nb bg-black text-white text-xs font-black">MUTASI</span>
          <span className="text-xs font-black text-black/60 ml-auto">{formatDate(event.tanggal)}</span>
        </div>
        <div className="font-black text-black text-base">
          Dipindah ke {event.estate_tujuan_name}
        </div>
        {event.block_tujuan && (
          <div className="text-sm font-bold text-black/70 mt-1">📍 Blok: {event.block_tujuan}</div>
        )}
        {event.pic_name && (
          <div className="text-sm font-bold text-black/70">👤 PIC: {event.pic_name}</div>
        )}
        {event.catatan && (
          <div className="mt-2 text-sm italic border-l-4 border-black pl-2 text-black/70">
            &ldquo;{event.catatan}&rdquo;
          </div>
        )}
      </div>
    );
  }

  // Inspeksi events
  const cardColors: Record<string, string> = {
    kerusakan: "bg-nb-red",
    selesai: "bg-nb-green",
    normal: "bg-nb-cyan",
  };
  const icons: Record<string, string> = {
    kerusakan: "🚨",
    selesai: "✅",
    normal: "🔍",
  };
  const labels: Record<string, string> = {
    kerusakan: "KERUSAKAN BARU",
    selesai: "MASALAH SELESAI",
    normal: "INSPEKSI NORMAL",
  };
  const badgeColors: Record<string, string> = {
    kerusakan: "bg-nb-red text-white",
    selesai: "bg-nb-green text-black",
    normal: "bg-nb-cyan text-black",
  };

  return (
    <div className={`border-4 border-black ${cardColors[event.subtype]} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xl">{icons[event.subtype]}</span>
        <span className={`badge-nb text-xs font-black ${badgeColors[event.subtype]}`}>
          {labels[event.subtype]}
        </span>
        <span className="text-xs font-black text-black/60 ml-auto">{formatDate(event.tanggal)}</span>
      </div>
      {event.subtype === "normal" && (
        <div className="font-black text-black text-base">Kondisi Normal / Baik</div>
      )}
      {event.issues_opened.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-black text-black/70 uppercase mb-1">Kerusakan Ditemukan:</div>
          <div className="flex flex-wrap gap-1">
            {event.issues_opened.map((iss) => (
              <span key={iss.id_issue} className="px-2 py-0.5 bg-black text-white text-xs font-black border-2 border-black">
                {iss.nama_kerusakan}
              </span>
            ))}
          </div>
        </div>
      )}
      {event.issues_solved.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-black text-black/70 uppercase mb-1">Diselesaikan:</div>
          <div className="flex flex-wrap gap-1">
            {event.issues_solved.map((iss) => (
              <span key={iss.id_issue} className="px-2 py-0.5 bg-white text-black text-xs font-black border-2 border-black line-through">
                {iss.nama_kerusakan}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-4 mt-2 flex-wrap">
        {event.estate_name && (
          <div className="text-sm font-bold text-black/70">📍 {event.estate_name}{event.block ? ` — ${event.block}` : ""}</div>
        )}
        {event.inspektur_name && (
          <div className="text-sm font-bold text-black/70">👤 {event.inspektur_name}</div>
        )}
      </div>
      {event.catatan && (
        <div className="mt-2 text-sm italic border-l-4 border-black pl-2 text-black/70">
          &ldquo;{event.catatan}&rdquo;
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function RiwayatPage() {
  const [asetOptions, setAsetOptions] = useState<AsetOption[]>([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [asetInfo, setAsetInfo] = useState<AsetInfo | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch daftar aset untuk dropdown
  useEffect(() => {
    fetch("/api/aset")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAsetOptions(data);
      });
  }, []);

  // Fetch timeline saat asset dipilih
  const fetchTimeline = useCallback(async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    setAsetInfo(null);
    setEvents([]);
    try {
      const res = await fetch(`/api/riwayat-pompa?asset_code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memuat data.");
      } else {
        setAsetInfo(data.aset);
        setEvents(data.events);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (val: string) => {
    setSelectedCode(val);
    fetchTimeline(val);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
          📋 Riwayat Pompa
        </h1>
        <div className="h-2 bg-nb-orange border-2 border-black mt-2 w-48" />
        <p className="mt-3 font-bold text-black/70 dark:text-white/70">
          Pilih aset pompa untuk melihat seluruh riwayat mutasi dan inspeksinya secara kronologis.
        </p>
      </div>

      {/* Selector */}
      <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
        <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
          🔎 Pilih Aset Pompa
        </label>
        <div className="max-w-md">
          <SearchableSelect
            value={selectedCode}
            onChange={handleSelect}
            options={[
              { value: "", label: "-- Pilih Pompa --" },
              ...asetOptions.map((a) => ({
                value: a.asset_code,
                label: `${a.asset_name} (${a.asset_code})`,
              })),
            ]}
            placeholder="Cari nama atau kode pompa..."
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-4 border-black bg-nb-red p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="font-bold text-white">❌ {error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block border-4 border-black bg-nb-yellow p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            <p className="text-xl font-black text-black">⏳ Memuat riwayat...</p>
          </div>
        </div>
      )}

      {/* Info Bar Aset Terpilih */}
      {asetInfo && !loading && (
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden">
          <div className="bg-black p-4 border-b-4 border-black">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xl font-black text-white leading-tight">{asetInfo.asset_name}</div>
                <div className="text-sm font-bold text-white/50 tracking-wide">{asetInfo.asset_code}</div>
              </div>
              <span className={`badge-nb text-black text-sm ${KONDISI_COLORS[asetInfo.kondisi_terkini] || "bg-gray-300"}`}>
                🔧 {asetInfo.kondisi_terkini}
              </span>
            </div>
          </div>
          <div className="p-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="badge-nb bg-nb-cyan text-black text-xs">⚙️ {asetInfo.jenis_pompa || "—"} {asetInfo.merek ? `· ${asetInfo.merek}` : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-nb bg-nb-yellow text-black text-xs">
                📍 {asetInfo.estate_deployed_name || asetInfo.estate_asal}
                {asetInfo.block_deployed ? ` — Blok ${asetInfo.block_deployed}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-nb bg-nb-purple text-black text-xs">📅 {events.length} Event Tercatat</span>
            </div>
            {asetInfo.tahun_perolehan && (
              <div className="flex items-center gap-2">
                <span className="badge-nb bg-white text-black text-xs border-2 border-black">🗓️ Tahun {asetInfo.tahun_perolehan}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {asetInfo && !loading && events.length === 0 && (
        <div className="border-4 border-black bg-nb-yellow p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-xl font-black text-black">Belum ada riwayat untuk pompa ini.</p>
          <p className="text-sm font-bold text-black/70 mt-2">Mulai dengan menambahkan inspeksi atau mutasi.</p>
        </div>
      )}

      {/* Timeline */}
      {asetInfo && !loading && events.length > 0 && (
        <div className="relative">
          {/* Garis tengah (desktop) — mulai sedikit dari atas agar tidak menutupi card pertama */}
          <div className="hidden md:block absolute left-1/2 top-6 bottom-8 w-1 bg-black -translate-x-1/2 z-0" />

          <div className="flex flex-col gap-0">
            {events.map((event, idx) => {
              const isLeft = idx % 2 === 0;
              const dateStr = formatDate(event.tanggal);

              return (
                <div key={event.id} className="relative flex items-start md:gap-0 gap-4 mb-8">
                  {/* ---- DESKTOP layout (zigzag) ---- */}
                  {/* Left side */}
                  <div className={`hidden md:flex w-1/2 relative z-10 ${isLeft ? "pr-10 justify-end" : "pr-0 justify-end opacity-0 pointer-events-none"}`}>
                    {isLeft && <div className="w-full max-w-sm"><EventCard event={event} side="left" /></div>}
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-20 flex-col items-center">
                    <div className={`w-5 h-5 border-4 border-black rounded-full mt-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      event.type === "mutasi" ? "bg-nb-pink" :
                      (event as EventInspeksi).subtype === "kerusakan" ? "bg-nb-red" :
                      (event as EventInspeksi).subtype === "selesai" ? "bg-nb-green" : "bg-nb-cyan"
                    }`} />
                  </div>

                  {/* Right side */}
                  <div className={`hidden md:flex w-1/2 relative z-10 ${!isLeft ? "pl-10 justify-start" : "pl-0 opacity-0 pointer-events-none"}`}>
                    {!isLeft && <div className="w-full max-w-sm"><EventCard event={event} side="right" /></div>}
                  </div>

                  {/* ---- MOBILE layout (straight) ---- */}
                  <div className="md:hidden flex gap-4 w-full">
                    {/* Mobile dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-4 h-4 border-4 border-black rounded-full mt-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        event.type === "mutasi" ? "bg-nb-pink" :
                        (event as EventInspeksi).subtype === "kerusakan" ? "bg-nb-red" :
                        (event as EventInspeksi).subtype === "selesai" ? "bg-nb-green" : "bg-nb-cyan"
                      }`} />
                      {idx < events.length - 1 && <div className="w-0.5 bg-black flex-1 mt-1 min-h-[2rem]" />}
                    </div>
                    {/* Mobile card */}
                    <div className="flex-1 pb-2">
                      <EventCard event={event} side="left" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* End of timeline */}
          <div className="flex justify-center mt-4">
            <div className="border-4 border-black bg-nb-yellow px-6 py-3 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm uppercase tracking-wider">
              🏁 Awal Riwayat
            </div>
          </div>
        </div>
      )}

      {/* Empty initial state */}
      {!selectedCode && !loading && (
        <div className="border-4 border-black border-dashed p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-xl font-black text-black dark:text-white">Pilih aset pompa di atas</p>
          <p className="text-sm font-bold text-black/50 dark:text-white/50 mt-2">untuk melihat timeline riwayatnya</p>
        </div>
      )}
    </div>
  );
}
