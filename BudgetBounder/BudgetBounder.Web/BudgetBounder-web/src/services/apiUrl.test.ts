import { describe, expect, it } from "vitest";
import { resolveWebApiUrl } from "./apiUrl";

describe("desktop API URL", () => {
  it("uses the hosted Somee API by default", () => {
    expect(resolveWebApiUrl()).toBe("https://budgetbounder.somee.com/api");
  });

  it("allows an explicit development override and removes its trailing slash", () => {
    expect(resolveWebApiUrl("http://localhost:5292/api/")).toBe("http://localhost:5292/api");
  });
});
