import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function VisitorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoBase64(dataUrl);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      nik: formData.get('nik') as string,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      inmate_name: formData.get('inmate_name') as string,
      relationship: formData.get('relationship') as string,
      purpose: formData.get('purpose') as string,
      photo_url: photoBase64,
      status: 'Aktif',
      check_in_time: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'guests'), data);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan ke database Firebase. Pastikan koneksi internet Anda lancar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Pendaftaran Berhasil!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Anda telah berhasil didaftarkan sebagai pengunjung aktif.
            Silakan tunjukkan layar ini kepada petugas Lapas Kediri.
          </p>
          <div className="mt-8">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none"
            >
              Daftarkan Pengunjung Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Formulir Kunjungan</h1>
        <p className="mt-2 text-gray-500 text-sm">Lembaga Pemasyarakatan Kediri</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-xl border border-gray-100 rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2">Informasi Pengunjung</h3>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nik" className="block text-sm font-medium text-gray-700">Nomor Induk Kependudukan (NIK)</label>
              <div className="mt-1">
                <input required type="text" name="nik" id="nik" maxLength={16} placeholder="16 Digit NIK KTP Anda" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap (Sesuai KTP)</label>
              <div className="mt-1">
                <input required type="text" name="name" id="name" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
              <div className="mt-1">
                <textarea required id="address" name="address" rows={2} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor HP / WhatsApp Aktif</label>
              <div className="mt-1">
                <input required type="tel" name="phone" id="phone" placeholder="08xxxxxxxxxx" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Foto Wajah / KTP (Opsional)</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {photoBase64 ? (
                    <div className="mb-4">
                      <img src={photoBase64} alt="Preview" className="mx-auto h-32 object-cover rounded-md" />
                      <button type="button" onClick={() => setPhotoBase64(null)} className="mt-2 text-sm text-red-600 hover:text-red-500">Hapus Foto</button>
                    </div>
                  ) : (
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="photo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload file atau ambil gambar</span>
                      <input id="photo-upload" name="photo-upload" type="file" accept="image/*" className="sr-only" ref={fileInputRef} onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF max 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2">Detail Kunjungan</h3>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="inmate_name" className="block text-sm font-medium text-gray-700">Nama Warga Binaan Pemasyarakatan (WBP) yang Dituju</label>
              <div className="mt-1">
                <input required type="text" name="inmate_name" id="inmate_name" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2" />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Status Hubungan</label>
              <div className="mt-1">
                <select required id="relationship" name="relationship" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Pilih hubungan...</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Suami/Istri">Suami/Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Saudara Kandung">Saudara Kandung</option>
                  <option value="Teman/Kerabat">Teman/Kerabat</option>
                  <option value="Kuasa Hukum">Kuasa Hukum</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Tujuan Kunjungan</label>
              <div className="mt-1">
                <textarea required id="purpose" name="purpose" rows={3} placeholder="Contoh: Menjenguk dan membawakan makanan" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "ml-3 inline-flex justify-center py-3 px-6 shadow-sm text-sm font-medium rounded-md text-white border border-transparent transition-colors w-full sm:w-auto",
                isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              )}
            >
              {isSubmitting ? 'Memproses Data...' : 'Kirim Formulir Pendaftaran'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
