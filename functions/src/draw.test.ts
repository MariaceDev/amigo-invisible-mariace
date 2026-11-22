import { describe, expect, it } from "vitest";
import { drawPairs, validateParticipants } from "./draw";

describe("sorteo del amigo invisible", () => {
  const names = ["Ana", "Luis", "Marta", "Pepe", "Rosa"];

  it("nadie se regala a sí mismo", () => {
    for (let run = 0; run < 200; run++) {
      for (const pair of drawPairs(names)) {
        expect(pair.giver).not.toBe(pair.receiver);
      }
    }
  });

  it("cada persona regala una vez y recibe una vez", () => {
    const pairs = drawPairs(names);
    expect(pairs.map((p) => p.giver).sort()).toEqual([...names].sort());
    expect(pairs.map((p) => p.receiver).sort()).toEqual([...names].sort());
  });

  it("con el mismo azar sale el mismo resultado", () => {
    const fixed = () => 0.42;
    expect(drawPairs(names, fixed)).toEqual(drawPairs(names, fixed));
  });

  it("rechaza grupos de menos de tres personas", () => {
    expect(() => validateParticipants(["Ana", "Luis"])).toThrow(/al menos 3/);
  });

  it("rechaza nombres repetidos aunque cambien las mayúsculas", () => {
    expect(() => validateParticipants(["Ana", "ana", "Luis"])).toThrow(/repetidos/);
  });

  it("quita espacios y huecos vacíos", () => {
    expect(validateParticipants([" Ana ", "", "Luis", "Marta "])).toEqual(["Ana", "Luis", "Marta"]);
  });
});
