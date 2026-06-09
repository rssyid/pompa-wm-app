-- ============================================================
-- POMPA WM APP - Database Schema
-- Target: Neon PostgreSQL
-- ============================================================

-- Hapus tabel lama jika ada (urutan terbalik karena FK)
DROP TABLE IF EXISTS trn_inspeksi CASCADE;
DROP TABLE IF EXISTS trn_mutasi_pompa CASCADE;
DROP TABLE IF EXISTS trn_aset_pompa CASCADE;
DROP TABLE IF EXISTS mst_jenis_kerusakan CASCADE;
DROP TABLE IF EXISTS mst_tipe_pompa CASCADE;
DROP TABLE IF EXISTS mst_estate CASCADE;
DROP TABLE IF EXISTS mst_user CASCADE;

-- ============================================================
-- 1. MASTER TABLES (tidak ada FK ke tabel lain)
-- ============================================================

-- Tabel User
CREATE TABLE mst_user (
    id_user       SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL DEFAULT 'operator'
);

-- Tabel Estate
CREATE TABLE mst_estate (
    estate_code   VARCHAR(10)  PRIMARY KEY,
    estate_name   VARCHAR(100) NOT NULL,
    company_code  VARCHAR(10),
    region        VARCHAR(50)
);

-- Tabel Tipe Pompa
CREATE TABLE mst_tipe_pompa (
    id_tipe          SERIAL PRIMARY KEY,
    jenis_pompa      VARCHAR(50)  NOT NULL,
    merek            VARCHAR(50),
    mesin_penggerak  VARCHAR(50),
    nama_vendor      VARCHAR(100),
    debit_m3_jam     NUMERIC(10,2),
    hp_mesin         NUMERIC(10,2)
);

-- Tabel Jenis Kerusakan
CREATE TABLE mst_jenis_kerusakan (
    id_kerusakan     SERIAL PRIMARY KEY,
    nama_kerusakan   VARCHAR(100) NOT NULL,
    kategori         VARCHAR(50)
);

-- ============================================================
-- 2. TRANSACTION TABLES (memiliki FK ke master tables)
-- ============================================================

-- Tabel Aset Pompa
CREATE TABLE trn_aset_pompa (
    asset_code          VARCHAR(30) PRIMARY KEY,
    asset_name          VARCHAR(100) NOT NULL,
    id_tipe             INTEGER      NOT NULL,
    est_code            VARCHAR(10)  NOT NULL,
    est_code_deployed   VARCHAR(10),
    tahun_perolehan     INTEGER,
    kondisi_terkini     VARCHAR(30)  DEFAULT 'baik',

    CONSTRAINT fk_aset_tipe
        FOREIGN KEY (id_tipe)
        REFERENCES mst_tipe_pompa (id_tipe)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_aset_estate
        FOREIGN KEY (est_code)
        REFERENCES mst_estate (estate_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_aset_estate_deployed
        FOREIGN KEY (est_code_deployed)
        REFERENCES mst_estate (estate_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- Tabel Mutasi Pompa
CREATE TABLE trn_mutasi_pompa (
    id_mutasi       SERIAL PRIMARY KEY,
    asset_code      VARCHAR(30) NOT NULL,
    estate_tujuan   VARCHAR(10) NOT NULL,
    block_tujuan    VARCHAR(30),
    tgl_pindah      DATE        NOT NULL DEFAULT CURRENT_DATE,
    user_id_pic     INTEGER,

    CONSTRAINT fk_mutasi_aset
        FOREIGN KEY (asset_code)
        REFERENCES trn_aset_pompa (asset_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_mutasi_estate_tujuan
        FOREIGN KEY (estate_tujuan)
        REFERENCES mst_estate (estate_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_mutasi_user
        FOREIGN KEY (user_id_pic)
        REFERENCES mst_user (id_user)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- Tabel Inspeksi
CREATE TABLE trn_inspeksi (
    id_inspeksi       SERIAL PRIMARY KEY,
    asset_code        VARCHAR(30) NOT NULL,
    tgl_inspeksi      DATE        NOT NULL DEFAULT CURRENT_DATE,
    estate_code       VARCHAR(10) NOT NULL,
    block             VARCHAR(30),
    id_kerusakan      INTEGER,
    catatan           TEXT,
    user_id_inspektur INTEGER,

    CONSTRAINT fk_inspeksi_aset
        FOREIGN KEY (asset_code)
        REFERENCES trn_aset_pompa (asset_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_inspeksi_estate
        FOREIGN KEY (estate_code)
        REFERENCES mst_estate (estate_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_inspeksi_kerusakan
        FOREIGN KEY (id_kerusakan)
        REFERENCES mst_jenis_kerusakan (id_kerusakan)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_inspeksi_user
        FOREIGN KEY (user_id_inspektur)
        REFERENCES mst_user (id_user)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- 3. INDEXES untuk performa query
-- ============================================================
CREATE INDEX idx_aset_est_code          ON trn_aset_pompa (est_code);
CREATE INDEX idx_aset_est_deployed      ON trn_aset_pompa (est_code_deployed);
CREATE INDEX idx_aset_tipe              ON trn_aset_pompa (id_tipe);
CREATE INDEX idx_mutasi_asset           ON trn_mutasi_pompa (asset_code);
CREATE INDEX idx_mutasi_estate_tujuan   ON trn_mutasi_pompa (estate_tujuan);
CREATE INDEX idx_mutasi_tgl             ON trn_mutasi_pompa (tgl_pindah);
CREATE INDEX idx_inspeksi_asset         ON trn_inspeksi (asset_code);
CREATE INDEX idx_inspeksi_estate        ON trn_inspeksi (estate_code);
CREATE INDEX idx_inspeksi_tgl           ON trn_inspeksi (tgl_inspeksi);
