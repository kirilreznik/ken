import { describe, expect, it, vi } from "vitest";
import { requestSignupPass, signupData } from "@/lib/names/signupPass";

describe("signupData", () => {
  it("carries the invite code as names_invite", () => {
    expect(signupData(" AB12CD34 ")).toEqual({ names_invite: "AB12CD34" });
  });
  it("sends nothing without a code", () => {
    expect(signupData(null)).toBeUndefined();
    expect(signupData("  ")).toBeUndefined();
  });
});

describe("requestSignupPass", () => {
  it("asks names_signup_pass for the code", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(requestSignupPass({ rpc } as never, "AB12CD34")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("names_signup_pass", { p_code: "AB12CD34" });
  });
  it("skips the call without a code or client", async () => {
    const rpc = vi.fn();
    await expect(requestSignupPass({ rpc } as never, null)).resolves.toBe(false);
    await expect(requestSignupPass(null, "AB12CD34")).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("never throws: a refusal, an error or a network failure is just false", async () => {
    await expect(requestSignupPass({ rpc: vi.fn().mockResolvedValue({ data: false, error: null }) } as never, "X")).resolves.toBe(false);
    await expect(requestSignupPass({ rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "nope" } }) } as never, "X")).resolves.toBe(false);
    await expect(requestSignupPass({ rpc: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")) } as never, "X")).resolves.toBe(false);
  });
});
