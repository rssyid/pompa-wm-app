"use client";

import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import SearchableSelect from "@/components/SearchableSelect";
import { Pagination } from "@/components";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface AsetPompa {
  asset_code: string;
  asset_name: string;
  id_tipe: number;
  est_code: string;
  est_code_deployed: string | null;
  tahun_perolehan: number | null;
  kondisi_terkini: string;
  jenis_pompa: string;
  merek: string;
  mesin_penggerak: string;
  debit_m3_jam: number | null;
  hp_mesin: number | null;
  estate_name: string;
  company_code: string | null;
  estate_deployed_name: string | null;
  block_deployed: string | null;
}

interface TipePompa {
  id_tipe: number;
  jenis_pompa: string;
  merek: string;
}

interface Estate {
  estate_code: string;
  estate_name: string;
}

const KONDISI_OPTIONS = [
  "baik",
  "rusak ringan",
  "rusak berat",
  "tidak beroperasi",
  "dalam perbaikan",
];

const KONDISI_COLORS: Record<string, string> = {
  baik: "bg-nb-green",
  "rusak ringan": "bg-nb-orange",
  "rusak berat": "bg-nb-red",
  "tidak beroperasi": "bg-gray-400",
  "dalam perbaikan": "bg-nb-cyan",
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function AsetPage() {
  const [asetList, setAsetList] = useState<AsetPompa[]>([]);
  const [tipePompaList, setTipePompaList] = useState<TipePompa[]>([]);
  const [estateList, setEstateList] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingAssetCode, setEditingAssetCode] = useState<string | null>(null);

  // Filters state
  const [filterCompany, setFilterCompany] = useState("");
  const [filterEstate, setFilterEstate] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterMerek, setFilterMerek] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [form, setForm] = useState({
    asset_code: "",
    asset_name: "",
    id_tipe: "",
    est_code: "",
    est_code_deployed: "",
    tahun_perolehan: "",
    kondisi_terkini: "baik",
  });

  /* ---- Fetch Data ---- */
  const fetchAset = useCallback(async () => {
    try {
      const res = await fetch("/api/aset");
      const data = await res.json();
      if (res.ok) setAsetList(data);
      else setError(data.error);
    } catch {
      setError("Gagal memuat data aset.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAset();
  }, [fetchAset]);

  // Fetch dropdown data saat form dibuka atau untuk filter
  useEffect(() => {
    Promise.all([
      fetch("/api/tipe-pompa").then((r) => r.json()),
      fetch("/api/estate").then((r) => r.json()),
    ]).then(([tipe, estate]) => {
      if (Array.isArray(tipe)) setTipePompaList(tipe);
      if (Array.isArray(estate)) setEstateList(estate);
    });
  }, []);

  /* ---- Handlers ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const isEdit = editingAssetCode !== null;
      const res = await fetch("/api/aset", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_tipe: Number(form.id_tipe),
          tahun_perolehan: form.tahun_perolehan
            ? Number(form.tahun_perolehan)
            : null,
          est_code_deployed: isEdit ? undefined : (form.est_code_deployed || null),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Aset "${data.asset_name}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        setForm({
          asset_code: "",
          asset_name: "",
          id_tipe: "",
          est_code: "",
          est_code_deployed: "",
          tahun_perolehan: "",
          kondisi_terkini: "baik",
        });
        setEditingAssetCode(null);
        setShowForm(false);
        fetchAset();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} aset.`);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (a: AsetPompa) => {
    setEditingAssetCode(a.asset_code);
    setForm({
      asset_code: a.asset_code,
      asset_name: a.asset_name,
      id_tipe: String(a.id_tipe),
      est_code: a.est_code,
      est_code_deployed: a.est_code_deployed || "",
      tahun_perolehan: a.tahun_perolehan ? String(a.tahun_perolehan) : "",
      kondisi_terkini: a.kondisi_terkini,
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
  const uniqueJenis = Array.from(new Set(asetList.map(a => a.jenis_pompa).filter(Boolean)));
  const uniqueMerek = Array.from(new Set(asetList.map(a => a.merek).filter(Boolean)));
  const uniqueCompany = Array.from(new Set(asetList.map(a => a.company_code).filter(Boolean))) as string[];

  const filteredList = asetList.filter(a => {
    return (
      (filterCompany === "" || a.company_code === filterCompany) &&
      (filterEstate === "" || a.est_code === filterEstate || a.est_code_deployed === filterEstate) &&
      (filterJenis === "" || a.jenis_pompa === filterJenis) &&
      (filterMerek === "" || a.merek === filterMerek)
    );
  });

  const paginatedList = pageSize === 0 
    ? filteredList 
    : filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredList.map(a => ({
      "Kode Aset": a.asset_code,
      "Nama Aset": a.asset_name,
      "Jenis Pompa": a.jenis_pompa || "-",
      "Merek": a.merek || "-",
      "Estate Pemilik": a.estate_name || a.est_code,
      "Estate Penempatan": a.estate_deployed_name || a.est_code_deployed || "-",
      "Blok Penempatan": a.block_deployed || "-",
      "Tahun Perolehan": a.tahun_perolehan || "-",
      "Kondisi Terkini": a.kondisi_terkini,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Aset");
    XLSX.writeFile(wb, "Data_Aset_Pompa.xlsx");
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
            Aset Pompa
          </h1>
          <div className="h-2 bg-nb-cyan border-2 border-black mt-2 w-48" />
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingAssetCode(null);
              setForm({
                asset_code: "", asset_name: "", id_tipe: "", est_code: "", est_code_deployed: "", tahun_perolehan: "", kondisi_terkini: "baik"
              });
            } else {
              setShowForm(true);
            }
          }}
          className="btn-nb bg-nb-yellow text-black px-6 py-3 text-lg flex items-center gap-2"
        >
          {showForm ? "✕ Tutup Form" : "＋ Tambah Aset Baru"}
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

      {/* ============ ADD FORM ============ */}
      {showForm && (
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden">
          <div className={`${editingAssetCode ? 'bg-nb-yellow' : 'bg-nb-purple'} border-b-4 border-black p-4`}>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              {editingAssetCode ? "✏️ Form Edit Aset" : "📝 Form Tambah Aset Baru"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Asset Code */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Kode Aset *
                </label>
                <input
                  name="asset_code"
                  value={form.asset_code}
                  onChange={handleChange}
                  required
                  disabled={editingAssetCode !== null}
                  placeholder="Contoh: PMP-001"
                  className="input-nb w-full disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
                {editingAssetCode && <p className="text-xs font-bold text-nb-red mt-1">Kode aset tidak bisa diubah.</p>}
              </div>

              {/* Asset Name */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Nama Aset *
                </label>
                <input
                  name="asset_name"
                  value={form.asset_name}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Pompa Irigasi A1"
                  className="input-nb w-full"
                />
              </div>

              {/* Tipe Pompa */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Tipe Pompa *
                </label>
                <SearchableSelect
                  name="id_tipe"
                  value={form.id_tipe}
                  onChange={(val) => setForm({ ...form, id_tipe: val })}
                  options={tipePompaList.map((t) => ({ value: String(t.id_tipe), label: `${t.jenis_pompa} — ${t.merek}` }))}
                  placeholder="-- Pilih Tipe --"
                />
              </div>

              {/* Estate (Pemilik) */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Estate Pemilik *
                </label>
                <SearchableSelect
                  name="est_code"
                  value={form.est_code}
                  onChange={(val) => setForm({ ...form, est_code: val })}
                  options={estateList.map((e) => ({ value: e.estate_code, label: `${e.estate_code} — ${e.estate_name}` }))}
                  placeholder="-- Pilih Estate --"
                />
              </div>

              {/* Estate Deployed */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Estate Penempatan
                </label>
                <SearchableSelect
                  name="est_code_deployed"
                  value={form.est_code_deployed}
                  onChange={(val) => setForm({ ...form, est_code_deployed: val })}
                  options={[
                    { value: "", label: "-- Sama dengan pemilik --" },
                    ...estateList.map((e) => ({ value: e.estate_code, label: `${e.estate_code} — ${e.estate_name}` }))
                  ]}
                  placeholder="-- Sama dengan pemilik --"
                  disabled={editingAssetCode !== null}
                />
                {editingAssetCode && <p className="text-xs font-bold text-gray-500 mt-1">Diubah via Mutasi.</p>}
              </div>

              {/* Tahun Perolehan */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Tahun Perolehan
                </label>
                <input
                  name="tahun_perolehan"
                  type="number"
                  min="1990"
                  max="2099"
                  value={form.tahun_perolehan}
                  onChange={handleChange}
                  placeholder="Contoh: 2023"
                  className="input-nb w-full"
                />
              </div>

              {/* Kondisi */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase tracking-wider">
                  Kondisi Terkini
                </label>
                <SearchableSelect
                  name="kondisi_terkini"
                  value={form.kondisi_terkini}
                  onChange={(val) => setForm({ ...form, kondisi_terkini: val })}
                  options={KONDISI_OPTIONS.map((k) => ({ value: k, label: k.charAt(0).toUpperCase() + k.slice(1) }))}
                  disabled={editingAssetCode !== null}
                />
                {editingAssetCode && <p className="text-xs font-bold text-gray-500 mt-1">Diubah via Inspeksi.</p>}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-nb bg-nb-green text-black px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "⏳ Menyimpan..." : (editingAssetCode ? "💾 Update Aset" : "💾 Simpan Aset")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAssetCode(null);
                  setForm({
                    asset_code: "", asset_name: "", id_tipe: "", est_code: "", est_code_deployed: "", tahun_perolehan: "", kondisi_terkini: "baik"
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
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Filter Company</label>
            <div className="w-40">
              <SearchableSelect
                value={filterCompany}
                onChange={(val) => { setFilterCompany(val); setFilterEstate(""); setCurrentPage(1); }}
                options={[{ value: "", label: "Semua Company" }, ...uniqueCompany.map((c) => ({ value: c, label: c }))]}
                placeholder="Semua Company"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Filter Estate</label>
            <div className="w-48">
              <SearchableSelect
                value={filterEstate}
                onChange={(val) => { setFilterEstate(val); setCurrentPage(1); }}
                options={[{ value: "", label: "Semua Estate" }, ...estateList.filter(e => filterCompany === "" || (asetList.find(a => a.est_code === e.estate_code)?.company_code === filterCompany)).map((e) => ({ value: e.estate_code, label: e.estate_name }))]}
                placeholder="Semua Estate"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Filter Jenis</label>
            <div className="w-48">
              <SearchableSelect
                value={filterJenis}
                onChange={(val) => { setFilterJenis(val); setCurrentPage(1); }}
                options={[{ value: "", label: "Semua Jenis" }, ...uniqueJenis.map((j) => ({ value: j, label: j }))]}
                placeholder="Semua Jenis"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Filter Merek</label>
            <div className="w-48">
              <SearchableSelect
                value={filterMerek}
                onChange={(val) => { setFilterMerek(val); setCurrentPage(1); }}
                options={[{ value: "", label: "Semua Merek" }, ...uniqueMerek.map((m) => ({ value: m, label: m }))]}
                placeholder="Semua Merek"
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
        <div className="bg-nb-cyan border-b-4 border-black p-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-black uppercase tracking-wide">
            📋 Daftar Aset Pompa
          </h2>
          <span className="badge-nb bg-white text-black">
            {filteredList.length} data
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block border-4 border-black bg-nb-yellow p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              <p className="text-xl font-black text-black">⏳ Memuat data...</p>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block border-4 border-black bg-nb-pink p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-4xl mb-3">🔧</p>
              <p className="text-xl font-black text-black">
                {asetList.length === 0 ? "Belum ada data aset." : "Tidak ada aset yang cocok dengan filter."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    #
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Aset Pompa
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Jenis Pompa
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Merek
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Company
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Estate
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Penempatan
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Tahun
                  </th>
                  <th className="p-3 text-left text-sm font-black uppercase tracking-wider border-r-2 border-white/20">
                    Kondisi
                  </th>
                  <th className="p-3 text-center text-sm font-black uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((a, idx) => (
                  <tr
                    key={a.asset_code}
                    className={`border-t-3 border-black transition-colors duration-100 hover:bg-nb-yellow/30 ${
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <td className="p-3 font-black text-black dark:text-white border-r-2 border-black/10">
                      {idx + 1}
                    </td>
                    <td className="p-3 border-r-2 border-black/10">
                      <div className="font-black text-black dark:text-white text-base leading-tight">{a.asset_code}</div>
                      {a.asset_name && (
                        <div className="text-xs font-bold text-black/40 dark:text-white/40 mt-0.5 tracking-wide">{a.asset_name}</div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white border-r-2 border-black/10">
                      {a.jenis_pompa || "-"}
                    </td>
                    <td className="p-3 text-black/70 dark:text-white/70 font-bold border-r-2 border-black/10">
                      {a.merek || "-"}
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white border-r-2 border-black/10">
                      {a.company_code || "—"}
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white border-r-2 border-black/10">
                      {a.estate_name || a.est_code}
                    </td>
                    <td className="p-3 text-black/70 dark:text-white/70 font-bold border-r-2 border-black/10">
                      {a.estate_deployed_name || a.est_code_deployed || "—"}
                      {a.block_deployed && (
                        <div className="text-xs text-black/50 dark:text-white/50">
                          {a.block_deployed}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white border-r-2 border-black/10">
                      {a.tahun_perolehan || "-"}
                    </td>
                    <td className="p-3 border-r-2 border-black/10">
                      <span
                        className={`badge-nb text-black text-xs ${
                          KONDISI_COLORS[a.kondisi_terkini] || "bg-gray-300"
                        }`}
                      >
                        {a.kondisi_terkini}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleEdit(a)} className="btn-nb bg-nb-yellow text-black px-3 py-1 text-xs">
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
