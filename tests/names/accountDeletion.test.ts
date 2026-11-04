import { describe, expect, it, vi } from "vitest";
import {
  ACCOUNT_PATH,
  DELETE_ERROR_TEXT,
  DELETE_SIGNIN_TEXT,
  DELETE_WAIT_TEXT,
  deleteErrorText,
  markAccountDeleted,
  requestAccountDeletion,
  subscribeAccountDeleted,
  wasAccountDeleted,
} from "@/lib/names/accountDeletion";

const respond = (status: number) => vi.fn(async () => new Response(null, { status })) as unknown as typeof fetch;

describe("requestAccountDeletion", () => {
  it("sends DELETE with the bearer token", async () => {
    const f = respond(204);
    expect(await requestAccountDeletion("tok", f)).toBe("deleted");
    expect(f).toHaveBeenCalledWith(ACCOUNT_PATH, expect.objectContaining({ method: "DELETE", headers: { Authorization: "Bearer tok" } }));
  });

  it("maps statuses", async () => {
    expect(await requestAccountDeletion("t", respond(401))).toBe("unauthorized");
    expect(await requestAccountDeletion("t", respond(429))).toBe("rate_limited");
    expect(await requestAccountDeletion("t", respond(500))).toBe("error");
    expect(await requestAccountDeletion("t", respond(200))).toBe("error");
  });

  it("treats a network failure as an error", async () => {
    const f = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await requestAccountDeletion("t", f)).toBe("error");
  });
});

describe("deleteErrorText", () => {
  it("has a message for every failure and none for success", () => {
    expect(deleteErrorText("deleted")).toBeNull();
    expect(deleteErrorText("unauthorized")).toBe(DELETE_SIGNIN_TEXT);
    expect(deleteErrorText("rate_limited")).toBe(DELETE_WAIT_TEXT);
    expect(deleteErrorText("error")).toBe(DELETE_ERROR_TEXT);
  });
});

describe("deleted flag", () => {
  it("notifies subscribers once marked", () => {
    const l = vi.fn();
    const off = subscribeAccountDeleted(l);
    expect(wasAccountDeleted()).toBe(false);
    markAccountDeleted();
    expect(wasAccountDeleted()).toBe(true);
    expect(l).toHaveBeenCalledTimes(1);
    off();
  });
});
