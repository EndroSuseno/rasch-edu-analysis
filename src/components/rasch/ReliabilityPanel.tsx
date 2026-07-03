import { RaschSummary } from "../../lib/rasch/types";
import { CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Activity } from "lucide-react";

interface ReliabilityPanelProps {
  summary: RaschSummary;
}

export default function ReliabilityPanel({ summary }: ReliabilityPanelProps) {
  const { personSeparationReliability: psr, itemReliability: ir, cronbachAlpha: ca } = summary;

  const getPsrStatus = (val: number) => {
    if (val >= 0.80) {
      return {
        label: "Sangat Baik (Tinggi)",
        desc: "Siswa memberikan jawaban secara konsisten sesuai dengan tingkat kemampuannya. Urutan peringkat kemampuan siswa dapat dipercaya dan stabil.",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />
      };
    } else if (val >= 0.70) {
      return {
        label: "Baik (Cukup)",
        desc: "Konsistensi respons siswa cukup memadai untuk evaluasi pembelajaran reguler, namun terdapat beberapa keanehan respons individual yang perlu dieksplorasi.",
        color: "text-amber-600 bg-amber-50 border-amber-100",
        icon: <HelpCircle className="h-5 w-5 text-amber-600" />
      };
    } else {
      return {
        label: "Kurang (Rendah)",
        desc: "Kemampuan siswa tidak terukur secara konsisten. Siswa cenderung memberikan respons acak (tebakan liar) atau terdapat faktor eksternal yang mengganggu keajegan respons.",
        color: "text-rose-600 bg-rose-50 border-rose-100",
        icon: <AlertTriangle className="h-5 w-5 text-rose-600 animate-pulse" />
      };
    }
  };

  const getIrStatus = (val: number) => {
    if (val >= 0.80) {
      return {
        label: "Sangat Baik (Tinggi)",
        desc: "Butir soal memiliki sebaran tingkat kesulitan yang representatif dan andal. Jika tes ini diberikan ke kelompok siswa setara lain, urutan kesukaran butir soal akan tetap sama.",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />
      };
    } else if (val >= 0.70) {
      return {
        label: "Baik (Cukup)",
        desc: "Sebaran tingkat kesulitan soal cukup memadai, tetapi disarankan menambah butir soal yang sangat mudah atau sangat sulit untuk memperluas cakupan ukur.",
        color: "text-amber-600 bg-amber-50 border-amber-100",
        icon: <HelpCircle className="h-5 w-5 text-amber-600" />
      };
    } else {
      return {
        label: "Kurang (Rendah)",
        desc: "Sangat sulit mengonfirmasi urutan tingkat kesukaran soal. Butir-butir soal menumpuk di tingkat kesulitan yang sama (homogen) atau jumlah siswa uji coba terlalu sedikit.",
        color: "text-rose-600 bg-rose-50 border-rose-100",
        icon: <AlertTriangle className="h-5 w-5 text-rose-600 animate-pulse" />
      };
    }
  };

  const getAlphaStatus = (val: number) => {
    if (val >= 0.80) {
      return {
        label: "Sangat Tinggi",
        desc: "Korelasi antar-butir soal sangat kuat secara statistik klasik, menunjukkan kesatuan alat ukur yang sangat andal untuk menguji kompetensi siswa.",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />
      };
    } else if (val >= 0.70) {
      return {
        label: "Tinggi",
        desc: "Korelasi internal memadai, mengonfirmasi keandalan tes secara keseluruhan untuk mengukur mata pelajaran ini.",
        color: "text-amber-600 bg-amber-50 border-amber-100",
        icon: <HelpCircle className="h-5 w-5 text-amber-600" />
      };
    } else {
      return {
        label: "Kurang / Lemah",
        desc: "Konsistensi internal rendah. Butir soal mungkin menguji aspek-aspek kompetensi yang tidak seragam (multidimensi) atau dipenuhi butir soal yang tidak valid.",
        color: "text-rose-600 bg-rose-50 border-rose-100",
        icon: <AlertTriangle className="h-5 w-5 text-rose-600" />
      };
    }
  };

  const psrStat = getPsrStatus(psr);
  const irStat = getIrStatus(ir);
  const alphaStat = getAlphaStatus(ca);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 my-6" id="reliability-panel-section">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Reliabilitas & Validitas Tes</h2>
        <p className="text-slate-400 text-xs mt-0.5">Penilaian akurasi dan keajegan instrumen evaluasi menggunakan parameter Rasch modern dan klasik.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* 1. Person Reliability Card */}
        <div className="flex flex-col justify-between border border-slate-100 rounded-xl p-5 bg-slate-50/30">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Person Reliability (PSR)</span>
              <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-blue-100 text-blue-800 uppercase">Rasch</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-800">{psr.toFixed(3)}</span>
              <span className="text-slate-400 text-xs font-semibold">/ 1.000</span>
            </div>

            <div className={`flex items-start gap-2 p-2.5 rounded-lg border text-[11px] font-medium leading-relaxed mb-4 ${psrStat.color}`}>
              <span className="shrink-0 mt-0.5">{psrStat.icon}</span>
              <div>
                <span className="font-bold block mb-0.5">{psrStat.label}</span>
                {psrStat.desc}
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${psr * 100}%` }} />
          </div>
        </div>

        {/* 2. Item Reliability Card */}
        <div className="flex flex-col justify-between border border-slate-100 rounded-xl p-5 bg-slate-50/30">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Item Reliability</span>
              <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-rose-100 text-rose-800 uppercase">Rasch</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-800">{ir.toFixed(3)}</span>
              <span className="text-slate-400 text-xs font-semibold">/ 1.000</span>
            </div>

            <div className={`flex items-start gap-2 p-2.5 rounded-lg border text-[11px] font-medium leading-relaxed mb-4 ${irStat.color}`}>
              <span className="shrink-0 mt-0.5">{irStat.icon}</span>
              <div>
                <span className="font-bold block mb-0.5">{irStat.label}</span>
                {irStat.desc}
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${ir * 100}%` }} />
          </div>
        </div>

        {/* 3. Cronbach Alpha Card */}
        <div className="flex flex-col justify-between border border-slate-100 rounded-xl p-5 bg-slate-50/30">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Cronbach's Alpha (α)</span>
              <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-indigo-100 text-indigo-800 uppercase">Klasik</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-800">{ca.toFixed(3)}</span>
              <span className="text-slate-400 text-xs font-semibold">/ 1.000</span>
            </div>

            <div className={`flex items-start gap-2 p-2.5 rounded-lg border text-[11px] font-medium leading-relaxed mb-4 ${alphaStat.color}`}>
              <span className="shrink-0 mt-0.5">{alphaStat.icon}</span>
              <div>
                <span className="font-bold block mb-0.5">{alphaStat.label}</span>
                {alphaStat.desc}
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${ca * 100}%` }} />
          </div>
        </div>

      </div>

      {/* Actionable Pedagogical Advice */}
      <div className="p-5 bg-blue-50/30 border border-blue-100/50 rounded-xl flex items-start gap-4">
        <Activity className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
        <div>
          <h3 className="text-sm font-bold text-blue-950 mb-2">Rekomendasi Tindakan Pedagogis:</h3>
          <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 leading-relaxed">
            {psr < 0.70 && (
              <li><strong>Untuk Siswa:</strong> Tingginya inkonsistensi respons siswa mengindikasikan siswa kurang fokus, menyontek, atau banyak melakukan tebakan spekulatif. Guru disarankan melakukan verifikasi (wawancara singkat) dengan siswa yang terdeteksi misfit tinggi di tabel analisis siswa.</li>
            )}
            {ir < 0.80 && (
              <li><strong>Untuk Soal:</strong> Reliabilitas butir soal yang rendah menyiratkan tes menumpuk di tingkat kesulitan yang seragam. Disarankan untuk memformulasikan beberapa soal baru yang lebih bervariasi (beberapa soal yang sangat menantang dan beberapa soal pengondisian dasar yang mudah).</li>
            )}
            {psr >= 0.70 && ir >= 0.80 && (
              <li><strong>Sempurna:</strong> Alat evaluasi Anda berada pada tingkat reliabilitas yang luar biasa tinggi berdasarkan model Rasch. Hasil nilai akhir (logit) andal digunakan untuk pengisian rapor, penempatan kelas lanjutan, maupun bahan riset akademis sekolah.</li>
            )}
            <li><strong>Optimasi Bank Soal:</strong> Amankan butir-butir soal berkategori <strong>"Fit"</strong> ke dalam bank soal sekolah agar dapat digunakan kembali secara andal di masa depan. Buang atau revisi total soal yang berkategori <strong>"Misfit"</strong> karena membingungkan siswa dan menurunkan reliabilitas evaluasi.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
