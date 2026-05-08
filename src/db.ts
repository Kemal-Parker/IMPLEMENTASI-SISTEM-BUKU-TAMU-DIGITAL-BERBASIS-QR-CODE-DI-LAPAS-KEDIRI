import path from 'path';
import Database from 'better-sqlite3';

// Ensure the db file is stored in a persistent or accessible location
// For AI Studio, storing it in the project root is standard.
const dbPath = path.resolve(process.cwd(), 'lapas.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Provide basic tables
db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nik TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    inmate_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    purpose TEXT NOT NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'Aktif',
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME
  );
`);

export interface Guest {
  id: number;
  nik: string;
  name: string;
  address: string;
  phone: string;
  inmate_name: string;
  relationship: string;
  purpose: string;
  photo_url?: string;
  status: 'Aktif' | 'Selesai';
  check_in_time: string;
  check_out_time?: string;
}
