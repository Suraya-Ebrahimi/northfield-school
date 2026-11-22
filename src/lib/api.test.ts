import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";
afterEach(() => vi.unstubAllGlobals());
describe("login request", () => {
  it("POSTs email, password, role to localhost:5000/api/auth/login", async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, message: "ok" })));
    vi.stubGlobal("fetch", f);
    const r = await api.login("a@b.edu", "pw", "admin");
    expect(f.mock.calls[0]![0]).toBe("http://localhost:5000/api/auth/login");
    expect(f.mock.calls[0]![1].method).toBe("POST");
    expect(JSON.parse(f.mock.calls[0]![1].body)).toEqual({ email: "a@b.edu", password: "pw", role: "admin" });
    expect(r.success).toBe(true);
  });
});
