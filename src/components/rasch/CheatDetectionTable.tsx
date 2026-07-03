import { useState } from "react";
import { SeatingCheatingResult, TempatDuduk } from "../../lib/rasch/types";
import { AlertOctagon, HelpCircle, UserCheck, Search, Users, MapPin, Grid } from "lucide-react";

interface CheatDetectionTableProps {
  cheating: SeatingCheatingResult[];
  seats: Record<string, TempatDuduk>;
}

export default function CheatDetectionTable({ cheating, seats }: CheatDetectionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [onlySuspicious, setOnlySuspicious] = useState(false);

  const hasSeats = Object.keys(seats).length > 0;

  const filteredCheating = cheating.filter((ch) => {
    const matchSearch = 
      ch.nama1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.nama2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.nis1.includes(searchTerm) ||
      ch.nis2.includes(searchTerm);
    
    const matchSuspicious = !onlySuspicious || ch.isSuspicious;
    
    return matchSearch && matchSuspicious;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 my-6" id="cheat-detection-section">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertOctagon className="h-6 w-6 text-red-500 shrink-0" />
            Deteksi Pola Kecurangan Spasial (Seating Analysis)
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Menganalisis kemiripan pola jawaban salah yang ekstrem di antara pasangan siswa yang duduk bersebelahan.</p>
        </div>

        {hasSeats && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 w-44"
              />
            </div>
            
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlySuspicious}
                onChange={(e) => setOnlySuspicious(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              Tampilkan Hanya Dugaan Kuat
            </label>
          </div>
        )}
      </div>

      {!hasSeats ? (
        // Tutorial Guide when Seating Sheet is Empty
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl max-w-2xl mx-auto my-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Grid className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-slate-800 font-bold text-sm mb-1">
                Aktifkan Analisis Seating (Peta Tempat Duduk)
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Anda belum menyertakan data peta tempat duduk siswa, sehingga deteksi kecurangan spasial tidak dapat dihitung secara presisi. Fitur ini sangat andal untuk mendeteksi tindakan saling menyontek antar tetangga terdekat.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4">
            <span className="font-bold text-slate-700 text-xs block mb-2">Cara Mengaktifkan di Excel Template:</span>
            <p className="text-slate-500 text-xs mb-3">
              Tambahkan sheet baru bernama <code className="bg-slate-200 px-1 py-0.5 rounded font-bold text-rose-600">tempat_duduk</code> dengan struktur kolom sebagai berikut:
            </p>
            
            <div className="overflow-x-auto rounded border border-slate-200 bg-white mb-4">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200">nis</th>
                    <th className="p-2 border-r border-slate-200">baris</th>
                    <th className="p-2 border-r border-slate-200">kolom</th>
                    <th className="p-2">ruang</th>
                  </tr>
                </thead>
                <tbody className="text-slate-500">
                  <tr className="border-b border-slate-100">
                    <td className="p-2 border-r border-slate-200">2024001</td>
                    <td className="p-2 border-r border-slate-200">1</td>
                    <td className="p-2 border-r border-slate-200">1</td>
                    <td className="p-2">Lab Fisika 1</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200">2024002</td>
                    <td className="p-2 border-r border-slate-200">1</td>
                    <td className="p-2 border-r border-slate-200">2</td>
                    <td className="p-2">Lab Fisika 1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-slate-400 text-[10px] leading-normal flex items-start gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
              Sistem akan memetakan koordinat baris dan kolom untuk mengidentifikasi siapa saja yang duduk bersebelahan (tetangga horisontal, vertikal, maupun diagonal) dan membandingkan kemiripan pilihan jawaban salah mereka secara otomatis.
            </p>
          </div>
        </div>
      ) : (
        // Cheating analysis table
        <div>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Tetangga Teranalisis</span>
              <span className="text-xl font-bold text-slate-800 block mt-1">{cheating.length} pasangan</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dugaan Kuat (&gt;70% salah sama)</span>
              <span className="text-xl font-bold text-red-600 block mt-1">
                {cheating.filter(c => c.isSuspicious).length} pasangan
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tingkat Integritas Kelas</span>
              <span className="text-xl font-bold text-emerald-600 block mt-1">
                {cheating.filter(c => c.isSuspicious).length === 0 ? "Sangat Tinggi" : cheating.filter(c => c.isSuspicious).length <= 2 ? "Tinggi / Normal" : "Perlu Perhatian"}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-semibold text-[11px] border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Siswa A (Posisi)</th>
                  <th className="py-3.5 px-4">Siswa B (Posisi)</th>
                  <th className="py-3.5 px-4 text-center">Ruang</th>
                  <th className="py-3.5 px-4 text-center">Jarak Seating</th>
                  <th className="py-3.5 px-4 text-center">Irisan Salah</th>
                  <th className="py-3.5 px-4 text-center">Salah Sama</th>
                  <th className="py-3.5 px-4 text-center">Kemiripan Pilihan Salah</th>
                  <th className="py-3.5 px-4 text-center">Indikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredCheating.length > 0 ? (
                  filteredCheating.map((ch, idx) => (
                    <tr 
                      key={`cheat-${idx}`} 
                      className={`hover:bg-slate-50/50 transition-colors ${ch.isSuspicious ? "bg-red-50/20" : ""}`}
                    >
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-900 block">{ch.nama1}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{ch.nis1} | {ch.posisi1}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-900 block">{ch.nama2}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{ch.nis2} | {ch.posisi2}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {ch.ruang}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-500">
                        {ch.jarakManhattan === 1 ? "Bersebelahan" : "Diagonal (Dekat)"}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-500">
                        {ch.commonWrongSiswa} soal
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                        {ch.wrongMatchesCount} soal
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`font-mono font-extrabold ${ch.isSuspicious ? "text-red-600" : "text-slate-800"}`}>
                            {ch.sharedIncorrectPct.toFixed(1)}%
                          </span>
                          <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full rounded-full ${ch.isSuspicious ? "bg-red-500" : "bg-slate-400"}`} 
                              style={{ width: `${ch.sharedIncorrectPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {ch.isSuspicious ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded bg-rose-100 text-rose-800 uppercase tracking-wider animate-pulse border border-rose-200">
                            Mencurigakan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-800 uppercase">
                            Wajar / Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                      {onlySuspicious ? "Tidak terdeteksi pasangan yang dicurigai (Kelas Terindikasi Aman)." : "Tidak ada pasangan siswa terdekat."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-rose-50/30 rounded-lg flex items-start gap-3 border border-rose-100/30">
            <AlertOctagon className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="text-[11px] leading-relaxed text-slate-600">
              <span className="font-bold text-rose-900 block mb-1">Penting untuk Diperhatikan Guru:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Logika Deteksi:</strong> Analisis ini TIDAK menilai persentase total jawaban yang sama, melainkan <strong>persentase kesamaan opsi pada jawaban yang salah (Incorrect Option Matches)</strong>.</li>
                <li><strong>Mengapa Jawaban Salah?</strong> Dua siswa pintar yang jujur akan memiliki banyak kesamaan jawaban BENAR karena memang menguasai materi. Namun, dua siswa yang saling menyontek akan memiliki kesamaan ekstrem pada <strong>opsi salah yang dipilih secara spesifik</strong> (misal, sama-sama memilih distractor 'C' pada nomor 12).</li>
                <li><strong>Indikator Flag:</strong> Pasangan dituduh mencurigakan apabila jarak duduk bersebelahan, memiliki minimal 3 irisan jawaban salah, dan presentase kesamaan opsi salahnya <strong>&gt; 70%</strong>. Gunakan indikator ini secara bijaksana sebagai referensi pendukung, bukan tuduhan mutlak.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
