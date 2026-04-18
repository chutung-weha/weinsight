import { describe, expect, it } from "vitest";
import { getInsightEligibility, toInsightText } from "./generate-insight";

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

describe("toInsightText", () => {
  it("trả string đã trim", () => {
    expect(toInsightText("  hello  ")).toBe("hello");
  });

  it("trả rỗng cho null/undefined", () => {
    expect(toInsightText(null)).toBe("");
    expect(toInsightText(undefined)).toBe("");
  });

  it("extract field text từ object", () => {
    expect(toInsightText({ text: "abc" })).toBe("abc");
  });

  it("extract field content từ object", () => {
    expect(toInsightText({ content: "xyz" })).toBe("xyz");
  });

  it("extract preferred key đầu tiên tìm được (text ưu tiên trước content)", () => {
    expect(toInsightText({ content: "content-val", text: "text-val" })).toBe("text-val");
  });

  it("không trả '[object Object]' cho object bất kỳ", () => {
    const result = toInsightText({ foo: "bar", baz: "qux" });
    expect(result).not.toBe("[object Object]");
    expect(result).toContain("bar");
  });

  it("xử lý array", () => {
    expect(toInsightText(["a", "b", "c"])).toBe("a b c");
  });

  it("xử lý number/boolean", () => {
    expect(toInsightText(42)).toBe("42");
    expect(toInsightText(true)).toBe("true");
  });

  it("chống infinite recursion với nested object sâu", () => {
    const deeply: Record<string, unknown> = {};
    let cur = deeply;
    for (let i = 0; i < 10; i++) {
      const next: Record<string, unknown> = {};
      cur.nested = next;
      cur = next;
    }
    expect(() => toInsightText(deeply)).not.toThrow();
  });
});
