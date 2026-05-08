# SISTEM BUKU TAMU DIGITAL BERBASIS QR CODE (LAPAS KEDIRI)

Inovasi sistem administrasi kunjungan di **Lapas Kelas IIA Kediri** untuk mempercepat proses pendataan tamu, meningkatkan akurasi data, dan menyediakan pelaporan real-time yang efisien.

## 🌟 Fitur Utama

- **Self-Registration QR Code**: Pengunjung cukup memindai QR Code di area pendaftaran untuk mengisi formulir digital.
- **Dashboard Real-time**: Monitor jumlah pengunjung aktif dan total kunjungan harian secara langsung.
- **Manajemen Tamu Aktif**: Petugas dapat melakukan proses *check-out* pengunjung dengan satu klik.
- **Riwayat & Laporan**: Filter data kunjungan berdasarkan rentang waktu (Hari/Minggu/Bulan/Tahun).
- **Ekspor Data**: Mendukung ekspor laporan ke format **Excel (.xlsx)** dan **PDF**.

## 🛠️ Stack Teknologi

- **Backend**: Python (Flask / FastAPI)
- **Database**: SQLite (Default) / PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (Bootstrap 5)
- **Library Pendukung**: 
    - `qrcode`: Untuk pembuatan QR Code.
    - `pandas` & `openpyxl`: Untuk pengolahan data dan ekspor Excel.
    - `WeasyPrint` / `ReportLab`: Untuk generate laporan PDF.

## 📂 Struktur Proyek

```text
lapas-kediri-guestbook/
├── app/
│   ├── static/          # CSS, JS, Images
│   ├── templates/       # HTML Files (index, dashboard, report)
│   ├── models.py        # Database Schema
│   ├── routes.py        # Logika API & Routing
│   └── utils.py         # Fungsi Export & QR Generator
├── exports/             # Folder hasil download Excel/PDF
├── app.py               # Main Entry Point
├── requirements.txt     # Daftar Library
└── README.md
