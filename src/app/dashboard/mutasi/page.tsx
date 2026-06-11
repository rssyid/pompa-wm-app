"use client";

import { useEffect, useState, useCallback } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { Pagination } from "@/components";
import * as XLSX from "xlsx";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface MutasiRiwayat {
  id_mutasi: number;
  asset_code: string;
  asset_name: string;
  estate_tujuan: string;
  estate_name: string;
  block_tujuan: string | null;
  tgl_pindah: string;
  pic_name: string | null;
}

interface AsetPompa {
  asset_code: string;
  asset_name: string;
  est_code_deployed: string | null;
}

interface Estate {
  estate_code: string;
  estate_name: string;
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function MutasiPage() {
  const [riwayatList, setRiwayatList] = useState<MutasiRiwayat[]>([]);
  const [asetList, setAsetList] = useState<AsetPompa[]>([]);
  const [estateList, setEstateList] = useState<Estate[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingMutasiId, setEditingMutasiId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    asset_code: "",
    estate_tujuan: "",
    block_tujuan: "",
    tgl_pindah: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });

  // Filters state
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterAsset, setFilterAsset] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ---- Fetch Data ---- */
  const fetchRiwayat = useCallback(async () => {
    try {
      const res = await fetch("/api/mutasi");
      const data = await res.json();
      if (res.ok) setRiwayatList(data);
      else setError(data.error);
    } catch {
      setError("Gagal memuat riwayat mutasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  // Fetch dropdown data saat form dibuka
  useEffect(() => {
    if (!showForm) return;
    Promise.all([
      fetch("/api/aset").then((r) => r.json()),
      fetch("/api/estate").then((r) => r.json()),
    ]).then(([aset, estate]) => {
      if (Array.isArray(aset)) setAsetList(aset);
      if (Array.isArray(estate)) setEstateList(estate);
    });
  }, [showForm]);

  /* ---- Handle Submit ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const isEdit = editingMutasiId !== null;
      const res = await fetch("/api/mutasi", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_mutasi: editingMutasiId,
          block_tujuan: form.block_tujuan || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(isEdit ? `Berhasil mengupdate mutasi aset.` : `Berhasil! Aset dipindahkan ke ${form.estate_tujuan}.`);
        setForm({
          asset_code: "",
          estate_tujuan: "",
          block_tujuan: "",
          tgl_pindah: new Date().toISOString().split('T')[0],
        });
        setEditingMutasiId(null);
        setShowForm(false);
        fetchRiwayat();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || `Gagal ${isEdit ? 'mengupdate' : 'melakukan'} mutasi.`);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (m: MutasiRiwayat) => {
    setEditingMutasiId(m.id_mutasi);
    setForm({
      asset_code: m.asset_code,
      estate_tujuan: m.estate_tujuan,
      block_tujuan: m.block_tujuan || "",
      tgl_pindah: new Date(m.tgl_pindah).toISOString().split('T')[0],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---- Derived Data (Filters & Export) ---- */
  const filteredList = riwayatList.filter(m => {
    const d = new Date(m.tgl_pindah);
    const passStart = filterStartDate ? d >= new Date(filterStartDate) : true;
    const passEnd = filterEndDate ? d <= new Date(filterEndDate) : true;
    const passAsset = filterAsset ? m.asset_code === filterAsset : true;
    return passStart && passEnd && passAsset;
  });

  const paginatedList = pageSize === 0 
    ? filteredList 
    : filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredList.map(m => ({
      "Tanggal Pindah": new Date(m.tgl_pindah).toLocaleDateString('en-GB'),
      "Kode Aset": m.asset_code,
      "Nama Aset": m.asset_name,
      "Tujuan Estate": m.estate_name,
      "Kode Estate Tujuan": m.estate_tujuan,
      "Detail Blok / Lokasi": m.block_tujuan || "-",
      "User PIC": m.pic_name || "-",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mutasi");
    XLSX.writeFile(wb, "Data_Mutasi_Pompa.xlsx");
  };

  // Generate unique assets for filter
  const uniqueAssets = Array.from(new Set(riwayatList.map(r => r.asset_code))).map(code => {
    const r = riwayatList.find(x => x.asset_code === code);
    return { value: code, label: `${code} — ${r?.asset_name}` };
  });

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
            Mutasi Pompa
          </h1>
          <div className="h-2 bg-nb-pink border-2 border-black mt-2 w-48" />
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingMutasiId(null);
              setForm({
                asset_code: "", estate_tujuan: "", block_tujuan: "", tgl_pindah: new Date().toISOString().split('T')[0]
              });
            } else {
              setShowForm(true);
            }
          }}
          className="btn-nb bg-nb-yellow text-black px-6 py-3 text-lg flex items-center gap-2"
        >
          {showForm ? "✕ Tutup Form" : "🔄 Buat Mutasi Baru"}
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="border-4 border-black bg-nb-green p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <span className="font-bold text-black">✅ {successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            className="font-black text-black text-xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="border-4 border-black bg-nb-red p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <span className="font-bold text-black">❌ {error}</span>
          <button
            onClick={() => setError(null)}
            className="font-black text-black text-xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============ MUTASI FORM ============ */}
      {showForm && (
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden">
          <div className={`${editingMutasiId ? 'bg-nb-yellow' : 'bg-nb-pink'} border-b-4 border-black p-4`}>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              {editingMutasiId ? "✏️ Edit Mutasi Lokasi" : "🔄 Form Pindah / Mutasi Lokasi"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Pilih Aset Pompa *
                </label>
                <SearchableSelect
                  name="asset_code"
                  value={form.asset_code}
                  onChange={(val) => setForm({ ...form, asset_code: val })}
                  options={asetList.map(a => ({ value: a.asset_code, label: `${a.asset_code} — ${a.asset_name} (Saat ini di: ${a.est_code_deployed || 'Belum Ditempatkan'})` }))}
                  placeholder="-- Pilih Pompa --"
                  disabled={editingMutasiId !== null}
                />
                {editingMutasiId && <p className="text-xs font-bold text-nb-red mt-1">Aset tidak bisa diubah pada mode edit.</p>}
              </div>

              {/* Destination Estate */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Tujuan Estate *
                </label>
                <SearchableSelect
                  name="estate_tujuan"
                  value={form.estate_tujuan}
                  onChange={(val) => setForm({ ...form, estate_tujuan: val })}
                  options={estateList.map(e => ({ value: e.estate_code, label: `${e.estate_code} — ${e.estate_name}` }))}
                  placeholder="-- Pilih Estate Tujuan --"
                />
              </div>

              {/* Block/Location Detail */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Blok / Detail Lokasi Tujuan
                </label>
                <input
                  name="block_tujuan"
                  value={form.block_tujuan}
                  onChange={handleChange}
                  placeholder="Contoh: Blok A / Stasiun 2"
                  className="input-nb w-full"
                />
              </div>

              {/* Transfer Date */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Tanggal Pemindahan *
                </label>
                <input
                  type="date"
                  name="tgl_pindah"
                  value={form.tgl_pindah}
                  onChange={handleChange}
                  required
                  className="input-nb w-full"
                />
              </div>
            </div>

            <div className="mt-4 p-4 border-4 border-black bg-nb-yellow/30 font-bold text-black dark:text-white text-sm">
              ℹ️ Mengirim form ini akan mencatat riwayat pemindahan DAN secara otomatis memperbarui lokasi terkini pompa di database Master Aset.
            </div>

            {/* Submit */}
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-nb bg-nb-green text-black px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "⏳ Menyimpan..." : (editingMutasiId ? "💾 Update Mutasi" : "💾 Eksekusi Mutasi")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMutasiId(null);
                  setForm({
                    asset_code: "", estate_tujuan: "", block_tujuan: "", tgl_pindah: new Date().toISOString().split('T')[0]
                  });
                }}
                className="btn-nb bg-white text-black px-8 py-3 text-lg"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Export Section */}
      <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 p-4 flex flex-col md:flex-row gap-4 justify-between items-end">
        <div className="flex flex-wrap gap-4 flex-1">
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Mulai Tanggal</label>
            <input type="date" value={filterStartDate} onChange={e => { setFilterStartDate(e.target.value); setCurrentPage(1); }} className="input-nb py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Sampai Tanggal</label>
            <input type="date" value={filterEndDate} onChange={e => { setFilterEndDate(e.target.value); setCurrentPage(1); }} className="input-nb py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Filter Aset Pompa</label>
            <div className="w-56">
              <SearchableSelect
                value={filterAsset}
                onChange={val => { setFilterAsset(val); setCurrentPage(1); }}
                options={[{value: "", label: "Semua Aset"}, ...uniqueAssets]}
                placeholder="Semua Aset"
              />
            </div>
          </div>
        </div>
        <button onClick={handleExportExcel} className="btn-nb bg-nb-green text-black px-6 py-2 flex items-center justify-center gap-2 h-12 w-full md:w-auto">
          📥 Export Excel
        </button>
      </div>

      {/* ============ DATA TABLE ============ */}
      <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-black border-b-4 border-black p-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            📜 Riwayat Mutasi
          </h2>
          <span className="badge-nb bg-white text-black">
            {filteredList.length} data
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block border-4 border-black bg-nb-yellow p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              <p className="text-xl font-black text-black">⏳ Memuat riwayat...</p>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block border-4 border-black bg-nb-cyan p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-xl font-black text-black">
                {riwayatList.length === 0 ? "Belum ada riwayat mutasi aset." : "Tidak ada mutasi yang cocok dengan filter."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-nb-yellow text-black border-b-4 border-black">
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-4 border-black">
                    Tgl Pindah
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-4 border-black">
                    Aset Pompa
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-4 border-black">
                    Tujuan Estate
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-4 border-black">
                    Blok Detail
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-4 border-black">
                    PIC (User)
                  </th>
                  <th className="p-3 text-center text-sm font-black uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((m, idx) => (
                  <tr
                    key={m.id_mutasi}
                    className={`border-b-4 border-black transition-colors duration-100 hover:bg-nb-pink/20 ${
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <td className="p-3 font-black text-black dark:text-white border-r-4 border-black whitespace-nowrap">
                      {new Date(m.tgl_pindah).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3 border-r-4 border-black">
                      <div className="font-black text-black dark:text-white text-base leading-tight">{m.asset_name}</div>
                      {m.asset_code && (
                        <div className="text-xs font-bold text-black/40 dark:text-white/40 mt-0.5 tracking-wide">{m.asset_code}</div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white border-r-4 border-black">
                      {m.estate_name} <span className="text-xs opacity-70">({m.estate_tujuan})</span>
                    </td>
                    <td className="p-3 text-black/70 dark:text-white/70 font-bold border-r-4 border-black">
                      {m.block_tujuan || "—"}
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white border-r-4 border-black">
                      {m.pic_name || "—"}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleEdit(m)} className="btn-nb bg-nb-yellow text-black px-3 py-1 text-xs">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredList.length > 0 && (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredList.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}
