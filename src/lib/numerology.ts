import type { NumerologyResult } from "@/types/numerology";

// ─── Bảng quy đổi Pythagoras ─────────────────────────
const PYTHAGORAS: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

// ─── Helpers ──────────────────────────────────────────

/** Bỏ dấu tiếng Việt: Đ→D + NFD normalize */
export function stripVietnameseDiacritics(str: string): string {
  return str
    .replace(/\u0110/g, "D") // Đ → D
    .replace(/\u0111/g, "d") // đ → d
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

/** Cộng tất cả chữ số của một số: 153 → 1+5+3 = 9 */
function sumDigits(n: number): number {
  return Math.abs(n)
    .toString()
    .split("")
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
}

/** Rút gọn về 1 chữ số. keepMaster=true giữ 11, 22 */
export function reduceToDigit(n: number, keepMaster = false): number {
  let result = n;
  while (result > 9) {
    if (keepMaster && (result === 11 || result === 22)) break;
    result = sumDigits(result);
  }
  return result;
}

/** Quy đổi 1 chữ cái → số Pythagoras (0 nếu không hợp lệ) */
function letterToNumber(char: string): number {
  return PYTHAGORAS[char] || 0;
}

// ─── Tính từ ngày sinh ────────────────────────────────

/** Số chủ đạo: tổng từng nhóm ngày+tháng+năm → rút gọn (giữ 11, 22) */
export function calculateLifePath(day: number, month: number, year: number): number {
  const dayReduced = reduceToDigit(sumDigits(day));
  const monthReduced = reduceToDigit(sumDigits(month));
  const yearReduced = reduceToDigit(sumDigits(year));
  return reduceToDigit(dayReduced + monthReduced + yearReduced, true);
}

/** Chỉ số thái độ: tổng chữ số DD+MM → rút gọn 1-9 */
export function calculateAttitude(day: number, month: number): number {
  return reduceToDigit(sumDigits(day) + sumDigits(month));
}

/** Năng lực tự nhiên: tổng chữ số DD → rút gọn 1-9 */
export function calculateNaturalAbility(day: number): number {
  return reduceToDigit(sumDigits(day));
}

// ─── Tính từ tên ──────────────────────────────────────

/**
 * Tính tổng giá trị Pythagoras cho 1 chuỗi ký tự.
 * filter: "all" = tất cả, "vowels" = chỉ nguyên âm, "consonants" = chỉ phụ âm
 */
function sumNameLetters(
  name: string,
  filter: "all" | "vowels" | "consonants"
): number {
  const cleaned = stripVietnameseDiacritics(name);
  const words = cleaned.split(/\s+/).filter(Boolean);

  // Rút gọn từng từ trước, rồi cộng
  let total = 0;
  for (const word of words) {
    let wordSum = 0;
    for (const char of word) {
      const isVowel = VOWELS.has(char);
      if (filter === "vowels" && !isVowel) continue;
      if (filter === "consonants" && isVowel) continue;
      wordSum += letterToNumber(char);
    }
    total += reduceToDigit(wordSum);
  }
  return total;
}

/** Chỉ số sứ mệnh: tất cả chữ cái → rút gọn (giữ 11, 22) */
export function calculateExpression(fullName: string): number {
  return reduceToDigit(sumNameLetters(fullName, "all"), true);
}

/** Chỉ số linh hồn: chỉ nguyên âm → rút gọn (giữ 11, 22) */
export function calculateSoulUrge(fullName: string): number {
  return reduceToDigit(sumNameLetters(fullName, "vowels"), true);
}

/** Chỉ số nhân cách: chỉ phụ âm → rút gọn (giữ 11, 22) */
export function calculatePersonality(fullName: string): number {
  return reduceToDigit(sumNameLetters(fullName, "consonants"), true);
}

// ─── Calculate All ────────────────────────────────────

export function calculateAll(
  fullName: string,
  day: number,
  month: number,
  year: number
): NumerologyResult {
  return {
    lifePath: calculateLifePath(day, month, year),
    attitude: calculateAttitude(day, month),
    naturalAbility: calculateNaturalAbility(day),
    expression: calculateExpression(fullName),
    soulUrge: calculateSoulUrge(fullName),
    personality: calculatePersonality(fullName),
  };
}
