"use client";

import { useEffect, useState, useCallback } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { Pagination } from "@/components";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Estate {
  estate_code: string;
  estate_name: string;
  company_code: string | null;
  region: string | null;
}

interface TipePompa {
  id_tipe: number;
  jenis_pompa: string;
  merek: string | null;
  mesin_penggerak: string | null;
  nama_vendor: string | null;
  debit_m3_jam: string | null;
  hp_mesin: string | null;
}

interface JenisKerusakan {
  id_kerusakan: number;
  nama_kerusakan: string;
  kategori: string | null;
}

interface User {
  id_user: number;
  username: string;
  role: string;
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function MasterPage() {
  const [activeTab, setActiveTab] = useState<"estate" | "tipe" | "kerusakan" | "user">("estate");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State Data
  const [estateList, setEstateList] = useState<Estate[]>([]);
  const [tipeList, setTipeList] = useState<TipePompa[]>([]);
  const [kerusakanList, setKerusakanList] = useState<JenisKerusakan[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  
  // Editing States
  const [editingEstateId, setEditingEstateId] = useState<string | null>(null);
  const [editingTipeId, setEditingTipeId] = useState<number | null>(null);
  const [editingKerusakanId, setEditingKerusakanId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const initEstateForm = { estate_code: "", estate_name: "", company_code: "", region: "" };
  const initTipeForm = { jenis_pompa: "", merek: "", mesin_penggerak: "", nama_vendor: "", debit_m3_jam: "", hp_mesin: "" };
  const initKerusakanForm = { nama_kerusakan: "", kategori: "" };
  const initUserForm = { username: "", password: "", role: "operator" };

  const [estateForm, setEstateForm] = useState(initEstateForm);
  const [tipeForm, setTipeForm] = useState(initTipeForm);
  const [kerusakanForm, setKerusakanForm] = useState(initKerusakanForm);
  const [userForm, setUserForm] = useState(initUserForm);

  /* ---- Fetching ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "estate") {
        const res = await fetch("/api/estate");
        const data = await res.json();
        if (res.ok) setEstateList(data); else setError(data.error);
      } else if (activeTab === "tipe") {
        const res = await fetch("/api/tipe-pompa");
        const data = await res.json();
        if (res.ok) setTipeList(data); else setError(data.error);
      } else if (activeTab === "kerusakan") {
        const res = await fetch("/api/jenis-kerusakan");
        const data = await res.json();
        if (res.ok) setKerusakanList(data); else setError(data.error);
      } else if (activeTab === "user") {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (res.ok) setUserList(data); else setError(data.error);
      }
    } catch {
      setError(`Gagal memuat data master ${activeTab}.`);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    // Reset forms when switching tabs
    setEditingEstateId(null); setEstateForm(initEstateForm);
    setEditingTipeId(null); setTipeForm(initTipeForm);
    setEditingKerusakanId(null); setKerusakanForm(initKerusakanForm);
    setEditingUserId(null); setUserForm(initUserForm);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  /* ---- Edit Handlers ---- */
  const handleEditEstate = (e: Estate) => {
    setEditingEstateId(e.estate_code);
    setEstateForm({
      estate_code: e.estate_code,
      estate_name: e.estate_name,
      company_code: e.company_code || "",
      region: e.region || "",
    });
  };

  const handleEditTipe = (t: TipePompa) => {
    setEditingTipeId(t.id_tipe);
    setTipeForm({
      jenis_pompa: t.jenis_pompa,
      merek: t.merek || "",
      mesin_penggerak: t.mesin_penggerak || "",
      nama_vendor: t.nama_vendor || "",
      debit_m3_jam: t.debit_m3_jam ? String(t.debit_m3_jam) : "",
      hp_mesin: t.hp_mesin ? String(t.hp_mesin) : "",
    });
  };

  const handleEditKerusakan = (k: JenisKerusakan) => {
    setEditingKerusakanId(k.id_kerusakan);
    setKerusakanForm({
      nama_kerusakan: k.nama_kerusakan,
      kategori: k.kategori || "",
    });
  };

  const handleEditUser = (u: User) => {
    setEditingUserId(u.id_user);
    setUserForm({
      username: u.username,
      password: "", // Kosongkan password saat edit
      role: u.role,
    });
  };

  /* ---- Submit Handlers ---- */
  const handleEstateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const isEdit = editingEstateId !== null;
      const res = await fetch("/api/estate", {
        method: isEdit ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estateForm),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Estate "${data.estate_name}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`);
        setEditingEstateId(null);
        setEstateForm(initEstateForm);
        fetchData();
      } else setError(data.error);
    } catch {
      setError("Kesalahan jaringan.");
    } finally { setSubmitting(false); }
  };

  const handleTipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const isEdit = editingTipeId !== null;
      const res = await fetch("/api/tipe-pompa", {
        method: isEdit ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...tipeForm, id_tipe: editingTipeId } : tipeForm),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Tipe pompa "${data.jenis_pompa}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`);
        setEditingTipeId(null);
        setTipeForm(initTipeForm);
        fetchData();
      } else setError(data.error);
    } catch {
      setError("Kesalahan jaringan.");
    } finally { setSubmitting(false); }
  };

  const handleKerusakanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const isEdit = editingKerusakanId !== null;
      const res = await fetch("/api/jenis-kerusakan", {
        method: isEdit ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...kerusakanForm, id_kerusakan: editingKerusakanId } : kerusakanForm),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Jenis kerusakan "${data.nama_kerusakan}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`);
        setEditingKerusakanId(null);
        setKerusakanForm(initKerusakanForm);
        fetchData();
      } else setError(data.error);
    } catch {
      setError("Kesalahan jaringan.");
    } finally { setSubmitting(false); }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const isEdit = editingUserId !== null;
      // Jika mode edit dan password kosong, jangan kirim password
      const payload: any = { ...userForm };
      if (isEdit) {
        payload.id_user = editingUserId;
        if (!payload.password) delete payload.password;
      }

      const res = await fetch("/api/user", {
        method: isEdit ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`User "${data.username}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`);
        setEditingUserId(null);
        setUserForm(initUserForm);
        fetchData();
      } else setError(data.error);
    } catch {
      setError("Kesalahan jaringan.");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
          Master Data
        </h1>
        <div className="h-2 bg-nb-orange border-2 border-black mt-2 w-48" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("estate")}
          className={`px-6 py-3 border-4 border-black font-black uppercase text-sm md:text-base transition-all duration-150 ${
            activeTab === "estate" ? "bg-nb-blue text-black translate-x-[2px] translate-y-[2px]" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          }`}
        >
          🏙️ Master Estate
        </button>
        <button
          onClick={() => setActiveTab("tipe")}
          className={`px-6 py-3 border-4 border-black font-black uppercase text-sm md:text-base transition-all duration-150 ${
            activeTab === "tipe" ? "bg-nb-pink text-black translate-x-[2px] translate-y-[2px]" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          }`}
        >
          ⚙️ Master Tipe Pompa
        </button>
        <button
          onClick={() => setActiveTab("kerusakan")}
          className={`px-6 py-3 border-4 border-black font-black uppercase text-sm md:text-base transition-all duration-150 ${
            activeTab === "kerusakan" ? "bg-nb-purple text-black translate-x-[2px] translate-y-[2px]" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          }`}
        >
          ⚠️ Master Kerusakan
        </button>
        <button
          onClick={() => setActiveTab("user")}
          className={`px-6 py-3 border-4 border-black font-black uppercase text-sm md:text-base transition-all duration-150 ${
            activeTab === "user" ? "bg-nb-green text-black translate-x-[2px] translate-y-[2px]" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          }`}
        >
          👤 Master User
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="border-4 border-black bg-nb-green p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <span className="font-bold text-black">✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-black text-black text-xl leading-none">✕</button>
        </div>
      )}
      {error && (
        <div className="border-4 border-black bg-nb-red p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <span className="font-bold text-black">❌ {error}</span>
          <button onClick={() => setError(null)} className="font-black text-black text-xl leading-none">✕</button>
        </div>
      )}

      {/* =========================================
          TAB 1: ESTATE
      ========================================= */}
      {activeTab === "estate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Estate */}
          <div className="lg:col-span-1 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
            <div className={`${editingEstateId ? 'bg-nb-yellow' : 'bg-nb-blue'} border-b-4 border-black p-4 flex justify-between items-center`}>
              <h2 className="text-xl font-black text-black uppercase">
                {editingEstateId ? "✏️ Edit Estate" : "➕ Tambah Estate"}
              </h2>
              {editingEstateId && (
                <button onClick={() => { setEditingEstateId(null); setEstateForm(initEstateForm); }} className="font-black text-black text-xs border-2 border-black px-2 py-1 bg-white hover:bg-gray-200">BATAL</button>
              )}
            </div>
            <form onSubmit={handleEstateSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Estate Code *</label>
                <input required name="estate_code" value={estateForm.estate_code} onChange={e => setEstateForm({...estateForm, estate_code: e.target.value})} placeholder="Contoh: EST01" disabled={editingEstateId !== null} className="input-nb w-full disabled:bg-gray-200 disabled:cursor-not-allowed" />
                {editingEstateId && <p className="text-xs font-bold text-nb-red mt-1">Kode tidak bisa diubah.</p>}
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Estate Name *</label>
                <input required name="estate_name" value={estateForm.estate_name} onChange={e => setEstateForm({...estateForm, estate_name: e.target.value})} placeholder="Contoh: Kebun Mawar" className="input-nb w-full" />
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Company Code</label>
                <input name="company_code" value={estateForm.company_code} onChange={e => setEstateForm({...estateForm, company_code: e.target.value})} placeholder="Contoh: CMP01" className="input-nb w-full" />
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Region</label>
                <input name="region" value={estateForm.region} onChange={e => setEstateForm({...estateForm, region: e.target.value})} placeholder="Contoh: Sumatera Utara" className="input-nb w-full" />
              </div>
              <button type="submit" disabled={submitting} className={`btn-nb ${editingEstateId ? 'bg-nb-yellow' : 'bg-nb-blue'} text-black py-3 mt-2 disabled:opacity-50`}>
                {submitting ? "⏳ Menyimpan..." : (editingEstateId ? "Update Estate" : "Simpan Estate")}
              </button>
            </form>
          </div>

          {/* Table Estate */}
          <div className="lg:col-span-2 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
             <div className="bg-black p-4 border-b-4 border-black flex justify-between items-center">
               <h2 className="text-xl font-black text-white uppercase">Daftar Estate</h2>
               <span className="badge-nb bg-nb-blue text-black">{estateList.length} data</span>
             </div>
             {loading ? <div className="p-8 text-center font-black">⏳ Memuat...</div> : (
               <>
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-nb-yellow text-black border-b-4 border-black">
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Code</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Name</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Company</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Region</th>
                         <th className="p-3 text-center font-black uppercase">Aksi</th>
                       </tr>
                     </thead>
                     <tbody>
                       {(pageSize === 0 ? estateList : estateList.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((e, idx) => (
                         <tr key={e.estate_code} className={`border-b-4 border-black ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
                           <td className="p-3 font-black border-r-4 border-black text-nb-purple">{e.estate_code}</td>
                           <td className="p-3 font-bold border-r-4 border-black">{e.estate_name}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-gray-500">{e.company_code || "-"}</td>
                           <td className="p-3 font-bold border-r-4 border-black">{e.region || "-"}</td>
                           <td className="p-3 text-center">
                             <button onClick={() => handleEditEstate(e)} className="btn-nb bg-nb-yellow text-black px-3 py-1 text-xs">Edit</button>
                           </td>
                         </tr>
                       ))}
                       {estateList.length === 0 && <tr><td colSpan={5} className="p-6 text-center font-bold">Belum ada data estate.</td></tr>}
                     </tbody>
                   </table>
                 </div>
                 <Pagination totalItems={estateList.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
               </>
             )}
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: TIPE POMPA
      ========================================= */}
      {activeTab === "tipe" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Tipe Pompa */}
          <div className="lg:col-span-4 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
            <div className={`${editingTipeId ? 'bg-nb-yellow' : 'bg-nb-pink'} border-b-4 border-black p-4 flex justify-between items-center`}>
              <h2 className="text-xl font-black text-black uppercase">
                {editingTipeId ? "✏️ Edit Tipe Pompa" : "➕ Tambah Tipe Pompa"}
              </h2>
              {editingTipeId && (
                <button onClick={() => { setEditingTipeId(null); setTipeForm(initTipeForm); }} className="font-black text-black text-xs border-2 border-black px-2 py-1 bg-white hover:bg-gray-200">BATAL</button>
              )}
            </div>
            <form onSubmit={handleTipeSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Jenis Pompa *</label>
                <input required name="jenis_pompa" value={tipeForm.jenis_pompa} onChange={e => setTipeForm({...tipeForm, jenis_pompa: e.target.value})} placeholder="Contoh: Sentrifugal" className="input-nb w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Merek</label>
                  <input name="merek" value={tipeForm.merek} onChange={e => setTipeForm({...tipeForm, merek: e.target.value})} placeholder="Ebara" className="input-nb w-full" />
                </div>
                <div>
                  <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Mesin</label>
                  <input name="mesin_penggerak" value={tipeForm.mesin_penggerak} onChange={e => setTipeForm({...tipeForm, mesin_penggerak: e.target.value})} placeholder="Diesel" className="input-nb w-full" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Vendor</label>
                <input name="nama_vendor" value={tipeForm.nama_vendor} onChange={e => setTipeForm({...tipeForm, nama_vendor: e.target.value})} placeholder="PT Pompa Jaya" className="input-nb w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Debit (m3/jam)</label>
                  <input type="number" step="0.01" name="debit_m3_jam" value={tipeForm.debit_m3_jam} onChange={e => setTipeForm({...tipeForm, debit_m3_jam: e.target.value})} className="input-nb w-full" />
                </div>
                <div>
                  <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">HP Mesin</label>
                  <input type="number" step="0.01" name="hp_mesin" value={tipeForm.hp_mesin} onChange={e => setTipeForm({...tipeForm, hp_mesin: e.target.value})} className="input-nb w-full" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className={`btn-nb ${editingTipeId ? 'bg-nb-yellow' : 'bg-nb-pink'} text-black py-3 mt-2 disabled:opacity-50`}>
                {submitting ? "⏳ Menyimpan..." : (editingTipeId ? "Update Tipe" : "Simpan Tipe")}
              </button>
            </form>
          </div>

          {/* Table Tipe Pompa */}
          <div className="lg:col-span-8 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
             <div className="bg-black p-4 border-b-4 border-black flex justify-between items-center">
               <h2 className="text-xl font-black text-white uppercase">Daftar Tipe Pompa</h2>
               <span className="badge-nb bg-nb-pink text-black">{tipeList.length} data</span>
             </div>
             {loading ? <div className="p-8 text-center font-black">⏳ Memuat...</div> : (
               <>
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-nb-yellow text-black border-b-4 border-black">
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">ID</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Jenis</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Merek</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Mesin</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Debit</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">HP</th>
                         <th className="p-3 text-center font-black uppercase">Aksi</th>
                       </tr>
                     </thead>
                     <tbody>
                       {(pageSize === 0 ? tipeList : tipeList.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((t, idx) => (
                         <tr key={t.id_tipe} className={`border-b-4 border-black ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
                           <td className="p-3 font-black border-r-4 border-black">{t.id_tipe}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-nb-purple">{t.jenis_pompa}</td>
                           <td className="p-3 font-bold border-r-4 border-black">{t.merek || "-"}</td>
                           <td className="p-3 font-bold border-r-4 border-black">{t.mesin_penggerak || "-"}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-gray-500">{t.debit_m3_jam || "-"}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-gray-500">{t.hp_mesin || "-"}</td>
                           <td className="p-3 text-center">
                             <button onClick={() => handleEditTipe(t)} className="btn-nb bg-nb-yellow text-black px-3 py-1 text-xs">Edit</button>
                           </td>
                         </tr>
                       ))}
                       {tipeList.length === 0 && <tr><td colSpan={7} className="p-6 text-center font-bold">Belum ada data tipe pompa.</td></tr>}
                     </tbody>
                   </table>
                 </div>
                 <Pagination totalItems={tipeList.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
               </>
             )}
          </div>
        </div>
      )}

      {/* =========================================
          TAB 3: JENIS KERUSAKAN
      ========================================= */}
      {activeTab === "kerusakan" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Kerusakan */}
          <div className="lg:col-span-1 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
            <div className={`${editingKerusakanId ? 'bg-nb-yellow' : 'bg-nb-purple'} border-b-4 border-black p-4 flex justify-between items-center`}>
              <h2 className="text-xl font-black text-black uppercase">
                {editingKerusakanId ? "✏️ Edit Kerusakan" : "➕ Tambah Kerusakan"}
              </h2>
              {editingKerusakanId && (
                <button onClick={() => { setEditingKerusakanId(null); setKerusakanForm(initKerusakanForm); }} className="font-black text-black text-xs border-2 border-black px-2 py-1 bg-white hover:bg-gray-200">BATAL</button>
              )}
            </div>
            <form onSubmit={handleKerusakanSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Nama Kerusakan *</label>
                <input required name="nama_kerusakan" value={kerusakanForm.nama_kerusakan} onChange={e => setKerusakanForm({...kerusakanForm, nama_kerusakan: e.target.value})} placeholder="Contoh: Seal Bocor" className="input-nb w-full" />
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Kategori</label>
                <SearchableSelect
                  name="kategori"
                  value={kerusakanForm.kategori}
                  onChange={(val) => setKerusakanForm({...kerusakanForm, kategori: val})}
                  options={[
                    {value: "Mekanikal", label: "Mekanikal"},
                    {value: "Elektrikal", label: "Elektrikal"},
                    {value: "Operasional", label: "Operasional"},
                    {value: "Lainnya", label: "Lainnya"},
                  ]}
                  placeholder="-- Pilih Kategori --"
                />
              </div>
              <button type="submit" disabled={submitting} className={`btn-nb ${editingKerusakanId ? 'bg-nb-yellow' : 'bg-nb-purple'} text-black py-3 mt-2 disabled:opacity-50`}>
                {submitting ? "⏳ Menyimpan..." : (editingKerusakanId ? "Update Kerusakan" : "Simpan Kerusakan")}
              </button>
            </form>
          </div>

          {/* Table Kerusakan */}
          <div className="lg:col-span-2 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
             <div className="bg-black p-4 border-b-4 border-black flex justify-between items-center">
               <h2 className="text-xl font-black text-white uppercase">Daftar Kerusakan</h2>
               <span className="badge-nb bg-nb-purple text-black">{kerusakanList.length} data</span>
             </div>
             {loading ? <div className="p-8 text-center font-black">⏳ Memuat...</div> : (
               <>
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-nb-yellow text-black border-b-4 border-black">
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black w-16">ID</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Nama Kerusakan</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Kategori</th>
                         <th className="p-3 text-center font-black uppercase">Aksi</th>
                       </tr>
                     </thead>
                     <tbody>
                       {(pageSize === 0 ? kerusakanList : kerusakanList.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((k, idx) => (
                         <tr key={k.id_kerusakan} className={`border-b-4 border-black ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
                           <td className="p-3 font-black border-r-4 border-black">{k.id_kerusakan}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-nb-pink">{k.nama_kerusakan}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-gray-500">
                             {k.kategori ? <span className="badge-nb bg-white text-black">{k.kategori}</span> : "-"}
                           </td>
                           <td className="p-3 text-center">
                             <button onClick={() => handleEditKerusakan(k)} className="btn-nb bg-nb-yellow text-black px-3 py-1 text-xs">Edit</button>
                           </td>
                         </tr>
                       ))}
                       {kerusakanList.length === 0 && <tr><td colSpan={4} className="p-6 text-center font-bold">Belum ada data jenis kerusakan.</td></tr>}
                     </tbody>
                   </table>
                 </div>
                 <Pagination totalItems={kerusakanList.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
               </>
             )}
          </div>
        </div>
      )}

      {/* =========================================
          TAB 4: MASTER USER
      ========================================= */}
      {activeTab === "user" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form User */}
          <div className="lg:col-span-1 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
            <div className={`${editingUserId ? 'bg-nb-yellow' : 'bg-nb-green'} border-b-4 border-black p-4 flex justify-between items-center`}>
              <h2 className="text-xl font-black text-black uppercase">
                {editingUserId ? "✏️ Edit User" : "➕ Tambah User Baru"}
              </h2>
              {editingUserId && (
                <button onClick={() => { setEditingUserId(null); setUserForm(initUserForm); }} className="font-black text-black text-xs border-2 border-black px-2 py-1 bg-white hover:bg-gray-200">BATAL</button>
              )}
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Username *</label>
                <input required name="username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} placeholder="Contoh: joko_operator" disabled={editingUserId !== null} className="input-nb w-full disabled:bg-gray-200 disabled:cursor-not-allowed" />
                {editingUserId && <p className="text-xs font-bold text-nb-red mt-1">Username tidak bisa diubah.</p>}
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Password {editingUserId && "(Opsional)"} {!editingUserId && "*"}</label>
                <input required={!editingUserId} type="password" name="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="••••••••" className="input-nb w-full" />
                {editingUserId && <p className="text-xs font-bold text-gray-500 mt-1">Kosongkan jika tidak ingin ganti password.</p>}
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">Role *</label>
                <SearchableSelect
                  name="role"
                  value={userForm.role}
                  onChange={(val) => setUserForm({...userForm, role: val})}
                  options={[
                    {value: "operator", label: "Operator"},
                    {value: "admin", label: "Admin"},
                  ]}
                  placeholder="-- Pilih Role --"
                />
              </div>
              <div className="mt-2 text-xs font-bold bg-yellow-100 border-2 border-black p-2 text-black">
                💡 Password akan dienkripsi menggunakan bcrypt di database.
              </div>
              <button type="submit" disabled={submitting} className={`btn-nb ${editingUserId ? 'bg-nb-yellow' : 'bg-nb-green'} text-black py-3 mt-2 disabled:opacity-50`}>
                {submitting ? "⏳ Menyimpan..." : (editingUserId ? "Update User" : "Simpan User")}
              </button>
            </form>
          </div>

          {/* Table User */}
          <div className="lg:col-span-2 border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
             <div className="bg-black p-4 border-b-4 border-black flex justify-between items-center">
               <h2 className="text-xl font-black text-white uppercase">Daftar Akun User</h2>
               <span className="badge-nb bg-nb-green text-black">{userList.length} akun</span>
             </div>
             {loading ? <div className="p-8 text-center font-black">⏳ Memuat...</div> : (
               <>
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-nb-yellow text-black border-b-4 border-black">
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black w-16">ID</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Username</th>
                         <th className="p-3 text-left font-black uppercase border-r-4 border-black">Role Akses</th>
                         <th className="p-3 text-center font-black uppercase">Aksi</th>
                       </tr>
                     </thead>
                     <tbody>
                       {(pageSize === 0 ? userList : userList.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((u, idx) => (
                         <tr key={u.id_user} className={`border-b-4 border-black ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
                           <td className="p-3 font-black border-r-4 border-black">{u.id_user}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-nb-blue">{u.username}</td>
                           <td className="p-3 font-bold border-r-4 border-black text-gray-500">
                             {u.role === "admin" ? (
                               <span className="badge-nb bg-nb-orange text-black">ADMIN</span>
                             ) : (
                               <span className="badge-nb bg-nb-cyan text-black">OPERATOR</span>
                             )}
                           </td>
                           <td className="p-3 text-center">
                             <button onClick={() => handleEditUser(u)} className="btn-nb bg-nb-yellow text-black px-3 py-1 text-xs">Edit</button>
                           </td>
                         </tr>
                       ))}
                       {userList.length === 0 && <tr><td colSpan={4} className="p-6 text-center font-bold">Belum ada data user.</td></tr>}
                     </tbody>
                   </table>
                 </div>
                 <Pagination totalItems={userList.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
