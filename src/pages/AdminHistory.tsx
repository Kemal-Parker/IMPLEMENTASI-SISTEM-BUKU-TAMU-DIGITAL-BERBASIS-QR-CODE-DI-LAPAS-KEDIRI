import { useState, useEffect } from 'react';
import { Download, Search, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';

export default function AdminHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'guests'), 
      where('status', '==', 'Selesai')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Firestore requires compounding indexes for ordering with equality filter 
      // where + orderby requires an index. So we just sort in memory since it's simple
      data.sort((a: any, b: any) => new Date(b.check_out_time).getTime() - new Date(a.check_out_time).getTime());
      
      setHistory(data);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data riwayat ini secara permanen?")) {
      return;
    }
    
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'guests', id));
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV in client
    const headers = ['NIK', 'Nama', 'Alamat', 'No HP', 'WBP Dituju', 'Asal Instansi', 'Tujuan', 'Waktu Masuk', 'Waktu Keluar', 'Foto (Base64)'];
    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };
    
    const rows = filteredHistory.map(g => [
      g.nik, g.name, g.address, g.phone, g.inmate_name, g.relationship, g.purpose, g.check_in_time, g.check_out_time, g.photo_url ? "Ada (Base64 Data)" : "Tidak Ada"
    ].map(escapeCsv).join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'riwayat_tamu.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.text('Aplikasi Buku Tamu Digital', 14, 15);
    doc.text('Laporan Riwayat Berita Acara Kunjungan Lapas Kediri', 14, 22);

    const tableColumn = ["Foto", "Nama", "NIK", "WBP Dituju", "Masuk", "Keluar", "Asal Instansi"];
    const tableRows = filteredHistory.map(guest => [
      guest.photo_url ? "" : "-",
      guest.name,
      guest.nik,
      guest.inmate_name,
      format(new Date(guest.check_in_time), 'dd/MM/yyyy HH:mm'),
      guest.check_out_time ? format(new Date(guest.check_out_time), 'dd/MM/yyyy HH:mm') : '-',
      guest.relationship
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      bodyStyles: { minCellHeight: 15 },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.section === 'body') {
          const guest = filteredHistory[data.row.index];
          if (guest && guest.photo_url) {
            try {
              const imgFormat = guest.photo_url.substring(guest.photo_url.indexOf(':') + 1, guest.photo_url.indexOf(';')).split('/')[1].toUpperCase();
              doc.addImage(guest.photo_url, imgFormat, data.cell.x + 2, data.cell.y + 2, 11, 11);
            } catch(e) {
              console.error(e);
            }
          }
        }
      }
    });

    doc.save(`Laporan_Kunjungan_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

  // Filter logic
  const filteredHistory = history.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(search.toLowerCase()) || 
                          guest.inmate_name.toLowerCase().includes(search.toLowerCase());
                          
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    
    const checkInDate = new Date(guest.check_in_time);
    const today = new Date();
    
    // reset times for day comparisons
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (filter === 'today') {
      return checkInDate >= todayMidnight;
    }
    if (filter === 'week') {
      const oneWeekAgo = new Date(todayMidnight.getTime() - 7 * 24 * 60 * 60 * 1000);
      return checkInDate >= oneWeekAgo;
    }
    if (filter === 'month') {
      const oneMonthAgo = new Date(todayMidnight.getTime() - 30 * 24 * 60 * 60 * 1000);
      return checkInDate >= oneMonthAgo;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Kunjungan</h1>
          <p className="text-sm text-gray-500 mt-1">Laporan tamu yang telah selesai berkunjung.</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Excel/CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Cari nama tamu atau WBP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      <div className="bg-white px-4 py-5 sm:p-6 shadow-sm rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warga Binaan & Asal Instansi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Masuk</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Keluar</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    Tidak ada riwayat kunjungan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {guest.photo_url ? (
                            <img className="h-10 w-10 object-cover" src={guest.photo_url} alt="" />
                          ) : (
                            <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                          <div className="text-sm text-gray-500">NIK: {guest.nik}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.inmate_name}</div>
                      <div className="text-sm text-gray-500">{guest.relationship}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-1">{guest.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(guest.check_in_time), 'HH:mm - dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.check_out_time 
                        ? format(new Date(guest.check_out_time), 'HH:mm - dd MMM yyyy')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(guest.id)}
                        disabled={isDeleting === guest.id}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Hapus Kunjungan"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
