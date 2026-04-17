import { describe, expect, it } from "vitest";
import { startTestSchema } from "./test";

describe("startTestSchema", () => {
  describe("DISC test yêu cầu đủ 3 field cá nhân", () => {
    const validDiscData = {
      testType: "DISC" as const,
      candidateName: "Nguyễn Văn A",
      dateOfBirth: "1990-05-15",
      occupation: "Kỹ sư",
    };

    it("pass khi có đủ candidateName + dateOfBirth + occupation", () => {
      const result = startTestSchema.safeParse(validDiscData);
      expect(result.success).toBe(true);
    });

    it("fail khi thiếu candidateName", () => {
      const { candidateName: _, ...rest } = validDiscData;
      void _;
      const result = startTestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("fail khi thiếu dateOfBirth", () => {
      const { dateOfBirth: _, ...rest } = validDiscData;
      void _;
      const result = startTestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("fail khi thiếu occupation", () => {
      const { occupation: _, ...rest } = validDiscData;
      void _;
      const result = startTestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("fail khi candidateName quá ngắn", () => {
      const result = startTestSchema.safeParse({ ...validDiscData, candidateName: "A" });
      expect(result.success).toBe(false);
    });

    it("fail khi dateOfBirth sai format", () => {
      const result = startTestSchema.safeParse({ ...validDiscData, dateOfBirth: "15/05/1990" });
      expect(result.success).toBe(false);
    });
  });

  describe("LOGIC/SITUATION test không bắt buộc 3 field", () => {
    it("LOGIC pass khi chỉ có testType", () => {
      const result = startTestSchema.safeParse({ testType: "LOGIC" });
      expect(result.success).toBe(true);
    });

    it("SITUATION pass khi chỉ có testType", () => {
      const result = startTestSchema.safeParse({ testType: "SITUATION" });
      expect(result.success).toBe(true);
    });
  });

  it("reject testType không hợp lệ", () => {
    const result = startTestSchema.safeParse({ testType: "NUMEROLOGY" });
    expect(result.success).toBe(false);
  });
});
