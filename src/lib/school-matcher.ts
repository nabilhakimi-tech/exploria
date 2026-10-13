/**
 * Utiliti Padanan & Pencarian Pintar Nama Sekolah Malaysia
 * Menyokong variasi akronim (SK, SMK, SMA, SJKC, SJKT), singkatan negeri (KL -> Kuala Lumpur),
 * dan toleransi salah ejaan ringan (cth: "kualau lumpur" -> "kuala lumpur").
 */

export interface SchoolRecord {
  id: string;
  name: string;
  type: string; // 'SK' | 'SMK' | 'SMA' | etc.
  code?: string | null;
  state?: string | null;
  aliases?: string[] | null;
}

// Peta sinonim jenis sekolah
const TYPE_EXPANSIONS: Record<string, string[]> = {
  sk: ['sk', 'sekolah kebangsaan', 'sekolah rendah', 'sr'],
  smk: ['smk', 'sekolah menengah kebangsaan', 'sekolah menengah'],
  sma: ['sma', 'sekolah menengah agama', 'sm agama', 'sekolah agama', 'smar'],
  sjkc: ['sjkc', 'sjk (c)', 'sekolah jenis kebangsaan cina', 'sjk cina'],
  sjkt: ['sjkt', 'sjk (t)', 'sekolah jenis kebangsaan tamil', 'sjk tamil'],
};

// Peta pembetulan salah ejaan umum
const TYPO_REPLACEMENTS: [RegExp, string][] = [
  [/kualau\s*lumpur/gi, 'kuala lumpur'],
  [/kualalumpur/gi, 'kuala lumpur'],
  [/\bkl\b/gi, 'kuala lumpur'],
  [/selangur/gi, 'selangor'],
  [/penang/gi, 'pulau pinang'],
  [/johor\s*bahru/gi, 'johor bahru'],
  [/jb\b/gi, 'johor bahru'],
];

/**
 * Normalisasikan teks input untuk memudahkan perbandingan
 */
export function normalizeSchoolText(input: string): string {
  if (!input) return '';
  let text = input.trim().toLowerCase();

  // Buang tanda baca berlebihan
  text = text.replace(/[-_.,()]/g, ' ');

  // Gantikan salah ejaan biasa
  for (const [regex, replacement] of TYPO_REPLACEMENTS) {
    text = text.replace(regex, replacement);
  }

  // Buang ruang kosong berulang
  return text.replace(/\s+/g, ' ').trim();
}

const GENERIC_TOKENS = new Set([
  'sk', 'smk', 'sma', 'sjk', 'sjkc', 'sjkt', 'sr', 'sm',
  'sekolah', 'kebangsaan', 'menengah', 'agama', 'rendah', 'jenis'
]);

/**
 * Menghitung skor persamaan antara input pengguna dan rekod sekolah
 * Mengembalikan skor 0 - 100 (skor lebih tinggi = lebih tepat)
 */
export function calculateMatchScore(query: string, school: SchoolRecord): number {
  const normQuery = normalizeSchoolText(query);
  if (!normQuery) return 0;

  const schoolNames = [
    school.name,
    ...(Array.isArray(school.aliases) ? school.aliases : []),
  ];

  let maxScore = 0;

  for (const rawName of schoolNames) {
    if (!rawName) continue;
    const normName = normalizeSchoolText(rawName);

    // 1. Padanan tepat (Exact match)
    if (normQuery === normName) {
      return 100;
    }

    const queryTokens = normQuery.split(' ').filter(Boolean);
    const nameTokens = normName.split(' ').filter(Boolean);

    // Semak perkataan khusus (bukan jenis umum seperti sk/smk)
    const distinctiveQueryTokens = queryTokens.filter((t) => !GENERIC_TOKENS.has(t));
    if (distinctiveQueryTokens.length > 0) {
      // Jika pengguna menaip perkataan khusus (cth: "kampu"), ia MESTI padan dengan rekod sekolah
      const matchedDistinctive = distinctiveQueryTokens.filter((dToken) =>
        nameTokens.some(
          (nToken) =>
            !GENERIC_TOKENS.has(nToken) &&
            (nToken.startsWith(dToken) || dToken.startsWith(nToken) || nToken.includes(dToken))
        )
      );

      // Jika tiada satu pun perkataan khusus padan, abaikan rekod ini (bukan padanan)
      if (matchedDistinctive.length === 0) {
        continue;
      }
    }

    // 2. Query mengandungi nama sekolah atau sebaliknya
    if (normName.includes(normQuery)) {
      const score = 80 + (normQuery.length / normName.length) * 15;
      if (score > maxScore) maxScore = score;
    }

    if (normQuery.includes(normName)) {
      const score = 75;
      if (score > maxScore) maxScore = score;
    }

    // 3. Token-based matching (memeriksa setiap perkataan)
    let matchedTokens = 0;
    for (const qToken of queryTokens) {
      // Semak jika token jenis sekolah padan
      const isTypeMatched = Object.entries(TYPE_EXPANSIONS).some(([abbr, expansions]) => {
        const queryHasType = expansions.some((exp) => exp.includes(qToken) || qToken === exp);
        const nameHasType = expansions.some((exp) => normName.includes(exp) || exp === school.type.toLowerCase());
        return queryHasType && nameHasType;
      });

      if (isTypeMatched || nameTokens.some((nToken) => nToken.includes(qToken) || qToken.includes(nToken))) {
        matchedTokens++;
      }
    }

    if (queryTokens.length > 0) {
      const tokenRatio = matchedTokens / queryTokens.length;
      if (tokenRatio >= 0.5) {
        const score = tokenRatio * 70;
        if (score > maxScore) maxScore = score;
      }
    }
  }

  // Semak kod sekolah (cth: WBA0001)
  if (school.code && normQuery.includes(school.code.toLowerCase())) {
    return 95;
  }

  return maxScore;
}

/**
 * Tapis dan susun senarai sekolah mengikut perkaitan query pengguna
 */
export function matchSchools(query: string, schoolsList: SchoolRecord[], limit = 10): SchoolRecord[] {
  if (!query || !query.trim()) {
    return schoolsList.slice(0, limit);
  }

  const scored = schoolsList
    .map((school) => ({
      school,
      score: calculateMatchScore(query, school),
    }))
    .filter((item) => item.score >= 50)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.school);
}
