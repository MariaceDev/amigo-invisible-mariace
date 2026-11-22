import { describe, expect, it } from "vitest";
import { drawPairs, validateParticipants } from "./draw.js";

describe("validateParticipants", () => {
  it("quita huecos y espacios", () => {
    expect(validateParticipants([" Ana ", "", "Luis", "  ", "Eva"])).toEqual(["Ana", "Luis", "Eva"]);
  });

  it("exige al menos 3 participantes", () => {
    expect(() => validateParticipants(["Ana", "Luis", ""])).toThrow(/al menos 3/);
  });

  it("rechaza nombres repetidos sin mirar mayúsculas", () => {
    expect(() => validateParticipants(["Ana", "ana", "Luis"])).toThrow(/repetido/);
  });

  it("rechaza lo que no es una lista", () => {
    expect(() => validateParticipants("Ana, Luis")).toThrow();
  });
});

describe("drawPairs", () => {
  const names = ["Ana", "Luis", "Eva", "Pablo", "Marta", "Juan"];

  it("nadie se regala a sí mismo y todos regalan y reciben una vez", () => {
    for (let n = 0; n < 200; n++) {
      const pairs = drawPairs(names);
      expect(pairs).toHaveLength(names.length);
      expect(new Set(pairs.map((p) => p.giver))).toEqual(new Set(names));
      expect(new Set(pairs.map((p) => p.receiver))).toEqual(new Set(names));
      for (const pair of pairs) expect(pair.giver).not.toBe(pair.receiver);
    }
  });
});
