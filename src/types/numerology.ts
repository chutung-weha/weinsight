export interface NumerologyResult {
  lifePath: number;       // Số chủ đạo
  attitude: number;       // Chỉ số thái độ
  naturalAbility: number; // Năng lực tự nhiên
  expression: number;     // Chỉ số sứ mệnh
  soulUrge: number;       // Chỉ số linh hồn
  personality: number;    // Chỉ số nhân cách
}

export interface NumerologyInput {
  fullName: string;
  day: number;
  month: number;
  year: number;
}
