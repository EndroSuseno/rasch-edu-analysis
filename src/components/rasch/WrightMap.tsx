import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";
import { RaschItemResult, RaschPersonResult } from "../../lib/rasch/types";
import { HelpCircle, ChevronRight } from "lucide-react";

interface WrightMapProps {
  items: RaschItemResult[];
  persons: RaschPersonResult[];
}

export default function WrightMap({ items, persons }: WrightMapProps) {
  // Convert persons and items into Scatter-friendly formats
  // We add some small jitter to X (horizontal offset) so that multiple dots at the exact same logit level do not overlap completely.
  const personScatterData = persons.map((p, idx) => {
    // Jitter X slightly around 1.0 (e.g. 0.92 to 1.08)
    const jitter = -0.06 + (idx % 7) * 0.02;
    return {
      x: 1.0 + jitter,
      y: parseFloat(p.ability.toFixed(3)),
      name: p.nama,
      type: "Siswa",
      detail: `Ability: ${p.ability.toFixed(2)} logit | Skor: ${p.skor} (${p.pctBenar.toFixed(0)}%)`
    };
  });

  const itemScatterData = items.map((it, idx) => {
    // Jitter X slightly around 2.0 (e.g. 1.92 to 2.08)
    const jitter = -0.06 + (idx % 7) * 0.02;
    return {
      x: 2.0 + jitter,
      y: parseFloat(it.difficulty.toFixed(3)),
      name: it.noSoal.toUpperCase(),
      type: "Soal",
      detail: `Difficulty: ${it.difficulty.toFixed(2)} logit | p = ${it.p.toFixed(2)}`
    };
  });

  // Calculate suitable Y bounds
  const allY = [...persons.map(p => p.ability), ...items.map(it => it.difficulty)];
  const minY = Math.min(...allY, -3);
  const maxY = Math.max(...allY, 3);
  const roundedMinY = Math.floor(minY - 0.5);
  const roundedMaxY = Math.ceil(maxY + 0.5);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isSiswa = data.type === "Siswa";
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-md border border-slate-700 text-xs">
          <p className="font-bold border-b border-slate-700 pb-1 mb-1.5 flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${isSiswa ? "bg-blue-400" : "bg-rose-400"}`} />
            {data.name} ({data.type})
          </p>
          <p className="font-mono text-slate-300">{data.detail}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 my-6" id="wright-map-section">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Wright Map (Item-Person Map)</h2>
        <p className="text-slate-400 text-xs mt-0.5">Visualisasi perbandingan distribusi kemampuan siswa (kiri) dengan tingkat kesulitan butir soal (kanan) pada skala logit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Recharts Container */}
        <div className="lg:col-span-3 bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between" style={{ minHeight: "450px" }}>
          <div className="flex justify-between items-center px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Siswa (Ability θ)</span>
            <span>Butir Soal (Difficulty b)</span>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[0.5, 2.5]} 
                  ticks={[1, 2]}
                  tickFormatter={(val) => val === 1 ? "Siswa (Ability θ)" : val === 2 ? "Soal (Difficulty b)" : ""}
                  stroke="#64748b"
                  fontSize={11}
                  fontWeight="600"
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  domain={[roundedMinY, roundedMaxY]}
                  stroke="#64748b"
                  fontSize={11}
                  label={{ value: 'Skala Logit (Rasch Scale)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 11, fontWeight: 'bold' } }}
                />
                <Tooltip content={customTooltip} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                
                {/* Reference line at mean 0 logit */}
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Rata-rata Soal (0 Logit)", fill: '#64748b', fontSize: 9, position: 'top' }} />
                
                {/* Persons Scatter */}
                <Scatter name="Siswa" data={personScatterData} fill="#3b82f6" shape="circle" fillOpacity={0.75}>
                  {personScatterData.map((entry, index) => (
                    <Cell key={`cell-siswa-${index}`} className="hover:scale-125 hover:fill-blue-700 transition-all cursor-pointer" />
                  ))}
                </Scatter>
                
                {/* Items Scatter */}
                <Scatter name="Soal" data={itemScatterData} fill="#f43f5e" shape="diamond" fillOpacity={0.85}>
                  {itemScatterData.map((entry, index) => (
                    <Cell key={`cell-soal-${index}`} className="hover:scale-125 hover:fill-rose-700 transition-all cursor-pointer" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend & Theoretical Explanation */}
        <div className="flex flex-col justify-between bg-slate-50/30 rounded-xl p-5 border border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h4 className="text-slate-800 font-bold text-sm">Cara Membaca Map:</h4>
            </div>
            
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                Wright Map menjajajarkan <strong>kemampuan siswa</strong> dan <strong>kesulitan soal</strong> pada satu dimensi logit yang sama.
              </p>
              
              <div className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Siswa (Dot Biru):</strong> Semakin tinggi posisi dot biru, semakin tinggi tingkat kemampuan kognitif siswa tersebut.
                </p>
              </div>
              
              <div className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Soal (Diamond Merah):</strong> Semakin tinggi posisi diamond merah, semakin sulit butir soal tersebut.
                </p>
              </div>

              <div className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Probabilitas Benar:</strong> Jika posisi seorang siswa sejajar dengan posisi butir soal, siswa tersebut memiliki peluang <strong>50%</strong> untuk menjawab benar soal tersebut.
                </p>
              </div>

              <div className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  Jika posisi siswa berada jauh <strong>di atas</strong> soal, peluang menjawab benar mendekati <strong>100%</strong>. Sebaliknya, jika siswa berada <strong>di bawah</strong> soal, peluang menjawab benar mendekati <strong>0%</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 block mb-1">Analisis Keseimbangan Tes:</span>
            {persons.length > 0 && items.length > 0 && (
              <p>
                Rata-rata kemampuan siswa adalah {(persons.reduce((s, p) => s + p.ability, 0) / persons.length).toFixed(2)} logit. 
                Tes ini tergolong { (persons.reduce((s, p) => s + p.ability, 0) / persons.length) > 0.3 ? "cukup mudah bagi siswa" : (persons.reduce((s, p) => s + p.ability, 0) / persons.length) < -0.3 ? "cukup sulit bagi siswa" : "berimbang (ideal) untuk siswa" }.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
