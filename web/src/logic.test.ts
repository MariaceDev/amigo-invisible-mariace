import { describe, expect, it } from "vitest";
import {
  cleanPin,
  drawPairs,
  formatCountdown,
  isValidCode,
  loginId,
  makeCode,
  nameError,
  nameKey,
  normalizeCode,
  revealFromInputs,
} from "./logic";

describe("códigos", () => {
  it("normaliza y valida", () => {
    expect(normalizeCode(" nav-1234 ")).toBe("NAV-1234");
    expect(isValidCode("NAV-1234")).toBe(true);
    expect(isValidCode("NAV-12")).toBe(false);
  });

  it("los códigos nuevos son válidos", () => {
    for (let i = 0; i < 100; i++) expect(isValidCode(makeCode())).toBe(true);
  });
});

describe("nombres y PIN", () => {
  it("la clave no mira mayúsculas ni espacios", () => {
    expect(nameKey("  Tía   Pili ")).toBe(nameKey("tía pili"));
    expect(nameKey("A/B")).not.toContain("/");
  });

  it("rechaza nombres vacíos o que no valen como id", () => {
    expect(nameError("   ")).not.toBeNull();
    expect(nameError("..")).not.toBeNull();
    expect(nameError("__x__")).not.toBeNull();
    expect(nameError("Marta")).toBeNull();
  });

  it("el PIN se queda en 4 cifras", () => {
    expect(cleanPin("1a2b3c45")).toBe("1234");
  });

  it("el acceso depende de los tres datos", async () => {
    const a = await loginId("NAV-1", "marta", "1234");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await loginId("NAV-1", "marta", "1234")).toBe(a);
    expect(await loginId("NAV-1", "marta", "1235")).not.toBe(a);
  });
});

describe("sorteo", () => {
  const ids = ["a", "b", "c", "d", "e", "f"];

  it("nadie se regala a sí mismo y es un solo círculo", () => {
    for (let n = 0; n < 200; n++) {
      const pairs = drawPairs(ids);
      expect(Object.keys(pairs).sort()).toEqual(ids);
      expect(new Set(Object.values(pairs)).size).toBe(ids.length);
      let at = "a";
      for (let i = 0; i < ids.length; i++) {
        expect(pairs[at]).not.toBe(at);
        at = pairs[at]!;
      }
      expect(at).toBe("a");
    }
  });

  it("hacen falta 3", () => {
    expect(() => drawPairs(["a", "b"])).toThrow();
  });
});

describe("fechas", () => {
  it("cuenta atrás", () => {
    expect(formatCountdown(((2 * 24 + 3) * 60 + 4) * 60_000)).toBe("2d 3h 4m");
    expect(formatCountdown((3 * 60 + 4) * 60_000 + 5000)).toBe("3h 4m 5s");
    expect(formatCountdown(-10)).toBe("0h 0m 0s");
  });

  it("lee los campos del formulario", () => {
    expect(revealFromInputs("2026-12-24", "20:00")?.getHours()).toBe(20);
    expect(revealFromInputs("", "20:00")).toBeNull();
  });
});
