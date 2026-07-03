import React, { useState } from "react";
import { RaschPersonResult } from "../../lib/rasch/types";
import { Search, ArrowUpDown, Filter, AlertCircle, CheckCircle, GraduationCap } from "lucide-react";

interface PersonAnalysisTableProps {
  persons: RaschPersonResult[];
}

type SortField = "no" | "nis" | "nama" | "skor" | "pctBenar" | "ability" | "se" | "infitMNSQ" | "outfitMNSQ";
type SortOrder = "asc" | "desc";

export default function PersonAnalysisTable({ persons }: PersonAnalysisTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tuntasFilter, setTuntasFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("no");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort persons
  const filteredPersons = persons
    .filter((p) => {
      const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.nis.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTuntas = tuntasFilter === "All" || p.keterangan === tuntasFilter;
      return matchSearch && matchTuntas;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
    });

  const getTuntasBadge = (keterangan: string) => {
    if (keterangan === "Tuntas") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
          <CheckCircle className="h-3 w-3" /> Tuntas
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
          <AlertCircle className="h-3 w-3" /> Tidak Tuntas
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 my-6" id="person-analysis-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analisis Siswa (Person Analysis)</h2>
          <p className="text-slate-400 text-xs mt-0.5">Statistik kemampuan laten siswa, error standar pengukuran, dan keajegan pola respons.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIS atau Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={tuntasFilter}
              onChange={(e) => setTuntasFilter(e.target.value)}
              className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="All">Semua Keterangan</option>
              <option value="Tuntas">Tuntas KKM</option>
              <option value="Tidak Tuntas">Belum Tuntas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-16" onClick={() => handleSort("no")}>
                <div className="flex items-center gap-1">No <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("nis")}>
                <div className="flex items-center gap-1">NIS <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("nama")}>
                <div className="flex items-center gap-1">Nama Siswa <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort("skor")}>
                <div className="flex items-center justify-center gap-1">Skor <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort("pctBenar")}>
                <div className="flex items-center justify-center gap-1">% Benar <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort("ability")}>
                <div className="flex items-center justify-center gap-1">Ability θ (logit) <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort("se")}>
                <div className="flex items-center justify-center gap-1">SE <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort("infitMNSQ")}>
                <div className="flex items-center justify-center gap-1">Infit <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort("outfitMNSQ")}>
                <div className="flex items-center justify-center gap-1">Outfit <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {filteredPersons.length > 0 ? (
              filteredPersons.map((p) => (
                <tr key={p.nis} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{p.no}</td>
                  <td className="py-3.5 px-4 font-mono font-medium">{p.nis}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                    {p.nama}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">{p.skor}</td>
                  <td className="py-3.5 px-4 text-center font-mono">{p.pctBenar.toFixed(1)}%</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    <span className={p.ability > 0 ? "text-blue-600" : "text-amber-600"}>
                      {p.ability > 0 ? `+${p.ability.toFixed(3)}` : p.ability.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">{p.se.toFixed(3)}</td>
                  <td className="py-3.5 px-4 text-center font-mono" style={{ color: p.infitMNSQ > 1.5 || p.infitMNSQ < 0.5 ? '#b91c1c' : 'inherit' }}>
                    {p.infitMNSQ.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono" style={{ color: p.outfitMNSQ > 1.5 || p.outfitMNSQ < 0.5 ? '#b91c1c' : 'inherit' }}>
                    {p.outfitMNSQ.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-center">{getTuntasBadge(p.keterangan)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400 font-medium">
                  Tidak ditemukan siswa yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-indigo-50/30 rounded-lg flex items-start gap-3 border border-indigo-100/30">
        <InfoIcon className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-[11px] leading-relaxed text-slate-600">
          <span className="font-bold text-indigo-900 block mb-1">Panduan Membaca Analisis Siswa:</span>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Ability θ (logit):</strong> Nilai logit menggambarkan kemampuan siswa sesungguhnya. Semakin tinggi nilai positif, semakin hebat kemampuan kognitif siswa dalam menyelesaikan butir-butir soal tes. Rata-rata populasi biasanya disesuaikan dengan sebaran tingkat kesukaran soal.</li>
            <li><strong>Standard Error (SE):</strong> Menunjukkan margin ketidakpastian kemampuan siswa. Semakin kecil nilai SE, semakin presisi taksiran kemampuannya.</li>
            <li><strong>Infit/Outfit MNSQ:</strong> Jika nilainya jauh melenceng dari rentang <strong>0.5 - 1.5</strong>, itu berarti siswa memiliki pola respons janggal. Contoh: Siswa kemampuan rendah mendapat skor benar pada soal-soal tersulit (indikasi menebak beruntung atau menyontek), atau siswa pandai justru salah di soal-soal sangat mudah (indikasi ceroboh).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.984l-.04.02-2.24 2.24-.04.02a.75.75 0 11-1.083-.984l.04-.02 2.24-2.24zM12 20.25a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z" />
    </svg>
  );
}
