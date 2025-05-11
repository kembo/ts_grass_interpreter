import { assertEquals } from "@std/assert";
import { createGrassCharacter } from "../src/grass_character.ts";

Deno.test("Create a 'w' character", () => {
  const c_w = createGrassCharacter("w");
  assertEquals(c_w.value, 119);
});

Deno.test("Create a space character", () => {
  const c_sp = createGrassCharacter(" ");
  assertEquals(c_sp.value, 32);
});

Deno.test("Create a character by ascii code", () => {
  const code = 65; // "A"
  const c_65 = createGrassCharacter(code);
  const c_A = createGrassCharacter("A");
  assertEquals(c_65, c_A);
});

Deno.test("If created by a Non-Ascii character, then it is a null character", () => {
  const c_NonAscii = createGrassCharacter("あ");
  assertEquals(c_NonAscii.value, 0);
});

Deno.test("If created by code `256`, then it is a null character", () => {
  const c_256 = createGrassCharacter(256);
  assertEquals(c_256.value, 0);
});

Deno.test("If applied a same character then `True` is returned", () => {
  const c_X = createGrassCharacter("X");
  const c_Y = createGrassCharacter("Y");
  const result = c_X.prog(c_X);
  assertEquals(result.type, "raw");
  assertEquals(result.prog(c_X).prog(c_Y), c_X, "It is not `True`.");
});

Deno.test("If applied a different character then `False` is returned", () => {
  const c_X = createGrassCharacter("X");
  const c_Y = createGrassCharacter("Y");
  const result = c_X.prog(c_Y);
  assertEquals(result.type, "raw");
  assertEquals(result.prog(c_X).prog(c_Y), c_Y, "It is not `False`.");
});
