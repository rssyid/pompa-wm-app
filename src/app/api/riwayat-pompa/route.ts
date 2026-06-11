import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset_code = searchParams.get("asset_code");

  if (!asset_code) {
    return NextResponse.json(
      { error: "Parameter asset_code wajib diisi." },
      { status: 400 }
    );
  }

  try {
    // 1. Info aset terkini
    const asetResult = await pool.query(
      `SELECT
        a.asset_code,
        a.asset_name,
        a.kondisi_terkini,
        a.tahun_perolehan,
        t.jenis_pompa,
        t.merek,
        e1.estate_name AS estate_asal,
        e2.estate_name AS estate_deployed_name,
        (SELECT block_tujuan FROM trn_mutasi_pompa m WHERE m.asset_code = a.asset_code ORDER BY m.tgl_pindah DESC, m.id_mutasi DESC LIMIT 1) AS block_deployed
       FROM trn_aset_pompa a
       LEFT JOIN mst_tipe_pompa t ON a.id_tipe = t.id_tipe
       LEFT JOIN mst_estate e1 ON a.est_code = e1.estate_code
       LEFT JOIN mst_estate e2 ON a.est_code_deployed = e2.estate_code
       WHERE a.asset_code = $1`,
      [asset_code]
    );

    if (asetResult.rows.length === 0) {
      return NextResponse.json({ error: "Aset tidak ditemukan." }, { status: 404 });
    }

    const aset = asetResult.rows[0];

    // 2. Riwayat Mutasi
    const mutasiResult = await pool.query(
      `SELECT
        m.id_mutasi,
        m.tgl_pindah AS tanggal,
        m.estate_tujuan,
        e.estate_name AS estate_tujuan_name,
        m.block_tujuan,
        u.username AS pic_name
       FROM trn_mutasi_pompa m
       JOIN mst_estate e ON m.estate_tujuan = e.estate_code
       LEFT JOIN mst_user u ON m.user_id_pic = u.id_user
       WHERE m.asset_code = $1
       ORDER BY m.tgl_pindah DESC, m.id_mutasi DESC`,
      [asset_code]
    );

    // 3. Riwayat Inspeksi (beserta issues)
    const inspeksiResult = await pool.query(
      `SELECT
        i.id_inspeksi,
        i.tgl_inspeksi AS tanggal,
        i.estate_code,
        e.estate_name,
        i.block,
        i.catatan,
        u.username AS inspektur_name,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id_issue', iss.id_issue,
            'nama_kerusakan', k.nama_kerusakan,
            'kategori', k.kategori
          )), '[]'::json)
          FROM trn_issue_pompa iss
          JOIN mst_jenis_kerusakan k ON iss.id_kerusakan = k.id_kerusakan
          WHERE iss.id_inspeksi_open = i.id_inspeksi
        ) AS issues_opened,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id_issue', iss.id_issue,
            'nama_kerusakan', k.nama_kerusakan,
            'kategori', k.kategori
          )), '[]'::json)
          FROM trn_issue_pompa iss
          JOIN mst_jenis_kerusakan k ON iss.id_kerusakan = k.id_kerusakan
          WHERE iss.id_inspeksi_close = i.id_inspeksi
        ) AS issues_solved
       FROM trn_inspeksi i
       JOIN mst_estate e ON i.estate_code = e.estate_code
       LEFT JOIN mst_user u ON i.user_id_inspektur = u.id_user
       WHERE i.asset_code = $1
       ORDER BY i.tgl_inspeksi DESC, i.id_inspeksi DESC`,
      [asset_code]
    );

    // 4. Gabungkan menjadi event timeline
    const events: any[] = [];

    // Tambahkan event mutasi
    for (const m of mutasiResult.rows) {
      events.push({
        type: "mutasi",
        tanggal: m.tanggal,
        id: `mutasi-${m.id_mutasi}`,
        estate_tujuan_name: m.estate_tujuan_name,
        estate_tujuan: m.estate_tujuan,
        block_tujuan: m.block_tujuan,
        pic_name: m.pic_name,
        catatan: null,
      });
    }

    // Tambahkan event inspeksi
    for (const i of inspeksiResult.rows) {
      const hasNewIssues = i.issues_opened && i.issues_opened.length > 0;
      const hasSolvedIssues = i.issues_solved && i.issues_solved.length > 0;

      events.push({
        type: "inspeksi",
        tanggal: i.tanggal,
        id: `inspeksi-${i.id_inspeksi}`,
        estate_name: i.estate_name,
        block: i.block,
        inspektur_name: i.inspektur_name,
        catatan: i.catatan,
        issues_opened: i.issues_opened || [],
        issues_solved: i.issues_solved || [],
        subtype: hasNewIssues
          ? "kerusakan"
          : hasSolvedIssues
          ? "selesai"
          : "normal",
      });
    }

    // Urutkan semua event by tanggal DESC
    events.sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    return NextResponse.json({
      aset,
      events,
      total_events: events.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
