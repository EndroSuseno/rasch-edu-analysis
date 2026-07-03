import { JawabanSiswa, TempatDuduk, SeatingCheatingResult } from "./types";

export function detectSeatingCheating(
  jawabanList: JawabanSiswa[],
  kunci: Record<string, string>,
  tempatDuduk: Record<string, TempatDuduk>
): SeatingCheatingResult[] {
  const results: SeatingCheatingResult[] = [];
  const N = jawabanList.length;
  const qKeys = Object.keys(kunci);

  if (Object.keys(tempatDuduk).length === 0) {
    return [];
  }

  // Iterate over all unique pairs of students
  for (let i = 0; i < N; i++) {
    const s1 = jawabanList[i];
    const seat1 = tempatDuduk[s1.nis];
    if (!seat1) continue;

    for (let j = i + 1; j < N; j++) {
      const s2 = jawabanList[j];
      const seat2 = tempatDuduk[s2.nis];
      if (!seat2) continue;

      // Must be in the same room
      if (seat1.ruang !== seat2.ruang) continue;

      // Calculate spatial distance
      const dBaris = Math.abs(seat1.baris - seat2.baris);
      const dKolom = Math.abs(seat1.kolom - seat2.kolom);
      
      // We consider them adjacent if they are horizontal, vertical, or diagonal neighbors
      const isNeighbor = dBaris <= 1 && dKolom <= 1 && (dBaris + dKolom > 0);
      if (!isNeighbor) continue;

      const Manhattan = dBaris + dKolom;

      // Analyze wrong answer pattern
      let totalWrongSiswa1 = 0;
      let totalWrongSiswa2 = 0;
      let commonWrongCount = 0; // count where both answered wrong
      let wrongMatchesCount = 0; // count where both answered wrong AND got the same incorrect answer

      qKeys.forEach((qKey) => {
        const ans1 = (s1.jawabanRaw[qKey] || "").trim().toUpperCase();
        const ans2 = (s2.jawabanRaw[qKey] || "").trim().toUpperCase();
        const correct = (kunci[qKey] || "").trim().toUpperCase();

        const isWrong1 = ans1 !== correct || ans1 === "";
        const isWrong2 = ans2 !== correct || ans2 === "";

        if (isWrong1) totalWrongSiswa1++;
        if (isWrong2) totalWrongSiswa2++;

        if (isWrong1 && isWrong2) {
          commonWrongCount++;
          // If they chose the exact same wrong option (excluding blank empty answers unless specified,
          // but if they both left it empty, we can count it, or only count actual option matches.
          // Let's count actual option matches if they are non-empty, and also if both empty as a match)
          if (ans1 === ans2 && ans1 !== "") {
            wrongMatchesCount++;
          }
        }
      });

      const sharedIncorrectPct = commonWrongCount > 0 
        ? (wrongMatchesCount / commonWrongCount) * 100 
        : 0;

      // Flag as suspicious if sharedIncorrectPct > 70% and they have at least 3 common wrong answers
      // to avoid flagging students with 100% match simply because they both only got 1 wrong answer.
      const isSuspicious = sharedIncorrectPct >= 70 && commonWrongCount >= 3;

      results.push({
        nis1: s1.nis,
        nama1: s1.nama,
        nis2: s2.nis,
        nama2: s2.nama,
        ruang: seat1.ruang,
        posisi1: `Baris ${seat1.baris}, Kolom ${seat1.kolom}`,
        posisi2: `Baris ${seat2.baris}, Kolom ${seat2.kolom}`,
        jarakManhattan: Manhattan,
        wrongMatchesCount,
        totalWrongSiswa1,
        totalWrongSiswa2,
        commonWrongSiswa: commonWrongCount,
        sharedIncorrectPct,
        isSuspicious
      });
    }
  }

  // Sort by shared percentage descending, placing suspicious pairs first
  return results.sort((a, b) => {
    if (a.isSuspicious && !b.isSuspicious) return -1;
    if (!a.isSuspicious && b.isSuspicious) return 1;
    return b.sharedIncorrectPct - a.sharedIncorrectPct;
  });
}
