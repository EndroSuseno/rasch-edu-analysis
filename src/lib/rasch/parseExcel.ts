import * as XLSX from "xlsx";
import { Identitas, JawabanSiswa, KunciJawaban, TempatDuduk } from "./types";

export interface ParsedExcelData {
  identitas: Identitas;
  jawaban: JawabanSiswa[];
  kunci: Record<string, string>; // e.g. { "s1": "A", "s2": "B" }
  tempatDuduk: Record<string, TempatDuduk>; // indexed by NIS
}

// Normalize key name to match our expected identitas keys
function normalizeKey(key: string): string {
  if (!key) return "";
  return key.toString().trim().toLowerCase().replace(/[\s_:-]+/g, "");
}

export function parseExcelTemplate(arrayBuffer: ArrayBuffer): ParsedExcelData {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
  
  // Find sheets with case-insensitive / loose matching
  let jawabanSheetName = "";
  let kunciSheetName = "";
  let identitasSheetName = "";
  let tempatDudukSheetName = "";

  for (const name of workbook.SheetNames) {
    const norm = name.toLowerCase().replace(/[\s_]+/g, "");
    if (norm === "jawaban") jawabanSheetName = name;
    else if (norm === "kunci") kunciSheetName = name;
    else if (norm === "identitas") identitasSheetName = name;
    else if (norm === "tempatduduk" || norm === "seating" || norm === "tempatduduks") tempatDudukSheetName = name;
  }

  // Fallbacks if not exact
  if (!jawabanSheetName) jawabanSheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("jawab")) || "";
  if (!kunciSheetName) kunciSheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("kunci")) || "";
  if (!identitasSheetName) identitasSheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("ident")) || "";
  if (!tempatDudukSheetName) tempatDudukSheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("duduk") || n.toLowerCase().includes("seat")) || "";

  if (!jawabanSheetName) throw new Error("Sheet 'jawaban' tidak ditemukan di file Excel.");
  if (!kunciSheetName) throw new Error("Sheet 'kunci' tidak ditemukan di file Excel.");
  if (!identitasSheetName) throw new Error("Sheet 'identitas' tidak ditemukan di file Excel.");
  
  // --- 1. PARSE IDENTITAS ---
  const identitasSheet = workbook.Sheets[identitasSheetName];
  const identRaw: any[] = XLSX.utils.sheet_to_json(identitasSheet, { header: 1 });
  
  const identitas: Identitas = {
    sekolah: "-",
    mataPelajaran: "-",
    kelas: "-",
    guru: "-",
    semester: "-",
    tahunAjaran: "-",
    tanggalTes: "-",
    jumlahSoal: 25,
    kkm: 75
  };

  // Identitas is usually a list of key-value pairs in 2 columns
  for (const row of identRaw) {
    if (Array.isArray(row) && row.length >= 2) {
      const rawKey = row[0];
      const rawVal = row[1];
      if (rawKey !== undefined && rawVal !== undefined) {
        const keyNorm = normalizeKey(rawKey);
        const valStr = rawVal.toString().trim();
        
        switch (keyNorm) {
          case "sekolah":
          case "namasekolah":
            identitas.sekolah = valStr;
            break;
          case "matapelajaran":
          case "mapel":
          case "matapej":
          case "mataujian":
            identitas.mataPelajaran = valStr;
            break;
          case "kelas":
            identitas.kelas = valStr;
            break;
          case "guru":
          case "namaguru":
          case "pengajar":
          case "namapengajar":
          case "gurupengampu":
          case "gurumapel":
            identitas.guru = valStr;
            break;
          case "semester":
            identitas.semester = valStr;
            break;
          case "tahunajaran":
          case "ta":
          case "tahunajar":
            identitas.tahunAjaran = valStr;
            break;
          case "tanggaltes":
          case "tanggal":
          case "tgl":
          case "tglujian":
          case "tanggalujian":
            identitas.tanggalTes = valStr;
            break;
          case "jumlahsoal":
          case "jmlsoal":
            identitas.jumlahSoal = parseInt(valStr, 10) || 25;
            break;
          case "kkm":
            identitas.kkm = parseFloat(valStr) || 75;
            break;
        }
      }
    }
  }

  // --- 2. PARSE KUNCI JAWABAN ---
  const kunciSheet = workbook.Sheets[kunciSheetName];
  const kunciRaw: any[] = XLSX.utils.sheet_to_json(kunciSheet);
  const kunci: Record<string, string> = {};

  // Support both key-value rows and single row with s1..s25 columns
  if (kunciRaw.length > 0) {
    const firstRowKeys = Object.keys(kunciRaw[0]).map(k => k.toLowerCase());
    
    // Pattern A: rows with "no" (or "soal") and "kunci"
    const hasNoAndKunci = firstRowKeys.includes("kunci") && 
      (firstRowKeys.includes("no") || firstRowKeys.includes("soal") || firstRowKeys.includes("nomor"));

    if (hasNoAndKunci) {
      kunciRaw.forEach((row: any) => {
        let qKey = "";
        let qVal = "";
        
        Object.keys(row).forEach(k => {
          const normK = k.toLowerCase();
          if (normK === "no" || normK === "soal" || normK === "nomor") {
            qKey = row[k].toString().trim();
          } else if (normK === "kunci") {
            qVal = row[k].toString().trim();
          }
        });

        if (qKey && qVal) {
          // If key is a simple number (like "1"), convert to "s1"
          if (/^\d+$/.test(qKey)) {
            qKey = "s" + qKey;
          } else {
            qKey = qKey.toLowerCase();
          }
          kunci[qKey] = qVal.toUpperCase();
        }
      });
    } else {
      // Pattern B: single row with s1, s2, s3 columns
      const row = kunciRaw[0];
      Object.keys(row).forEach(k => {
        const val = row[k];
        if (val && k.toLowerCase() !== "no" && k.toLowerCase() !== "id") {
          let qKey = k.toLowerCase();
          if (/^\d+$/.test(qKey)) {
            qKey = "s" + qKey;
          }
          kunci[qKey] = val.toString().trim().toUpperCase();
        }
      });
    }
  }

  // --- 3. PARSE JAWABAN SISWA ---
  const jawabanSheet = workbook.Sheets[jawabanSheetName];
  const jawabanRaw: any[] = XLSX.utils.sheet_to_json(jawabanSheet);
  const jawaban: JawabanSiswa[] = [];

  jawabanRaw.forEach((row: any, index: number) => {
    // We expect "nis" and "nama" and multiple answer columns
    let nis = "";
    let nama = "";
    let no = index + 1;
    const jawabanRawMap: Record<string, string> = {};

    Object.keys(row).forEach(k => {
      const val = row[k];
      const normK = k.toLowerCase().trim();
      const valStr = val !== undefined && val !== null ? val.toString().trim() : "";

      if (normK === "nis") {
        nis = valStr;
      } else if (normK === "nama") {
        nama = valStr;
      } else if (normK === "no" || normK === "nomor") {
        no = parseInt(valStr, 10) || (index + 1);
      } else {
        // Any other column is assumed to be a question column (e.g. s1, s2, or simply "1", "2")
        // If it's a numeric column name, prefix with 's' to match s1, s2
        let qKey = normK;
        if (/^\d+$/.test(qKey)) {
          qKey = "s" + qKey;
        }
        
        // We only parse if the column looks like an answer or starts with s
        if (qKey.startsWith("s") && /^\d+$/.test(qKey.substring(1))) {
          jawabanRawMap[qKey] = valStr.toUpperCase();
        } else if (qKey in kunci || normK in kunci) {
          // If it matches a key in the answer key map, we keep it!
          jawabanRawMap[qKey] = valStr.toUpperCase();
        }
      }
    });

    if (nis && nama) {
      jawaban.push({
        no,
        nis,
        nama,
        jawabanRaw: jawabanRawMap
      });
    }
  });

  // --- 4. PARSE TEMPAT DUDUK (OPTIONAL, FALLBACK TO EMPTY) ---
  const tempatDuduk: Record<string, TempatDuduk> = {};
  if (tempatDudukSheetName) {
    const seatSheet = workbook.Sheets[tempatDudukSheetName];
    const seatRaw: any[] = XLSX.utils.sheet_to_json(seatSheet);
    
    seatRaw.forEach((row: any) => {
      let nis = "";
      let baris = 0;
      let kolom = 0;
      let ruang = "Utama";

      Object.keys(row).forEach(k => {
        const val = row[k];
        const normK = k.toLowerCase().trim();
        const valStr = val !== undefined && val !== null ? val.toString().trim() : "";

        if (normK === "nis") {
          nis = valStr;
        } else if (normK === "baris") {
          baris = parseInt(valStr, 10) || 0;
        } else if (normK === "kolom") {
          kolom = parseInt(valStr, 10) || 0;
        } else if (normK === "ruang") {
          ruang = valStr;
        }
      });

      if (nis) {
        tempatDuduk[nis] = {
          nis,
          baris,
          kolom,
          ruang
        };
      }
    });
  }

  // Ensure items matches the keys in 'kunci' sheet if we missed some questions
  // Let's do some validation
  if (jawaban.length === 0) {
    throw new Error("Tidak ada data siswa yang valid di sheet 'jawaban'. Harap isi kolom 'nis', 'nama', dan kolom jawaban (s1, s2, dst).");
  }

  // Fill in missing keys if sheet kunci had question numbers but not s-prefix
  const finalKunci: Record<string, string> = {};
  Object.keys(kunci).forEach(k => {
    let finalK = k;
    if (!k.startsWith("s") && /^\d+$/.test(k)) {
      finalK = "s" + k;
    }
    finalKunci[finalK] = kunci[k];
  });

  return {
    identitas,
    jawaban,
    kunci: finalKunci,
    tempatDuduk
  };
}
