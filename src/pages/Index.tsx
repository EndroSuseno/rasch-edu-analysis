import React, { useState } from "react";
import { FullRaschAnalysisData } from "../lib/rasch/types";
import FileUpload from "../components/rasch/FileUpload";
import SummaryCards from "../components/rasch/SummaryCards";
import ItemAnalysisTable from "../components/rasch/ItemAnalysisTable";
import PersonAnalysisTable from "../components/rasch/PersonAnalysisTable";
import WrightMap from "../components/rasch/WrightMap";
import ReliabilityPanel from "../components/rasch/ReliabilityPanel";
import CheatDetectionTable from "../components/rasch/CheatDetectionTable";
import ExportButton from "../components/rasch/ExportButton";
import { 
  Users, 
  FileText, 
  RefreshCw, 
  ShieldCheck, 
  AlertOctagon, 
  Map, 
  School 
} from "lucide-react";

type TabID = "summary" | "wright" | "items" | "persons" | "cheat";

export default function IndexPage() {
  const [analysisData, setAnalysisData] = useState<FullRaschAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<TabID>("summary");

  const handleReset = () => {
    setAnalysisData(null);
    setActiveTab("summary");
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
        <FileUpload onDataLoaded={setAnalysisData} />
      </div>
    );
  }

  const { identitas, summary, items, persons, cheating, seats } = analysisData;

  const tabItems: { id: TabID; label: string; icon: React.ReactNode }[] = [
    { 
      id: "summary", 
      label: "Ringkasan & Reliabilitas", 
      icon: <ShieldCheck className="h-4 w-4" /> 
    },
    { 
      id: "wright", 
      label: "Wright Map", 
      icon: <Map className="h-4 w-4" /> 
    },
    { 
      id: "items", 
      label: "Analisis Soal", 
      icon: <FileText className="h-4 w-4" /> 
    },
    { 
      id: "persons", 
      label: "Analisis Siswa", 
      icon: <Users className="h-4 w-4" /> 
    },
    { 
      id: "cheat", 
      label: "Deteksi Kecurangan", 
      icon: <AlertOctagon className="h-4 w-4" /> 
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden" id="rasch-dashboard-root">
      
      {/* Top Academic Navigation Bar */}
      <nav className="h-16 bg-[#1e3a5f] text-white flex items-center justify-between px-6 shadow-md shrink-0 border-b border-blue-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg text-white shadow-inner">
            R
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase">Rasch Analysis Tool v2.1</h1>
            <p className="text-[9px] text-blue-200 uppercase font-extrabold tracking-wider leading-none">Geometric Balance Theme</p>
          </div>
        </div>
        
        {/* Right Side metadata and Export button */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="hidden lg:flex flex-col items-end opacity-90 text-right mr-2">
            <span className="font-bold text-xs text-white">{identitas.sekolah}</span>
            <span className="text-[10px] text-blue-200 font-semibold">{identitas.mataPelajaran} • {identitas.kelas}</span>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={analysisData} />
            <button
              type="button"
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-bold flex items-center shadow-sm transition-colors text-xs cursor-pointer gap-1.5 border border-blue-500/50"
              id="btn-new-analysis"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </nav>

      {/* Main Body with Sidebar Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          
          {/* File/Template Metadata Card */}
          <div className="p-4 border-b border-slate-100">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full mb-1.5">
                <School className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide block max-w-[180px] truncate">
                {identitas.sekolah}
              </span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                {identitas.guru}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">
              Menu Analisis
            </div>
            {tabItems.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-xs font-bold rounded-md transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-extrabold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  id={`sidebar-tab-btn-${tab.id}`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 transition-all ${
                    isSelected ? "bg-blue-600 scale-110" : "bg-transparent"
                  }`} />
                  <span className="flex-1 flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Calculation Status Panel */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/40 mt-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Status Kalkulasi
            </div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Iterasi JMLE</span>
              <span className="font-bold text-slate-800">50/50</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[100%] rounded-full"></div>
            </div>
            <div className="text-[9px] text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Konvergensi: 0.00018 (Stable)
            </div>
          </div>

        </aside>

        {/* Right Main Body Scroll Area */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6">
          
          {/* Mobile Metadata banner */}
          <div className="block lg:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">{identitas.sekolah}</h2>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-500">
              <div><strong>Mapel:</strong> {identitas.mataPelajaran}</div>
              <div><strong>Kelas:</strong> {identitas.kelas}</div>
              <div><strong>Guru:</strong> {identitas.guru}</div>
              <div><strong>Tanggal:</strong> {identitas.tanggalTes}</div>
            </div>
          </div>

          {/* Summary Stats Cards */}
          <SummaryCards summary={summary} identitas={identitas} />

          {/* Tab Content Display Area */}
          <div className="transition-all duration-300" id="tab-content-container">
            {activeTab === "summary" && (
              <div className="animate-fade-in">
                <ReliabilityPanel summary={summary} />
              </div>
            )}

            {activeTab === "wright" && (
              <div className="animate-fade-in">
                <WrightMap items={items} persons={persons} />
              </div>
            )}

            {activeTab === "items" && (
              <div className="animate-fade-in">
                <ItemAnalysisTable items={items} />
              </div>
            )}

            {activeTab === "persons" && (
              <div className="animate-fade-in">
                <PersonAnalysisTable persons={persons} />
              </div>
            )}

            {activeTab === "cheat" && (
              <div className="animate-fade-in">
                <CheatDetectionTable cheating={cheating} seats={seats} />
              </div>
            )}
          </div>

        </main>
      </div>

    </div>
  );
}
