export interface Identitas {
  sekolah: string;
  mataPelajaran: string;
  kelas: string;
  guru: string;
  semester: string;
  tahunAjaran: string;
  tanggalTes: string;
  jumlahSoal: number;
  kkm: number;
}

export interface JawabanSiswa {
  no: number;
  nis: string;
  nama: string;
  jawabanRaw: Record<string, string>; // e.g. { s1: 'A', s2: 'B', ... }
}

export interface KunciJawaban {
  soal: string; // e.g. "s1", "s2"
  kunci: string; // e.g. "A"
}

export interface TempatDuduk {
  nis: string;
  baris: number;
  kolom: number;
  ruang: string;
}

export interface ScoredSiswa {
  nis: string;
  nama: string;
  scores: Record<string, number>; // s1: 1, s2: 0
  totalSkor: number;
  pctBenar: number;
  jawabanRaw: Record<string, string>;
}

export interface RaschItemResult {
  noSoal: string; // e.g. "s1"
  p: number; // proportion correct (0 to 1)
  category: "Mudah" | "Sedang" | "Sulit";
  ptBis: number; // point-biserial correlation
  ptBisCategory: "Baik" | "Cukup" | "Lemah";
  difficulty: number; // logit
  infitMNSQ: number;
  outfitMNSQ: number;
  fitStatus: "Fit" | "Degrading" | "Misfit";
}

export interface RaschPersonResult {
  no: number;
  nis: string;
  nama: string;
  skor: number;
  pctBenar: number;
  ability: number; // logit
  se: number;
  infitMNSQ: number;
  outfitMNSQ: number;
  keterangan: "Tuntas" | "Tidak Tuntas";
}

export interface SeatingCheatingResult {
  nis1: string;
  nama1: string;
  nis2: string;
  nama2: string;
  ruang: string;
  posisi1: string; // e.g., "Baris 1, Kolom 2"
  posisi2: string; // e.g., "Baris 1, Kolom 3"
  jarakManhattan: number;
  wrongMatchesCount: number;
  totalWrongSiswa1: number;
  totalWrongSiswa2: number;
  commonWrongSiswa: number; // number of items both answered wrong
  sharedIncorrectPct: number; // (common wrong answers / total union of wrong answers) * 100
  isSuspicious: boolean;
}

export interface RaschSummary {
  totalSiswa: number;
  totalSoal: number;
  rataRataSkor: number;
  kkm: number;
  jumlahTuntas: number;
  persenTuntas: number;
  personSeparationReliability: number;
  itemReliability: number;
  cronbachAlpha: number;
  personMeanAbility: number;
  itemMeanDifficulty: number;
}

export interface FullRaschAnalysisData {
  identitas: Identitas;
  items: RaschItemResult[];
  persons: RaschPersonResult[];
  cheating: SeatingCheatingResult[];
  summary: RaschSummary;
  rawAnswers: JawabanSiswa[];
  kunci: Record<string, string>;
  seats: Record<string, TempatDuduk>;
}
