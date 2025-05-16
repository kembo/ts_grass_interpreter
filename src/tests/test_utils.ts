import { assertEquals } from "@std/assert";
import type { GrassCharacter, GrassClosure, GrassFunction } from "../types.ts";

/** 型ガード機能付きの GrassFunction の assertion */
export function assertGrassFunctionType<K extends GrassFunction["type"]>(
  fn: GrassFunction,
  type_: K,
): asserts fn is GrassFunction & { type: K } {
  assertEquals(fn.type, type_);
}
/** GrassCharacter の一致 assertion */
export function assertEqualsGrassCharacter<T extends GrassCharacter>(
  fn: GrassFunction,
  expected: T,
): asserts fn is T {
  assertGrassFunctionType(fn, "character");
  assertEquals(fn.value, expected.value);
}

const ICombinator = {
  type: "closure",
  prog: [],
  args: [],
  argLength: 1,
} as const satisfies GrassClosure;

export const Combinator = {
  /** I = λx.x */
  I: ICombinator,
  /** K = λxy.x */
  K: {
    type: "closure",
    prog: [[ICombinator, 0]],
    args: [],
    argLength: 2,
  },
  /** S = λxyz.(x z)(y z) */
  S: {
    type: "closure",
    prog: [
      [0, 2],
      [1, 2],
    ],
    args: [],
    argLength: 3,
  },
} as const satisfies { [key in string]: GrassClosure };
