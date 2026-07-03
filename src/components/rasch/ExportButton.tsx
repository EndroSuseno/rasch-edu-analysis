import { useState } from "react";
import { exportAnalysisToExcel } from "../../lib/rasch/exportResults";
import { FullRaschAnalysisData } from "../../lib/rasch/types";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  data: FullRaschAnalysisData;
}

export default function ExportButton({ data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        exportAnalysisToExcel(data);
      } catch (err) {
        console.error("Gagal melakukan export Excel:", err);
      } finally {
        setIsExporting(false);
      }
    }, 600); // Small timeout for premium UX feel
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-wait"
      id="btn-export-excel"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Mengekspor...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4" />
          Export Hasil ke Excel
        </>
      )}
    </button>
  );
}
