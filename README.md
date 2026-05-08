## 📖 Panduan Penggunaan Sistem

Sistem ini dirancang dengan antarmuka yang intuitif untuk memudahkan dua tipe pengguna:

### 1. Bagi Pengunjung (Alur Pendaftaran)
Berikut adalah langkah-langkah bagi pengunjung untuk melakukan pendaftaran kunjungan:
1. **Pindai QR Code**: Gunakan kamera ponsel atau aplikasi pemindai QR yang tersedia di area pendaftaran Lapas Kediri.
2. **Pengisian Formulir**: Anda akan diarahkan ke halaman web formulir. Isi data diri dengan lengkap:
   - NIK & Nama Lengkap.
   - Alamat & No. HP aktif.
   - Nama Warga Binaan yang ingin ditemui.
   - Hubungan & Tujuan kunjungan.
3. **Submit**: Klik tombol "Simpan/Kirim". Data Anda akan masuk ke sistem secara otomatis.
4. **Verifikasi**: Lapor ke petugas loket bahwa Anda sudah mengisi buku tamu digital untuk verifikasi fisik.

---

### 2. Bagi Petugas/Admin (Alur Manajemen)
Petugas dapat mengakses dashboard melalui perangkat komputer atau tablet petugas:

#### A. Memantau Tamu Aktif
1. Masuk ke halaman **Dashboard Utama**.
2. Lihat pada bagian **"Tamu Aktif Hari Ini"**. Semua pengunjung yang baru mengisi form akan muncul di sini secara *real-time*.
3. Status "Aktif" menandakan pengunjung masih berada di area Lapas.

#### B. Proses Check-Out
1. Saat pengunjung selesai berkunjung dan akan meninggalkan Lapas, petugas mencari nama pengunjung tersebut di tabel.
2. Klik tombol **"Check-Out"** pada kolom aksi.
3. Sistem akan otomatis mencatat waktu keluar dan memindahkan data tamu tersebut ke dalam folder **Riwayat**.

#### C. Rekapitulasi & Laporan (Ekspor Data)
1. Buka menu **Riwayat Kunjungan / Laporan**.
2. Gunakan fitur **Filter Waktu** untuk menentukan periode laporan (contoh: Mingguan atau Bulanan).
3. Klik tombol **"Export to Excel"** untuk keperluan administrasi kantor atau klik **"Export to PDF"** untuk laporan yang siap cetak.

---

## 🛠️ Catatan Teknis untuk Admin
- **Update QR Code**: Jika link domain berubah, pastikan untuk meng-generate ulang QR Code melalui menu `Settings` atau menggunakan generator eksternal yang mengarah ke URL pendaftaran.
- **Pembersihan Data**: Disarankan untuk melakukan *backup* database setiap akhir tahun demi menjaga performa aplikasi.
