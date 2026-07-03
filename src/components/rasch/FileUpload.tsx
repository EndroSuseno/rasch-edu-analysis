import React, { useRef, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { parseExcelTemplate } from "../../lib/rasch/parseExcel";
import { scoreStudentAnswers } from "../../lib/rasch/scoring";
import { performRaschJMLE } from "../../lib/rasch/raschModel";
import { detectSeatingCheating } from "../../lib/rasch/cheatDetection";
import { FullRaschAnalysisData, JawabanSiswa, TempatDuduk } from "../../lib/rasch/types";

interface FileUploadProps {
  onDataLoaded: (data: FullRaschAnalysisData) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccessMsg(null);
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("Format file tidak didukung. Harap upload file Excel (.xlsx atau .xls)");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const parsed = parseExcelTemplate(buffer);
          
          // Score students
          const scoredSiswa = scoreStudentAnswers(parsed.jawaban, parsed.kunci);
          const qKeys = Object.keys(parsed.kunci);
          
          // Run Rasch JMLE
          const raschResult = performRaschJMLE(scoredSiswa, qKeys, parsed.identitas);
          
          // Spatial Cheating Analysis
          const cheating = detectSeatingCheating(parsed.jawaban, parsed.kunci, parsed.tempatDuduk);

          const fullData: FullRaschAnalysisData = {
            identitas: parsed.identitas,
            items: raschResult.items,
            persons: raschResult.persons,
            cheating,
            summary: raschResult.summary,
            rawAnswers: parsed.jawaban,
            kunci: parsed.kunci,
            seats: parsed.tempatDuduk
          };

          setSuccessMsg(`Berhasil menganalisis data! Terbaca ${raschResult.summary.totalSiswa} siswa dan ${raschResult.summary.totalSoal} butir soal.`);
          setTimeout(() => {
            onDataLoaded(fullData);
          }, 1000);
        } catch (err: any) {
          setError(err.message || "Gagal mengurai file Excel. Harap periksa kesesuaian format template.");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError("Terjadi kesalahan saat membaca file.");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Helper to load sample mock data for instant preview
  const handleLoadDemo = () => {
    // Generate realistic school dataset (30 students, 25 multiple-choice questions)
    const mockIdentitas = {
      sekolah: "SMA Negeri 8 Jakarta",
      mataPelajaran: "Biologi (Sistem Syaraf & Hormon)",
      kelas: "XI MIPA 2",
      guru: "Drs. Budi Santoso, M.Pd.",
      semester: "Ganjil",
      tahunAjaran: "2025/2026",
      tanggalTes: "18 Mei 2026",
      jumlahSoal: 25,
      kkm: 75
    };

    // Correct Answer Key
    const options = ["A", "B", "C", "D"];
    const mockKunci: Record<string, string> = {};
    for (let i = 1; i <= 25; i++) {
      mockKunci[`s${i}`] = options[(i * 3 + 1) % 4];
    }

    // Generate students and seat mapping
    const mockJawaban: JawabanSiswa[] = [];
    const mockSeats: Record<string, TempatDuduk> = {};

    const studentNames = [
      "Achmad Rafif", "Aditya Nugraha", "Amanda Putri", "Andhika Pratama", "Annisa Lestari",
      "Bagus Cahyo", "Bintang Ramadan", "Citra Kirana", "Dian Sastrowardoyo", "Dimas Seto",
      "Eka Kurnia", "Fajar Ramadhan", "Febriani Lestari", "Gilang Dirga", "Hana Pertiwi",
      "Indah Permatasari", "Joko Susilo", "Kartika Sari", "Larasati Dewi", "M. Rizky Pratama",
      "Nabila Syakieb", "Naufal Alfarisi", "Putri Amelia", "Rafi Ahmad", "Rania Salsabila",
      "Siti Aminah", "Taufik Hidayat", "Wahyu Hidayat", "Yulia Citra", "Zulfaqar Ali"
    ];

    // Generate classroom: 30 students in a 6x5 grid (6 rows, 5 columns) in Ruang 102
    studentNames.forEach((nama, idx) => {
      const rowNum = Math.floor(idx / 5) + 1; // 1 to 6
      const colNum = (idx % 5) + 1; // 1 to 5
      const nis = (2024000 + idx + 1).toString();

      mockSeats[nis] = {
        nis,
        baris: rowNum,
        kolom: colNum,
        ruang: "Lab Biologi 1"
      };

      // We simulate ability using a normal distribution logit centered on +0.5 (average above zero)
      // Items difficulty varies from -2.0 to +2.0 logit.
      // We will generate student responses based on the theoretical Rasch probability
      // student ability (theta)
      const theta = -1.5 + (idx % 4) * 0.9 + (idx / 30) * 1.5; // logit from -1.5 to +2.1
      
      const jawabanRawMap: Record<string, string> = {};
      for (let i = 1; i <= 25; i++) {
        // item difficulty: items in center are average, first items are easy, last items are harder
        const b = -1.8 + (i - 1) * 0.15; // from -1.8 to +1.8
        const diff = theta - b;
        const prob = Math.exp(diff) / (1 + Math.exp(diff));
        
        const isCorrect = Math.random() < prob;
        const correctOption = mockKunci[`s${i}`];
        
        if (isCorrect) {
          jawabanRawMap[`s${i}`] = correctOption;
        } else {
          // Choose a wrong option (excluding correctOption)
          const wrongOptions = options.filter(o => o !== correctOption);
          // Introduce a high chance of matching wrong answers for adjacent seats (cheating simulation)
          // Let's force Student 3 and Student 4 (sitting adjacent) to share several wrong answers!
          if ((idx === 2 || idx === 3) && i % 4 !== 0) {
            // Force same wrong option for s3 and s4
            jawabanRawMap[`s${i}`] = "C"; 
          } else {
            jawabanRawMap[`s${i}`] = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
          }
        }
      }

      mockJawaban.push({
        no: idx + 1,
        nis,
        nama,
        jawabanRaw: jawabanRawMap
      });
    });

    // Run calculations
    const scoredSiswa = scoreStudentAnswers(mockJawaban, mockKunci);
    const qKeys = Object.keys(mockKunci);
    const raschResult = performRaschJMLE(scoredSiswa, qKeys, mockIdentitas);
    const cheating = detectSeatingCheating(mockJawaban, mockKunci, mockSeats);

    const fullData: FullRaschAnalysisData = {
      identitas: mockIdentitas,
      items: raschResult.items,
      persons: raschResult.persons,
      cheating,
      summary: raschResult.summary,
      rawAnswers: mockJawaban,
      kunci: mockKunci,
      seats: mockSeats
    };

    setSuccessMsg("Berhasil memuat data simulasi! Membuka dashboard analisis...");
    setTimeout(() => {
      onDataLoaded(fullData);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100" id="file-upload-section">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Rasch Model Analysis App
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Menganalisis evaluasi pembelajaran sekolah dengan presisi tingkat lanjut menggunakan model Rasch dichotomous (JMLE). 
          Upload file Excel Anda atau gunakan data demo untuk mencoba.
        </p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
        }`}
        onClick={triggerFileInput}
        id="drop-zone"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept=".xlsx,.xls"
        />
        
        <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 group-hover:scale-110 transition-transform">
          <Upload className="h-10 w-10 text-blue-600" />
        </div>

        <p className="text-slate-800 font-medium text-base text-center mb-1">
          Tarik & lepas file Excel template di sini
        </p>
        <p className="text-slate-400 text-xs text-center mb-6">
          Mendukung format file .XLSX atau .XLS
        </p>
        
        <button
          type="button"
          className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          Pilih File dari Komputer
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-800 text-xs leading-relaxed">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-emerald-800 text-xs font-medium leading-relaxed">{successMsg}</p>
        </div>
      )}

      {/* Guide Cards */}
      <div className="mt-10 pt-8 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-slate-400" />
          <h3 className="text-slate-800 font-semibold text-sm">Persyaratan Format Sheet Excel Template</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-700 block mb-1">Sheet 1: jawaban</span>
            Kolom wajib: <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600">no</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600">nis</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600">nama</code>, serta <code className="bg-slate-200 px-1 py-0.5 rounded">s1</code> sampai <code className="bg-slate-200 px-1 py-0.5 rounded">s25</code> (opsi jawaban A/B/C/D).
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-700 block mb-1">Sheet 2: kunci</span>
            Daftar baris berisi kunci jawaban per butir soal dengan kolom <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600">no</code> (atau nomor soal) dan <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600">kunci</code>.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-700 block mb-1">Sheet 3: identitas</span>
            Konfigurasi metadata berupa baris parameter & nilai: Sekolah, Mata Pelajaran, Kelas, Guru, Jumlah Soal, KKM, dll.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-700 block mb-1">Sheet 4: tempat_duduk (Opsional)</span>
            Daftar tata letak ruang ujian untuk deteksi kecurangan: <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600">nis</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">baris</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">kolom</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">ruang</code>.
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100/60">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <span className="text-slate-800 font-semibold text-sm">Ingin mencoba langsung tanpa menyiapkan file?</span>
          </div>
          <p className="text-slate-500 text-xs text-center max-w-md mb-4">
            Kami menyediakan data simulasi berstruktur lengkap (30 siswa, 25 soal, dan peta tempat duduk) yang mencontohkan hasil tes riil.
          </p>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="px-6 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
            id="btn-demo-load"
          >
            Gunakan Data Demo Simulasi
          </button>
        </div>
      </div>
    </div>
  );
}
