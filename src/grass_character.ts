import type { GrassFunction, GrassRawFunction } from "./types.ts";

/** 文字列比較時の返り値用の True (λxy.x) */
const GRASS_TRUE = {
  type: "raw",
  prog: (x) => ({ type: "raw", prog: (_y) => x }),
} as const satisfies GrassRawFunction;
/** 文字列比較時の返り値用の False (λxy.y) */
const GRASS_FALSE = {
  type: "raw",
  prog: (_x) => ({ type: "raw", prog: (y) => y }),
} as const satisfies GrassRawFunction;
type GrassBoolean = typeof GRASS_TRUE | typeof GRASS_FALSE;

/** 0 以上 255 以下の ASCII コードに対応する整数 */
type AsciiCode = number;
/**
 * 任意の number を 0 以上 255 以下の整数にする.
 * 条件に当てはまらない数値は全て 0 とする.
 */
const asAsciiCode = (c: number): AsciiCode =>
  (0 <= c && c <= 255 && Number.isInteger(c)) ? c : 0;
/** Grass における文字型. */
export type GrassCharacter = {
  readonly type: "charcter";
  /** 実際の文字コード */
  readonly value: number;
  readonly prog: (arg: GrassFunction) => GrassBoolean;
};
const generated: Record<AsciiCode, GrassCharacter> = {};

/**
 * 与えられた文字または文字コードに対応する GrassCharacter を返す.
 * 一度生成したオブジェクトは記録し, 生成済みの場合過去のオブジェクトを返す.
 */
export function createGrassCharacter(char: string | number): GrassCharacter {
  const c: number = (typeof char === "string") ? char.charCodeAt(0) : char;
  const code = asAsciiCode(c);
  if (!(code in generated)) {
    generated[code] = {
      type: "charcter",
      value: code,
      prog: (arg) =>
        (arg.type === "charcter" && arg.value === code)
          ? GRASS_TRUE
          : GRASS_FALSE,
    };
  }
  return generated[code];
}
