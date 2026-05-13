import { useState, useEffect } from 'react';
import { Users, UserX, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ activeGuests: 0, todayGuests: 0 });
  const [activeGuests, setActiveGuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We can just listen to the whole collection for simplicity in this small app
    // or specifically listen to today's guests and active guests
    const q = query(
      collection(db, 'guests'), 
      orderBy('check_in_time', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let activeCount = 0;
      let todayCount = 0;
      const activeList: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const checkIn = new Date(data.check_in_time);
        
        if (checkIn >= today) {
          todayCount++;
        }

        if (data.status === 'Aktif') {
          activeCount++;
          activeList.push({ id: doc.id, ...data });
        }
      });

      setStats({ activeGuests: activeCount, todayGuests: todayCount });
      setActiveGuests(activeList);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckOut = async (id: string) => {
    try {
      await updateDoc(doc(db, 'guests', id), {
        status: 'Selesai',
        check_out_time: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      alert('Gagal check-out tamu');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Real-time</h1>
        <p className="text-sm text-gray-500 mt-1">Sistem Informasi Buku Tamu Digital Lapas Kediri</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                <Users className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Kunjungan Hari Ini</dt>
                  <dd className="text-3xl font-semibold text-gray-900 mt-1">{stats.todayGuests}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                <Clock className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tamu Aktif Saat Ini</dt>
                  <dd className="text-3xl font-semibold text-gray-900 mt-1">{stats.activeGuests}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Tamu Aktif</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Real-time Updates
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warga Binaan & Asal Instansi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Masuk</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Memuat data...</td>
                </tr>
              ) : activeGuests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Tidak ada tamu yang sedang berkunjung.
                  </td>
                </tr>
              ) : (
                activeGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {guest.photo_url ? (
                            <img className="h-10 w-10 object-cover" src={guest.photo_url} alt="" />
                          ) : (
                            <UserX className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                          <div className="text-sm text-gray-500">{guest.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.inmate_name}</div>
                      <div className="text-sm text-gray-500">{guest.relationship}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{guest.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(guest.check_in_time), 'HH:mm - dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleCheckOut(guest.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        Check-out
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
