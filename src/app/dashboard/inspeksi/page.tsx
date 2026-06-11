"use client";

import { useEffect, useState, useCallback } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { Pagination } from "@/components";
import * as XLSX from "xlsx";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface InspeksiRiwayat {
  id_inspeksi: number;
  asset_code: string;
  asset_name: string;
  tgl_inspeksi: string;
  estate_code: string;
  estate_name: string;
  company_code: string | null;
  block: string | null;
  catatan: string | null;
  inspektur_name: string | null;
  issues_opened: { id_issue: number, id_kerusakan: number, nama_kerusakan: string }[];
  issues_solved: { id_issue: number, id_kerusakan: number, nama_kerusakan: string }[];
}

interface AsetPompa {
  asset_code: string;
  asset_name: string;
}

interface Estate {
  estate_code: string;
  estate_name: string;
}

interface JenisKerusakan {
  id_kerusakan: number;
  nama_kerusakan: string;
  kategori: string | null;
}

interface OpenIssue {
  id_issue: number;
  id_kerusakan: number;
  nama_kerusakan: string;
  status: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function InspeksiPage() {
  const [riwayatList, setRiwayatList] = useState<InspeksiRiwayat[]>([]);
  const [asetList, setAsetList] = useState<AsetPompa[]>([]);
  const [estateList, setEstateList] = useState<Estate[]>([]);
  const [kerusakanList, setKerusakanList] = useState<JenisKerusakan[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingInspeksiId, setEditingInspeksiId] = useState<number | null>(null);

  const [openIssues, setOpenIssues] = useState<OpenIssue[]>([]);
  const [solvedIssues, setSolvedIssues] = useState<number[]>([]);
  const [newIssues, setNewIssues] = useState<number[]>([]);

  // Form state
  const [form, setForm] = useState({
    asset_code: "",
    estate_code: "",
    block: "",
    catatan: "",
    tgl_inspeksi: new Date().toISOString().split('T')[0],
  });

  // Filters state
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterIsu, setFilterIsu] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ---- Fetch Data ---- */
  const fetchRiwayat = useCallback(async () => {
    try {
      const res = await fetch("/api/inspeksi");
      const data = await res.json();
      if (res.ok) setRiwayatList(data);
      else setError(data.error);
    } catch {
      setError("Gagal memuat riwayat inspeksi.");
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
      fetch("/api/jenis-kerusakan").then((r) => r.json()),
    ]).then(([aset, estate, kerusakan]) => {
      if (Array.isArray(aset)) setAsetList(aset);
      if (Array.isArray(estate)) setEstateList(estate);
      if (Array.isArray(kerusakan)) setKerusakanList(kerusakan);
    });
  }, [showForm]);

  // Fetch Open Issues jika asset_code berubah & BUKAN mode edit
  useEffect(() => {
    if (editingInspeksiId !== null || !form.asset_code) {
      setOpenIssues([]);
      setSolvedIssues([]);
      setNewIssues([]);
      return;
    }
    
    fetch(`/api/inspeksi/open-issue?asset_code=${form.asset_code}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOpenIssues(data);
        } else {
          setOpenIssues([]);
        }
      })
      .catch(() => setOpenIssues([]));
  }, [form.asset_code, editingInspeksiId]);

  /* ---- Handle Submit ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const isEdit = editingInspeksiId !== null;
      const payload = {
        ...form,
        id_inspeksi: editingInspeksiId,
        new_issues: newIssues,
        solved_issues: solvedIssues,
      };

      const res = await fetch("/api/inspeksi", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(isEdit ? `Berhasil mengupdate data inspeksi.` : `Inspeksi aset berhasil dicatat!`);
        resetForm();
        fetchRiwayat();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || `Gagal ${isEdit ? 'mengupdate' : 'mencatat'} inspeksi.`);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (i: InspeksiRiwayat) => {
    setEditingInspeksiId(i.id_inspeksi);
    setForm({
      asset_code: i.asset_code,
      estate_code: i.estate_code,
      block: i.block || "",
      catatan: i.catatan || "",
      tgl_inspeksi: new Date(i.tgl_inspeksi).toISOString().split('T')[0],
    });
    setNewIssues([]);
    setSolvedIssues([]);
    setOpenIssues([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSolvedIssue = (id_issue: number) => {
    if (solvedIssues.includes(id_issue)) {
      setSolvedIssues(solvedIssues.filter((id) => id !== id_issue));
    } else {
      setSolvedIssues([...solvedIssues, id_issue]);
    }
  };

  const toggleNewIssue = (id_kerusakan: number) => {
    if (newIssues.includes(id_kerusakan)) {
      setNewIssues(newIssues.filter((id) => id !== id_kerusakan));
    } else {
      setNewIssues([...newIssues, id_kerusakan]);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingInspeksiId(null);
    setForm({
      asset_code: "", estate_code: "", block: "", catatan: "", tgl_inspeksi: new Date().toISOString().split('T')[0]
    });
    setNewIssues([]);
    setSolvedIssues([]);
    setOpenIssues([]);
  };

  /* ---- Derived Data (Filters & Export) ---- */
  const uniqueCompany = Array.from(new Set(riwayatList.map(i => i.company_code).filter(Boolean))) as string[];

  const filteredList = riwayatList.filter(i => {
    const d = new Date(i.tgl_inspeksi);
    const passStart = filterStartDate ? d >= new Date(filterStartDate) : true;
    const passEnd = filterEndDate ? d <= new Date(filterEndDate) : true;
    const passCompany = filterCompany ? i.company_code === filterCompany : true;
    
    let passIsu = true;
    if (filterIsu === "baru") {
      passIsu = i.issues_opened && i.issues_opened.length > 0;
    } else if (filterIsu === "selesai") {
      passIsu = i.issues_solved && i.issues_solved.length > 0;
    } else if (filterIsu === "normal") {
      passIsu = (!i.issues_opened || i.issues_opened.length === 0) && (!i.issues_solved || i.issues_solved.length === 0);
    }

    return passStart && passEnd && passIsu && passCompany;
  });

  const paginatedList = pageSize === 0 
    ? filteredList 
    : filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredList.map(i => {
      const opened = i.issues_opened?.map(io => io.nama_kerusakan).join(", ") || "";
      const solved = i.issues_solved?.map(is => is.nama_kerusakan).join(", ") || "";
      const isNormal = (!opened && !solved);

      return {
        "Tanggal Inspeksi": new Date(i.tgl_inspeksi).toLocaleDateString('en-GB'),
        "Kode Aset": i.asset_code,
        "Nama Aset": i.asset_name,
        "Lokasi Estate": i.estate_name,
        "Blok Detail": i.block || "-",
        "Isu Baru Ditemukan": opened,
        "Isu Selesai/Diperbaiki": solved,
        "Status Inspeksi": isNormal ? "Normal / Baik" : "Ada Isu",
        "Catatan": i.catatan || "-",
        "Inspektur (User)": i.inspektur_name || "-",
      };
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inspeksi");
    XLSX.writeFile(wb, "Data_Inspeksi_Pompa.xlsx");
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
            Inspeksi Pompa
          </h1>
          <div className="h-2 bg-nb-green border-2 border-black mt-2 w-48" />
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="btn-nb bg-nb-yellow text-black px-6 py-3 text-lg flex items-center gap-2"
        >
          {showForm ? "✕ Tutup Form" : "🔍 Inspeksi Baru"}
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="border-4 border-black bg-nb-green p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <span className="font-bold text-black">✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-black text-black text-xl leading-none">✕</button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="border-4 border-black bg-nb-red p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <span className="font-bold text-black">❌ {error}</span>
          <button onClick={() => setError(null)} className="font-black text-black text-xl leading-none">✕</button>
        </div>
      )}

      {/* ============ INSPEKSI FORM ============ */}
      {showForm && (
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden">
          <div className={`${editingInspeksiId ? 'bg-nb-yellow' : 'bg-nb-green'} border-b-4 border-black p-4`}>
            <h2 className="text-xl font-black text-black uppercase tracking-wide">
              {editingInspeksiId ? "✏️ Edit Inspeksi" : "📋 Form Inspeksi Baru"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Aset Pompa *</label>
                <SearchableSelect 
                  name="asset_code"
                  value={form.asset_code}
                  onChange={(val) => setForm({ ...form, asset_code: val })}
                  options={asetList.map(a => ({ value: a.asset_code, label: `${a.asset_code} — ${a.asset_name}` }))}
                  placeholder="-- Pilih Pompa --"
                  disabled={editingInspeksiId !== null}
                />
                {editingInspeksiId && <p className="text-xs font-bold text-nb-red mt-1">Aset tidak bisa diubah pada mode edit.</p>}
              </div>

              {/* Location Estate */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Lokasi Estate *</label>
                <SearchableSelect
                  name="estate_code"
                  value={form.estate_code}
                  onChange={(val) => setForm({ ...form, estate_code: val })}
                  options={estateList.map(e => ({ value: e.estate_code, label: `${e.estate_code} — ${e.estate_name}` }))}
                  placeholder="-- Pilih Estate --"
                />
              </div>

              {/* Block Detail */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Detail Blok / Lokasi</label>
                <input name="block" value={form.block} onChange={handleChange} placeholder="Contoh: Stasiun Pompa 1" className="input-nb w-full" />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Tanggal Inspeksi *</label>
                <input type="date" name="tgl_inspeksi" value={form.tgl_inspeksi} onChange={handleChange} required className="input-nb w-full" />
              </div>
            </div>

            {/* ONLY FOR NEW INSPECTION (NOT EDIT MODE) */}
            {editingInspeksiId === null && (
              <>
                {/* Isu Terbuka Section */}
                {openIssues.length > 0 && (
                  <div className="mb-6 p-5 border-4 border-black bg-nb-yellow/20">
                    <h3 className="text-lg font-black text-black dark:text-white uppercase mb-3 flex items-center gap-2">
                      <span>⚠️ Isu Kerusakan Terbuka</span>
                    </h3>
                    <p className="text-sm font-bold text-black/70 dark:text-white/70 mb-4">
                      Pompa ini memiliki kerusakan yang belum terselesaikan. Centang kotak di bawah ini HANYA JIKA kerusakan tersebut sudah diperbaiki (Solved).
                    </p>
                    <div className="flex flex-col gap-3">
                      {openIssues.map((issue) => (
                        <label key={issue.id_issue} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-black bg-white dark:bg-gray-800 hover:bg-nb-green/10 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={solvedIssues.includes(issue.id_issue)}
                            onChange={() => toggleSolvedIssue(issue.id_issue)}
                            className="w-6 h-6 border-2 border-black accent-nb-green cursor-pointer"
                          />
                          <div>
                            <span className={`font-bold text-lg ${solvedIssues.includes(issue.id_issue) ? 'line-through text-black/50 dark:text-white/50' : 'text-black dark:text-white'}`}>
                              {issue.nama_kerusakan}
                            </span>
                            <span className="ml-3 badge-nb bg-nb-red text-white text-xs">OPEN</span>
                            <div className="text-xs text-black/60 dark:text-white/60 mt-1">Ditemukan: {new Date(issue.created_at).toLocaleDateString('en-GB')}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Isu Baru Section */}
                <div className="mb-6 p-5 border-4 border-black bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-lg font-black text-black dark:text-white uppercase mb-3 flex items-center gap-2">
                    <span>➕ Tambah Kerusakan Baru</span>
                  </h3>
                  <p className="text-sm font-bold text-black/70 dark:text-white/70 mb-4">
                    Pilih jenis kerusakan baru (bisa lebih dari satu) jika ditemukan masalah pada saat inspeksi. Jika kondisi pompa baik, biarkan kosong.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {kerusakanList.map((k) => (
                      <label key={k.id_kerusakan} className={`flex items-center gap-3 cursor-pointer p-2 border-2 border-black transition-colors ${newIssues.includes(k.id_kerusakan) ? 'bg-nb-red text-white' : 'bg-white dark:bg-gray-900 text-black dark:text-white hover:bg-nb-red/10'}`}>
                        <input 
                          type="checkbox" 
                          checked={newIssues.includes(k.id_kerusakan)}
                          onChange={() => toggleNewIssue(k.id_kerusakan)}
                          className="w-5 h-5 border-2 border-black accent-black cursor-pointer"
                        />
                        <div className="font-bold text-sm">
                          {k.nama_kerusakan}
                          {k.kategori && <span className="block text-xs opacity-70 font-normal">{k.kategori}</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Catatan */}
            <div className="mb-5">
              <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Catatan / Temuan Lainnya</label>
              <textarea name="catatan" value={form.catatan} onChange={handleChange} rows={3} placeholder="Tuliskan detail temuan inspeksi di sini..." className="input-nb w-full resize-y" />
            </div>

            <div className="mt-4 p-4 border-4 border-black bg-nb-cyan/30 font-bold text-black dark:text-white text-sm">
              ℹ️ Mengirim form ini akan memperbarui status kondisi aset di Master Data secara otomatis berdasarkan jumlah masalah yang masih terbuka.
            </div>

            {/* Submit */}
            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-nb bg-nb-cyan text-black px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "⏳ Menyimpan..." : (editingInspeksiId ? "💾 Update Data" : "💾 Simpan Inspeksi")}
              </button>
              <button type="button" onClick={resetForm} className="btn-nb bg-white text-black px-8 py-3 text-lg">Batal</button>
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
                onChange={val => { setFilterCompany(val); setCurrentPage(1); }}
                options={[{value: "", label: "Semua Company"}, ...uniqueCompany.map(c => ({ value: c, label: c }))]}
                placeholder="Semua Company"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Mulai Tanggal</label>
            <input type="date" value={filterStartDate} onChange={e => { setFilterStartDate(e.target.value); setCurrentPage(1); }} className="input-nb py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Sampai Tanggal</label>
            <input type="date" value={filterEndDate} onChange={e => { setFilterEndDate(e.target.value); setCurrentPage(1); }} className="input-nb py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs font-black text-black dark:text-white mb-1 uppercase">Filter Status Isu</label>
            <div className="w-56">
              <SearchableSelect
                value={filterIsu}
                onChange={val => { setFilterIsu(val); setCurrentPage(1); }}
                options={[
                  {value: "", label: "Semua Status"},
                  {value: "baru", label: "Ada Isu Baru"},
                  {value: "selesai", label: "Isu Selesai / Diperbaiki"},
                  {value: "normal", label: "Kondisi Normal / Baik"},
                ]}
                placeholder="Semua Status"
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
            🔍 Riwayat Inspeksi Terakhir
          </h2>
          <span className="badge-nb bg-white text-black">{filteredList.length} data</span>
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
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-xl font-black text-black">
                {riwayatList.length === 0 ? "Belum ada riwayat inspeksi." : "Tidak ada data inspeksi yang cocok dengan filter."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-nb-green text-black border-b-4 border-black">
                  <th className="p-3 text-left text-sm font-black uppercase border-r-4 border-black w-[12%]">Tanggal</th>
                  <th className="p-3 text-left text-sm font-black uppercase border-r-4 border-black w-[10%]">Company</th>
                  <th className="p-3 text-left text-sm font-black uppercase border-r-4 border-black w-[18%]">Aset & Lokasi</th>
                  <th className="p-3 text-left text-sm font-black uppercase border-r-4 border-black w-[40%]">Isu / Hasil Inspeksi</th>
                  <th className="p-3 text-center text-sm font-black uppercase w-[20%]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((i, idx) => (
                  <tr key={i.id_inspeksi} className={`border-b-4 border-black hover:bg-nb-green/20 ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
                    <td className="p-3 font-black text-black dark:text-white border-r-4 border-black align-top">
                      {new Date(i.tgl_inspeksi).toLocaleDateString('en-GB')}
                      {i.inspektur_name && <div className="text-xs mt-2 font-bold opacity-70">Oleh: {i.inspektur_name}</div>}
                    </td>
                    <td className="p-3 font-bold text-black dark:text-white border-r-4 border-black align-top">
                      {i.company_code || "—"}
                    </td>
                    <td className="p-3 border-r-4 border-black align-top">
                      <div className="font-black text-black dark:text-white text-base leading-tight">{i.asset_code}</div>
                      {i.asset_name && (
                        <div className="text-xs font-bold text-black/40 dark:text-white/40 mt-0.5 tracking-wide">{i.asset_name}</div>
                      )}
                      <div className="text-sm font-bold text-black/70 dark:text-white/70 mt-1">📍 {i.estate_name}</div>
                      {i.block && <div className="text-xs font-bold text-gray-500">{i.block}</div>}
                    </td>
                    <td className="p-3 border-r-4 border-black align-top">
                      <div className="flex flex-col gap-2">
                        {/* Issues Opened */}
                        {i.issues_opened && i.issues_opened.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs font-bold text-nb-red uppercase mr-1 flex items-center">🚨 Baru:</span>
                            {i.issues_opened.map(issue => (
                              <span key={`opened-${issue.id_issue}`} className="badge-nb bg-nb-red text-white text-xs">{issue.nama_kerusakan}</span>
                            ))}
                          </div>
                        )}
                        
                        {/* Issues Solved */}
                        {i.issues_solved && i.issues_solved.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs font-bold text-nb-green uppercase mr-1 flex items-center">✅ Selesai:</span>
                            {i.issues_solved.map(issue => (
                              <span key={`solved-${issue.id_issue}`} className="badge-nb bg-nb-green text-black text-xs line-through">{issue.nama_kerusakan}</span>
                            ))}
                          </div>
                        )}

                        {/* Normal / Baik jika kosong dua-duanya */}
                        {(!i.issues_opened || i.issues_opened.length === 0) && (!i.issues_solved || i.issues_solved.length === 0) && (
                           <div><span className="badge-nb bg-nb-cyan text-black text-xs">✅ Kondisi Normal / Baik</span></div>
                        )}

                        {i.catatan && (
                          <div className="mt-2 text-sm font-medium dark:text-gray-300 italic border-l-4 border-nb-yellow pl-2">
                            &quot;{i.catatan}&quot;
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center align-top">
                      <button onClick={() => handleEdit(i)} className="btn-nb bg-nb-yellow text-black px-3 py-1 text-xs">
                        ✏️ Edit Data
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
