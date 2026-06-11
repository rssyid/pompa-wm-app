"use client";

import { useState } from "react";
import Papa from "papaparse";
import Link from "next/link";

export default function BulkUploadPage() {
  const [estateFile, setEstateFile] = useState<File | null>(null);
  const [asetFile, setAsetFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string; errors?: string[] } | null>(null);

  const handleUpload = async (file: File | null, type: "estate" | "aset") => {
    if (!file) {
      setResult({ type: "error", msg: "Pilih file CSV terlebih dahulu." });
      return;
    }

    setLoading(true);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.data.length === 0) {
          setResult({ type: "error", msg: "File CSV kosong atau tidak bisa dibaca." });
          setLoading(false);
          return;
        }

        // Validasi Header Dasar
        const firstRow = results.data[0] as any;
        const headers = Object.keys(firstRow).map(k => k.replace(/^\uFEFF/, '').trim());
        
        if (type === "estate" && (!headers.includes("estate_code") || !headers.includes("estate_name"))) {
          setResult({ type: "error", msg: "Format salah! File harus memiliki kolom 'estate_code' dan 'estate_name'." });
          setLoading(false);
          return;
        }
        if (type === "aset" && (!headers.includes("asset_code") || !headers.includes("asset_name") || !headers.includes("est_code"))) {
          setResult({ type: "error", msg: "Format salah! File harus memiliki kolom 'asset_code', 'asset_name', dan 'est_code'. Jika Anda menggunakan Excel, pastikan file disimpan sebagai 'CSV (Comma delimited)' bukan titik koma (;)." });
          setLoading(false);
          return;
        }

        try {
          const res = await fetch("/api/bulk-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, data: results.data }),
          });
          const data = await res.json();
          if (res.ok) {
            setResult({
              type: "success",
              msg: data.message,
              errors: data.errors,
            });
            // Reset file input
            if (type === "estate") setEstateFile(null);
            if (type === "aset") setAsetFile(null);
          } else {
            setResult({ type: "error", msg: data.error });
          }
        } catch (err: any) {
          setResult({ type: "error", msg: "Terjadi kesalahan jaringan." });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setResult({ type: "error", msg: `Gagal membaca CSV: ${error.message}` });
        setLoading(false);
      },
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
            📤 Bulk Upload
          </h1>
          <div className="h-2 bg-nb-purple border-2 border-black mt-2 w-48" />
        </div>
        <Link href="/dashboard/master" className="btn-nb bg-white text-black px-4 py-2 text-sm font-black">
          ← Kembali ke Master Data
        </Link>
      </div>

      <div className="bg-nb-yellow border-4 border-black p-4 mb-8 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        💡 <strong>INFO PENTING:</strong> Pastikan format kolom header di baris pertama CSV Anda sama persis dengan template yang diminta. 
        Tipe Pompa sengaja dibiarkan kosong untuk saat ini dan dapat Anda update nanti di halaman Master Data.
      </div>

      {result && (
        <div className={`border-4 border-black p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${result.type === "success" ? "bg-nb-green" : "bg-nb-red text-white"}`}>
          <div className="font-black text-lg mb-2">{result.type === "success" ? "✅ Berhasil" : "❌ Gagal"}</div>
          <div>{result.msg}</div>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-2 text-xs bg-black/10 p-2 rounded max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => <div key={i}>- {e}</div>)}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Estate */}
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="text-xl font-black text-black dark:text-white mb-2 uppercase">1. Upload Estate</h2>
          <p className="text-sm font-bold text-black/70 dark:text-white/70 mb-4">
            Upload daftar estate Anda. Jika kode sudah ada, sistem akan melakukan update otomatis (upsert).
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 text-xs font-mono border-2 border-black mb-4 overflow-x-auto whitespace-pre">
            estate_code,estate_name,company_code,region<br/>
            KMP,Kempas,WM,Riau<br/>
            EBN,Eboni,WM,Riau
          </div>
          
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setEstateFile(e.target.files?.[0] || null)}
            className="block w-full text-sm font-bold text-black file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-nb-pink file:text-black file:font-black hover:file:bg-nb-pink/80 mb-4 cursor-pointer"
          />
          <button 
            onClick={() => handleUpload(estateFile, "estate")}
            disabled={!estateFile || loading}
            className="btn-nb bg-black text-white w-full py-3 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "⏳ Memproses..." : "🚀 Upload Estate.csv"}
          </button>
        </div>

        {/* Upload Aset Pompa */}
        <div className="border-4 border-black bg-white dark:bg-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="text-xl font-black text-black dark:text-white mb-2 uppercase">2. Upload Aset Pompa</h2>
          <p className="text-sm font-bold text-black/70 dark:text-white/70 mb-4">
            Upload daftar pompa. Pastikan kode estate sudah terdaftar di sistem. Kolom tipe pompa sengaja dihilangkan.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 text-xs font-mono border-2 border-black mb-4 overflow-x-auto whitespace-pre">
            asset_code,asset_name,est_code,tahun_perolehan,kondisi_terkini<br/>
            R1-AD-16,TH3BWTP01202,KMP,2023,baik<br/>
            R1-AD-24,TH3GWTP01158,EBN,2021,baik
          </div>
          
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setAsetFile(e.target.files?.[0] || null)}
            className="block w-full text-sm font-bold text-black file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-nb-cyan file:text-black file:font-black hover:file:bg-nb-cyan/80 mb-4 cursor-pointer"
          />
          <button 
            onClick={() => handleUpload(asetFile, "aset")}
            disabled={!asetFile || loading}
            className="btn-nb bg-black text-white w-full py-3 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "⏳ Memproses..." : "🚀 Upload Aset_Pompa.csv"}
          </button>
        </div>
      </div>
    </div>
  );
}
