import { RaschSummary, Identitas } from "../../lib/rasch/types";
import { Users, FileText, Award, Percent, ShieldCheck } from "lucide-react";

interface SummaryCardsProps {
  summary: RaschSummary;
  identitas: Identitas;
}

export default function SummaryCards({ summary, identitas }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 my-6" id="summary-cards-section">
      {/* 1. Total Siswa */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">Total Siswa</span>
          <span className="text-2xl font-extrabold text-slate-800">{summary.totalSiswa}</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">peserta ujian</span>
        </div>
      </div>

      {/* 2. Total Soal */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">Total Soal</span>
          <span className="text-2xl font-extrabold text-slate-800">{summary.totalSoal}</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">butir teranalisis</span>
        </div>
      </div>

      {/* 3. Rata-Rata Skor */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Percent className="h-6 w-6" />
        </div>
        <div>
          <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">Rata-Rata Skor</span>
          <span className="text-2xl font-extrabold text-slate-800">
            {summary.rataRataSkor.toFixed(1)}
          </span>
          <span className="text-slate-400 text-[10px] block mt-0.5">
            ({((summary.rataRataSkor / summary.totalSoal) * 100).toFixed(1)}% Benar)
          </span>
        </div>
      </div>

      {/* 4. Ketuntasan KKM */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-2">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Ketuntasan (KKM: {identitas.kkm})</span>
              <span className="text-slate-400 text-xs font-bold">{summary.jumlahTuntas} / {summary.totalSiswa} Siswa</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-2xl font-extrabold text-slate-800">{summary.persenTuntas.toFixed(1)}%</span>
              <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-full bg-emerald-100 text-emerald-800">Tuntas</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${summary.persenTuntas}%` }}
          />
        </div>
      </div>
    </div>
  );
}
