import * as XLSX from "xlsx";
import { FullRaschAnalysisData } from "./types";

export function exportAnalysisToExcel(data: FullRaschAnalysisData): void {
  const { identitas, summary, items, persons, cheating } = data;

  // Create empty workbook
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: RINGKASAN ---
  const summaryAOA: any[][] = [
    ["LAPORAN ANALISIS EVALUASI BELAJAR (RASCH MODEL)"],
    [],
    ["A. IDENTITAS EVALUASI"],
    ["Sekolah", identitas.sekolah],
    ["Mata Pelajaran", identitas.mataPelajaran],
    ["Kelas", identitas.kelas],
    ["Guru", identitas.guru],
    ["Semester", identitas.semester],
    ["Tahun Ajaran", identitas.tahunAjaran],
    ["Tanggal Tes", identitas.tanggalTes],
    ["Jumlah Soal", identitas.jumlahSoal],
    ["KKM", identitas.kkm],
    [],
    ["B. RINGKASAN STATISTIK"],
    ["Total Siswa", summary.totalSiswa],
    ["Total Soal Teranalisis", summary.totalSoal],
    ["Rata-rata Skor Siswa", parseFloat(summary.rataRataSkor.toFixed(2))],
    ["Siswa Tuntas KKM", summary.jumlahTuntas],
    ["Persentase Ketuntasan (%)", parseFloat(summary.persenTuntas.toFixed(2))],
    [],
    ["C. PARAMETER RELIABILITAS"],
    ["Person Separation Reliability (PSR)", parseFloat(summary.personSeparationReliability.toFixed(3))],
    ["Item Reliability", parseFloat(summary.itemReliability.toFixed(3))],
    ["Cronbach's Alpha (Classical)", parseFloat(summary.cronbachAlpha.toFixed(3))],
    [],
    ["D. INTERPRETASI RELIABILITAS & SEPARASI"],
    ["Person Reliability (PSR)", summary.personSeparationReliability >= 0.80 ? "Tinggi (Siswa konsisten & andal)" : summary.personSeparationReliability >= 0.70 ? "Baik/Cukup" : "Kurang (Siswa kurang konsisten)"],
    ["Item Reliability", summary.itemReliability >= 0.80 ? "Sangat Baik (Butir soal memiliki sebaran kesukaran yang luas)" : "Cukup/Kurang"],
    ["Cronbach's Alpha", summary.cronbachAlpha >= 0.80 ? "Sangat Bagus (Konsistensi internal tinggi)" : summary.cronbachAlpha >= 0.70 ? "Baik" : "Kurang Bagus"]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAOA);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

  // --- SHEET 2: ANALISIS BUTIR SOAL ---
  const itemsSheetData = items.map((it) => ({
    "No Soal": it.noSoal,
    "Tingkat Kesukaran (p)": parseFloat(it.p.toFixed(3)),
    "Kategori Kesukaran": it.category,
    "Daya Beda (PTM-BIS)": parseFloat(it.ptBis.toFixed(3)),
    "Kategori Daya Beda": it.ptBisCategory,
    "Difficulty (logit)": parseFloat(it.difficulty.toFixed(3)),
    "Infit MNSQ": parseFloat(it.infitMNSQ.toFixed(3)),
    "Outfit MNSQ": parseFloat(it.outfitMNSQ.toFixed(3)),
    "Status Fit": it.fitStatus
  }));

  const wsItems = XLSX.utils.json_to_sheet(itemsSheetData);
  XLSX.utils.book_append_sheet(wb, wsItems, "Analisis Butir Soal");

  // --- SHEET 3: ANALISIS SISWA ---
  const personsSheetData = persons.map((p) => ({
    "No": p.no,
    "NIS": p.nis,
    "Nama": p.nama,
    "Skor": p.skor,
    "Persen Benar (%)": parseFloat(p.pctBenar.toFixed(2)),
    "Ability (logit)": parseFloat(p.ability.toFixed(3)),
    "Standard Error (SE)": parseFloat(p.se.toFixed(3)),
    "Infit MNSQ": parseFloat(p.infitMNSQ.toFixed(3)),
    "Outfit MNSQ": parseFloat(p.outfitMNSQ.toFixed(3)),
    "Keterangan": p.keterangan
  }));

  const wsPersons = XLSX.utils.json_to_sheet(personsSheetData);
  XLSX.utils.book_append_sheet(wb, wsPersons, "Analisis Siswa");

  // --- SHEET 4: DETEKSI KECURANGAN SEATING ---
  const cheatingSheetData = cheating.length > 0 
    ? cheating.map((ch) => ({
        "Siswa A (NIS/Nama)": `${ch.nis1} - ${ch.nama1}`,
        "Siswa B (NIS/Nama)": `${ch.nis2} - ${ch.nama2}`,
        "Ruang Kelas": ch.ruang,
        "Posisi Siswa A": ch.posisi1,
        "Posisi Siswa B": ch.posisi2,
        "Jarak Manhattan": ch.jarakManhattan,
        "Jawaban Salah yang Sama": ch.wrongMatchesCount,
        "Siswa A Total Salah": ch.totalWrongSiswa1,
        "Siswa B Total Salah": ch.totalWrongSiswa2,
        "Irisan Salah Bersama": ch.commonWrongSiswa,
        "Persentase Kesamaan Salah (%)": parseFloat(ch.sharedIncorrectPct.toFixed(2)),
        "Indikasi Kecurangan": ch.isSuspicious ? "MENCURIGAKAN (FLAGGED)" : "Normal"
      }))
    : [
        {
          "Pemberitahuan": "Data tempat_duduk tidak disertakan atau tidak ada pasangan siswa terdeteksi dalam jarak dekat di ruang kelas yang sama."
        }
      ];

  const wsCheating = XLSX.utils.json_to_sheet(cheatingSheetData);
  XLSX.utils.book_append_sheet(wb, wsCheating, "Deteksi Kecurangan");

  // Write and trigger download in browser
  const fileName = `Analisis_Rasch_${identitas.mataPelajaran.replace(/[\s/]+/g, "_")}_Kelas_${identitas.kelas.replace(/[\s/]+/g, "_")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
