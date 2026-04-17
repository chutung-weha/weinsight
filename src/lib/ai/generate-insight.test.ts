import { describe, expect, it } from "vitest";
import { getInsightEligibility } from "./generate-insight";

describe("getInsightEligibility", () => {
  const validInput = {
    testType: "DISC" as const,
    status: "COMPLETED",
    candidateName: "Nguyễn Văn A",
    dateOfBirth: new Date("1990-05-15"),
    occupation: "Kỹ sư phần mềm",
  };

  it("eligible khi đủ mọi điều kiện DISC", () => {
    const result = getInsightEligibility(validInput);
    expect(result.eligible).toBe(true);
    expect(result.reason).toBeNull();
  });

  it("không eligible với LOGIC test", () => {
    const result = getInsightEligibility({ ...validInput, testType: "LOGIC" });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("DISC");
  });

  it("không eligible với SITUATION test", () => {
    const result = getInsightEligibility({ ...validInput, testType: "SITUATION" });
    expect(result.eligible).toBe(false);
  });

  it("không eligible khi status khác COMPLETED", () => {
    const result = getInsightEligibility({ ...validInput, status: "IN_PROGRESS" });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("chưa hoàn thành");
  });

  it("không eligible khi thiếu candidateName", () => {
    const result = getInsightEligibility({ ...validInput, candidateName: null });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("tên");
  });

  it("không eligible khi candidateName là chuỗi rỗng", () => {
    const result = getInsightEligibility({ ...validInput, candidateName: "" });
    expect(result.eligible).toBe(false);
  });

  it("không eligible khi thiếu dateOfBirth", () => {
    const result = getInsightEligibility({ ...validInput, dateOfBirth: null });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("ngày sinh");
  });

  it("không eligible khi thiếu occupation", () => {
    const result = getInsightEligibility({ ...validInput, occupation: null });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("nghề nghiệp");
  });

  it("không eligible khi occupation chỉ có whitespace", () => {
    const result = getInsightEligibility({ ...validInput, occupation: "   " });
    expect(result.eligible).toBe(false);
  });
});
