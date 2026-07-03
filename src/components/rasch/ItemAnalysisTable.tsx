import React, { useState } from "react";
import { RaschItemResult } from "../../lib/rasch/types";
import { Search, ArrowUpDown, Filter, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

interface ItemAnalysisTableProps {
  items: RaschItemResult[];
}

type SortField = "noSoal" | "p" | "ptBis" | "difficulty" | "infitMNSQ" | "outfitMNSQ";
type SortOrder = "asc" | "desc";

export default function ItemAnalysisTable({ items }: ItemAnalysisTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [fitFilter, setFitFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("noSoal");
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

  // Filter and sort items
  const filteredItems = items
    .filter((it) => {
      const matchSearch = it.noSoal.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDifficulty = difficultyFilter === "All" || it.category === difficultyFilter;
      const matchFit = fitFilter === "All" || it.fitStatus === fitFilter;
      return matchSearch && matchDifficulty && matchFit;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle custom alphanumeric sort for s1, s2, s10
      if (sortField === "noSoal") {
        const numA = parseInt(a.noSoal.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.noSoal.replace(/\D/g, "")) || 0;
        return sortOrder === "asc" ? numA - numB : numB - numA;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
    });

  const getDifficultyBadge = (category: string) => {
    switch (category) {
      case "Mudah":
        return <span className="px-2 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800">Mudah</span>;
      case "Sedang":
        return <span className="px-2 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800">Sedang</span>;
      case "Sulit":
        return <span className="px-2 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-800">Sulit</span>;
      default:
        return null;
    }
  };

  const getDayaBedaBadge = (ptBis: number, cat: string) => {
    switch (cat) {
      case "Baik":
        return (
          <div>
            <span className="px-2 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800">Baik</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">r = {ptBis.toFixed(2)}</span>
          </div>
        );
      case "Cukup":
        return (
          <div>
            <span className="px-2 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800">Cukup</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">r = {ptBis.toFixed(2)}</span>
          </div>
        );
      case "Lemah":
        return (
          <div>
            <span className="px-2 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-800">Lemah</span>
            <span className="text-[10px] text-rose-500 block mt-0.5">r = {ptBis.toFixed(2)}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getFitBadge = (status: string) => {
    switch (status) {
      case "Fit":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">
            <CheckCircle className="h-3 w-3" /> Fit
          </span>
        );
      case "Degrading":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800">
            <HelpCircle className="h-3 w-3" /> Degrading
          </span>
        );
      case "Misfit":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-rose-100 text-rose-800 animate-pulse">
            <AlertTriangle className="h-3 w-3" /> Misfit
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 my-6" id="item-analysis-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analisis Butir Soal (Item Analysis)</h2>
          <p className="text-slate-400 text-xs mt-0.5">Analisis daya beda klasik, tingkat kesukaran, serta statistik Fit model Rasch.</p>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari No Soal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 w-44"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="All">Semua Kesukaran</option>
              <option value="Mudah">Mudah (p &gt; 0.8)</option>
              <option value="Sedang">Sedang (0.3 ≤ p ≤ 0.8)</option>
              <option value="Sulit">Sulit (p &lt; 0.3)</option>
            </select>

            <select
              value={fitFilter}
              onChange={(e) => setFitFilter(e.target.value)}
              className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="All">Semua Status Fit</option>
              <option value="Fit">Fit (0.5–1.5)</option>
              <option value="Degrading">Degrading (&lt;0.5)</option>
              <option value="Misfit">Misfit (&gt;1.5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("noSoal")}>
                <div className="flex items-center gap-1">No Soal <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("p")}>
                <div className="flex items-center gap-1">Tingkat Kesukaran (p) <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4">Kategori Kesukaran</th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("ptBis")}>
                <div className="flex items-center gap-1">Daya Beda (PTM-BIS) <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("difficulty")}>
                <div className="flex items-center gap-1">Difficulty Rasch (logit) <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("infitMNSQ")}>
                <div className="flex items-center gap-1">Infit MNSQ <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("outfitMNSQ")}>
                <div className="flex items-center gap-1">Outfit MNSQ <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4">Status Fit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {filteredItems.length > 0 ? (
              filteredItems.map((it) => (
                <tr key={it.noSoal} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">{it.noSoal}</td>
                  <td className="py-3.5 px-4 font-mono">{it.p.toFixed(3)}</td>
                  <td className="py-3.5 px-4">{getDifficultyBadge(it.category)}</td>
                  <td className="py-3.5 px-4">{getDayaBedaBadge(it.ptBis, it.ptBisCategory)}</td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    <span className={it.difficulty > 0 ? "text-rose-600" : "text-emerald-600"}>
                      {it.difficulty > 0 ? `+${it.difficulty.toFixed(3)}` : it.difficulty.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{it.infitMNSQ.toFixed(3)}</td>
                  <td className="py-3.5 px-4 font-mono">{it.outfitMNSQ.toFixed(3)}</td>
                  <td className="py-3.5 px-4">{getFitBadge(it.fitStatus)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                  Tidak ditemukan butir soal yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50/30 rounded-lg flex items-start gap-3 border border-blue-100/30">
        <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-[11px] leading-relaxed text-slate-600">
          <span className="font-bold text-blue-900 block mb-1">Panduan Membaca Analisis Rasch:</span>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Difficulty (logit):</strong> Nilai logit positif tinggi menunjukkan soal yang sangat sulit (melebihi rata-rata kemampuan siswa), sedangkan logit negatif menunjukkan soal yang mudah.</li>
            <li><strong>Infit/Outfit MNSQ:</strong> Nilai statistik yang mengukur konsistensi jawaban siswa. Kriteria ideal adalah antara <strong>0.5 dan 1.5 (Fit)</strong>. Jika &gt; 1.5 (Misfit), soal memiliki kebingungan tinggi (siswa pandai salah, siswa kurang pandai benar). Jika &lt; 0.5 (Degrading), soal terlalu terprediksi / redundan.</li>
            <li><strong>Daya Beda (PTM-BIS):</strong> Korelasi poin-biserial untuk menilai efektivitas pembeda. Batas kelayakan ideal adalah &ge; 0.30.</li>
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
