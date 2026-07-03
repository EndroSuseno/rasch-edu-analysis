import { JawabanSiswa, ScoredSiswa } from "./types";

export function scoreStudentAnswers(
  jawabanList: JawabanSiswa[],
  kunci: Record<string, string>
): ScoredSiswa[] {
  const qKeys = Object.keys(kunci);
  
  return jawabanList.map((j) => {
    const scores: Record<string, number> = {};
    let total = 0;
    
    qKeys.forEach((qKey) => {
      const studentAns = (j.jawabanRaw[qKey] || "").trim().toUpperCase();
      const keyAns = (kunci[qKey] || "").trim().toUpperCase();
      
      const isCorrect = studentAns === keyAns && keyAns !== "" && studentAns !== "";
      const score = isCorrect ? 1 : 0;
      scores[qKey] = score;
      total += score;
    });

    const pctBenar = qKeys.length > 0 ? (total / qKeys.length) * 100 : 0;

    return {
      nis: j.nis,
      nama: j.nama,
      scores,
      totalSkor: total,
      pctBenar,
      jawabanRaw: j.jawabanRaw
    };
  });
}
