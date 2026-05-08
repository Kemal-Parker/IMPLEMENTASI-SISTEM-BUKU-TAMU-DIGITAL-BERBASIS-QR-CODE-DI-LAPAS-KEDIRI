import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { ArrowRight, Printer } from 'lucide-react';

export default function QRCodePage() {
  const checkInUrl = `${window.location.origin}/form`;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pendaftaran Kunjungan</h1>
      <p className="text-gray-500 mb-10">Scan QR Code di bawah ini untuk mengisi formulir pendaftaran kunjungan Lapas Kediri</p>
      
      <div className="flex justify-center mb-10">
        <div className="p-4 bg-white border-4 border-indigo-600 rounded-xl inline-block shadow-lg">
          <QRCodeSVG 
            value={checkInUrl} 
            size={250}
            level={"H"}
            includeMargin={true}
          />
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <h3 className="font-semibold text-gray-900 mb-2">Instruksi untuk Pengunjung:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Buka aplikasi kamera atau pemindai QR Code di HP Anda.</li>
          <li>Arahkan kamera ke QR Code di atas.</li>
          <li>Klik tautan atau notifikasi yang muncul di layar HP.</li>
          <li>Isi formulir Kunjungan dengan lengkap.</li>
          <li>Tunjukkan layar konfirmasi ke petugas setelah selesai mengisi.</li>
        </ol>
      </div>

      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak QR Code
        </button>
        <Link 
          to="/form"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          Lihat Halaman Form
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
