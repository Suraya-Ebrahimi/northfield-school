import { describe, expect, it } from "vitest";
import { calculateRisk } from "./school";
describe("risk rules", () => {
  it("attendance under 75 is High", () => expect(calculateRisk({ attendance: 74, avgScore: 90, flags: 0 }).level).toBe("High"));
  it("score under 60 is High", () => expect(calculateRisk({ attendance: 95, avgScore: 59, flags: 0 }).level).toBe("High"));
  it("3+ flags is High", () => expect(calculateRisk({ attendance: 95, avgScore: 90, flags: 3 }).level).toBe("High"));
  it("attendance 75-84 is Moderate", () => expect(calculateRisk({ attendance: 80, avgScore: 90, flags: 0 }).level).toBe("Moderate"));
  it("one flag is Moderate", () => expect(calculateRisk({ attendance: 95, avgScore: 90, flags: 1 }).level).toBe("Moderate"));
  it("85+/70+/0 flags is Low", () => expect(calculateRisk({ attendance: 85, avgScore: 70, flags: 0 }).level).toBe("Low"));
});
