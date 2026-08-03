import { describe, expect, it } from "vitest";
import { canAccessAdmin, decodeUser } from "./authToken";

function token(payload: object) {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.unsigned`;
}

describe("admin token permissions", () => {
  it("allows an Admin role claim", () => {
    const user = decodeUser(token({ sub: "7", email: "admin@example.com", name: "Admin", level: "1", xp: "0", role: "Admin" }));
    expect(canAccessAdmin(user)).toBe(true);
  });

  it("rejects normal users", () => {
    const user = decodeUser(token({ sub: "8", email: "user@example.com", name: "User", level: "2", xp: "120", role: "User" }));
    expect(canAccessAdmin(user)).toBe(false);
  });

  it("accepts the ASP.NET nameid claim shape", () => {
    const user = decodeUser(token({ nameid: "9", email: "admin@example.com", name: "Admin", level: "1", xp: "0", role: "Admin" }));
    expect(user?.id).toBe(9);
  });
});
