import { describe, expect, it } from "vitest";
import { newToken, sha256Hex } from "./tokens";

describe("tokens", () => {
  it("generates tokens of expected length", () => {
    const t = newToken(32);
    expect(t).toHaveLength(64); // hex encoding
  });

  it("hashes consistently", () => {
    expect(sha256Hex("abc")).toEqual(sha256Hex("abc"));
    expect(sha256Hex("abc")).not.toEqual(sha256Hex("abcd"));
  });
});

