import { ScoredSiswa, RaschItemResult, RaschPersonResult, RaschSummary, Identitas } from "./types";

// Helper for Pearson correlation (used for point-biserial)
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (den === 0) return 0;
  return num / den;
}

export function performRaschJMLE(
  scoredSiswa: ScoredSiswa[],
  qKeys: string[],
  identitas: Identitas
): { items: RaschItemResult[]; persons: RaschPersonResult[]; summary: RaschSummary } {
  const N = scoredSiswa.length; // Number of persons
  const L = qKeys.length;       // Number of items

  // 1. Prepare responses matrix
  // X[n][i] is the response of student n to item i
  const X: number[][] = [];
  scoredSiswa.forEach((siswa) => {
    const row: number[] = [];
    qKeys.forEach((qKey) => {
      row.push(siswa.scores[qKey] ?? 0);
    });
    X.push(row);
  });

  // Calculate actual sum scores
  const personScoresRaw = X.map(row => row.reduce((sum, val) => sum + val, 0));
  const itemScoresRaw = Array(L).fill(0);
  for (let i = 0; i < L; i++) {
    for (let n = 0; n < N; n++) {
      itemScoresRaw[i] += X[n][i];
    }
  }

  // 2. Adjust extreme scores for JMLE convergence
  // Persons
  const R: number[] = []; // Adjusted scores
  for (let n = 0; n < N; n++) {
    const score = personScoresRaw[n];
    if (score === 0) {
      R.push(0.5);
    } else if (score === L) {
      R.push(L - 0.5);
    } else {
      R.push(score);
    }
  }

  // Items
  const S: number[] = []; // Adjusted scores
  for (let i = 0; i < L; i++) {
    const score = itemScoresRaw[i];
    if (score === 0) {
      S.push(0.5);
    } else if (score === N) {
      S.push(N - 0.5);
    } else {
      S.push(score);
    }
  }

  // 3. Initialize parameter values (logits)
  // Standard initial values: log-odds
  const theta = R.map(rn => Math.log(rn / (L - rn)));
  const b = S.map(si => Math.log((N - si) / si));

  // Center difficulties
  let sumB = b.reduce((sum, val) => sum + val, 0);
  let meanB = sumB / L;
  for (let i = 0; i < L; i++) {
    b[i] -= meanB;
  }
  for (let n = 0; n < N; n++) {
    theta[n] -= meanB;
  }

  // 4. JMLE Iterations
  const maxIterations = 50;
  const tolerance = 0.005;

  for (let iter = 0; iter < maxIterations; iter++) {
    let maxChange = 0;

    // A. Update theta (person abilities)
    for (let n = 0; n < N; n++) {
      let expectedScore = 0;
      let varianceSum = 0;

      for (let i = 0; i < L; i++) {
        const diff = theta[n] - b[i];
        const p_ni = Math.exp(diff) / (1 + Math.exp(diff));
        expectedScore += p_ni;
        varianceSum += p_ni * (1 - p_ni);
      }

      if (varianceSum > 0) {
        const change = (R[n] - expectedScore) / varianceSum;
        // Cap change to avoid explosive logits
        const cappedChange = Math.max(-1.5, Math.min(1.5, change));
        theta[n] += cappedChange;
        if (Math.abs(cappedChange) > maxChange) {
          maxChange = Math.abs(cappedChange);
        }
      }
    }

    // B. Update b (item difficulties)
    for (let i = 0; i < L; i++) {
      let expectedScore = 0;
      let varianceSum = 0;

      for (let n = 0; n < N; n++) {
        const diff = theta[n] - b[i];
        const p_ni = Math.exp(diff) / (1 + Math.exp(diff));
        expectedScore += p_ni;
        varianceSum += p_ni * (1 - p_ni);
      }

      if (varianceSum > 0) {
        // b_i is subtracted by the score error
        const change = -(S[i] - expectedScore) / varianceSum;
        const cappedChange = Math.max(-1.5, Math.min(1.5, change));
        b[i] += cappedChange;
        if (Math.abs(cappedChange) > maxChange) {
          maxChange = Math.abs(cappedChange);
        }
      }
    }

    // C. Re-center b to ensure mean(b) = 0
    sumB = b.reduce((sum, val) => sum + val, 0);
    meanB = sumB / L;
    for (let i = 0; i < L; i++) {
      b[i] -= meanB;
    }
    for (let n = 0; n < N; n++) {
      theta[n] -= meanB;
    }

    // If max change is smaller than threshold, we're done
    if (maxChange < tolerance) {
      break;
    }
  }

  // 5. Compute Fit Statistics and Standard Errors
  const P: number[][] = [];
  const Q: number[][] = [];
  const W: number[][] = [];

  for (let n = 0; n < N; n++) {
    P.push([]);
    Q.push([]);
    W.push([]);
    for (let i = 0; i < L; i++) {
      const diff = theta[n] - b[i];
      const p_ni = Math.exp(diff) / (1 + Math.exp(diff));
      const q_ni = 1 - p_ni;
      P[n].push(p_ni);
      Q[n].push(q_ni);
      W[n].push(p_ni * q_ni);
    }
  }

  // --- Item Fit Stats ---
  const itemInfit: number[] = Array(L).fill(0);
  const itemOutfit: number[] = Array(L).fill(0);
  const itemSE: number[] = Array(L).fill(0);

  for (let i = 0; i < L; i++) {
    let sumSquaredResidual = 0; // Σ (X_ni - P_ni)^2
    let sumVariance = 0;        // Σ P_ni * Q_ni
    let sumOutfitTerms = 0;     // Σ [ (X_ni - P_ni)^2 / (P_ni * Q_ni) ]

    for (let n = 0; n < N; n++) {
      const residual = X[n][i] - P[n][i];
      const resSquared = residual * residual;
      const var_ni = W[n][i];

      sumSquaredResidual += resSquared;
      sumVariance += var_ni;
      
      if (var_ni > 0.0001) {
        sumOutfitTerms += resSquared / var_ni;
      }
    }

    itemInfit[i] = sumVariance > 0 ? sumSquaredResidual / sumVariance : 1.0;
    itemOutfit[i] = N > 0 ? sumOutfitTerms / N : 1.0;
    itemSE[i] = sumVariance > 0 ? 1 / Math.sqrt(sumVariance) : 1.0;
  }

  // --- Person Fit Stats ---
  const personInfit: number[] = Array(N).fill(0);
  const personOutfit: number[] = Array(N).fill(0);
  const personSE: number[] = Array(N).fill(0);

  for (let n = 0; n < N; n++) {
    let sumSquaredResidual = 0;
    let sumVariance = 0;
    let sumOutfitTerms = 0;

    for (let i = 0; i < L; i++) {
      const residual = X[n][i] - P[n][i];
      const resSquared = residual * residual;
      const var_ni = W[n][i];

      sumSquaredResidual += resSquared;
      sumVariance += var_ni;

      if (var_ni > 0.0001) {
        sumOutfitTerms += resSquared / var_ni;
      }
    }

    personInfit[n] = sumVariance > 0 ? sumSquaredResidual / sumVariance : 1.0;
    personOutfit[n] = L > 0 ? sumOutfitTerms / L : 1.0;
    personSE[n] = sumVariance > 0 ? 1 / Math.sqrt(sumVariance) : 1.0;
  }

  // --- Classical Test Theory Stats (for Items) ---
  // Difficulty proportion (p)
  const itemP = itemScoresRaw.map(s => s / N);
  
  // Point-Biserial Correlation
  // Vector of student total scores
  const studentTotals = scoredSiswa.map(s => s.totalSkor);
  const ptBiserial: number[] = [];
  for (let i = 0; i < L; i++) {
    // Collect column responses
    const itemScoresCol = X.map(row => row[i]);
    ptBiserial.push(pearsonCorrelation(itemScoresCol, studentTotals));
  }

  // --- Reliability Calculations ---
  // 1. Person Separation Reliability
  const meanPersonSE2 = personSE.reduce((sum, se) => sum + se * se, 0) / N;
  const meanTheta = theta.reduce((sum, t) => sum + t, 0) / N;
  const varObsTheta = theta.reduce((sum, t) => sum + Math.pow(t - meanTheta, 2), 0) / N;
  const varTrueTheta = Math.max(0, varObsTheta - meanPersonSE2);
  const personSeparation = meanPersonSE2 > 0 ? Math.sqrt(varTrueTheta / meanPersonSE2) : 0;
  const personReliability = varObsTheta > 0 ? varTrueTheta / varObsTheta : 0;

  // 2. Item Separation Reliability
  const meanItemSE2 = itemSE.reduce((sum, se) => sum + se * se, 0) / L;
  const meanB_val = b.reduce((sum, val) => sum + val, 0) / L; // should be close to 0
  const varObsB = b.reduce((sum, val) => sum + Math.pow(val - meanB_val, 2), 0) / L;
  const varTrueB = Math.max(0, varObsB - meanItemSE2);
  const itemSeparation = meanItemSE2 > 0 ? Math.sqrt(varTrueB / meanItemSE2) : 0;
  const itemReliability = varObsB > 0 ? varTrueB / varObsB : 0;

  // 3. Cronbach Alpha
  // Variance of item scores: since items are binary, Var(item) = p_i * (1 - p_i)
  const sumItemVariances = itemP.reduce((sum, p) => sum + p * (1 - p), 0);
  // Variance of total student scores
  const meanTotalScore = studentTotals.reduce((sum, t) => sum + t, 0) / N;
  const varTotalScore = studentTotals.reduce((sum, t) => sum + Math.pow(t - meanTotalScore, 2), 0) / N;
  
  const cronbachAlpha = (L > 1 && varTotalScore > 0) 
    ? (L / (L - 1)) * (1 - sumItemVariances / varTotalScore) 
    : 0;

  // --- Formatting Final Outputs ---
  // Create RaschItemResult array
  const itemResults: RaschItemResult[] = qKeys.map((qKey, index) => {
    const p = itemP[index];
    const ptBis = ptBiserial[index];
    const difficulty = b[index];
    const infitMNSQ = itemInfit[index];
    const outfitMNSQ = itemOutfit[index];

    // Tingkat Kesukaran Category
    let category: "Mudah" | "Sedang" | "Sulit" = "Sedang";
    if (p > 0.8) {
      category = "Mudah";
    } else if (p < 0.3) {
      category = "Sulit";
    }

    // Daya Beda Category
    let ptBisCategory: "Baik" | "Cukup" | "Lemah" = "Lemah";
    if (ptBis >= 0.40) {
      ptBisCategory = "Baik";
    } else if (ptBis >= 0.30) {
      ptBisCategory = "Cukup";
    }

    // Fit status
    let fitStatus: "Fit" | "Degrading" | "Misfit" = "Fit";
    if (infitMNSQ < 0.5 || outfitMNSQ < 0.5) {
      fitStatus = "Degrading";
    } else if (infitMNSQ > 1.5 || outfitMNSQ > 1.5) {
      fitStatus = "Misfit";
    }

    return {
      noSoal: qKey,
      p,
      category,
      ptBis,
      ptBisCategory,
      difficulty,
      infitMNSQ,
      outfitMNSQ,
      fitStatus
    };
  });

  // Create RaschPersonResult array
  let tuntasCount = 0;
  const personResults: RaschPersonResult[] = scoredSiswa.map((siswa, index) => {
    const rawScore = siswa.totalSkor;
    const pctBenar = siswa.pctBenar;
    const ability = theta[index];
    const se = personSE[index];
    const infitMNSQ = personInfit[index];
    const outfitMNSQ = personOutfit[index];

    // Check KKM (e.g. KKM 75, we compare rawScore/L * 100 with KKM)
    const scorePct = (rawScore / L) * 100;
    const tuntas = scorePct >= identitas.kkm;
    if (tuntas) {
      tuntasCount++;
    }

    return {
      no: index + 1,
      nis: siswa.nis,
      nama: siswa.nama,
      skor: rawScore,
      pctBenar,
      ability,
      se,
      infitMNSQ,
      outfitMNSQ,
      keterangan: tuntas ? "Tuntas" : "Tidak Tuntas"
    };
  });

  const summary: RaschSummary = {
    totalSiswa: N,
    totalSoal: L,
    rataRataSkor: studentTotals.reduce((sum, val) => sum + val, 0) / N,
    kkm: identitas.kkm,
    jumlahTuntas: tuntasCount,
    persenTuntas: N > 0 ? (tuntasCount / N) * 100 : 0,
    personSeparationReliability: personReliability,
    itemReliability: itemReliability,
    cronbachAlpha: cronbachAlpha,
    personMeanAbility: meanTheta,
    itemMeanDifficulty: meanB_val
  };

  return {
    items: itemResults,
    persons: personResults,
    summary
  };
}
