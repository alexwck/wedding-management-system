import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/token-crypto";

describe("token-crypto", () => {
  it("encrypts and decrypts a string roundtrip", () => {
    const original = "my-secret-access-token";
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    expect(decrypt(encrypted)).toBe(original);
  });

  it("produces different ciphertext each time due to random IV", () => {
    const plaintext = "same-input";
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);
    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1)).toBe(plaintext);
    expect(decrypt(enc2)).toBe(plaintext);
  });

  it("handles empty string", () => {
    const encrypted = encrypt("");
    expect(decrypt(encrypted)).toBe("");
  });

  it("handles long tokens", () => {
    const longToken = "a".repeat(1000);
    const encrypted = encrypt(longToken);
    expect(decrypt(encrypted)).toBe(longToken);
  });

  it("throws on invalid ciphertext", () => {
    expect(() => decrypt("not-valid-base64!!!")).toThrow();
  });
});
