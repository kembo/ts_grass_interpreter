import {
  createGrassCharacter,
  type GrassCharacter,
} from "./grass_character.ts";
import { GlobalStack, GrassTypeError } from "./types.ts";

/**
 * Grass のプリミティブ関数を持った GlobalStack を生成する
 * @param in_ - 文字列の入力関数. 入力文字数が複数の場合は内部的に1字ずつ分解して保存され, それを使い切ってから改めて呼び出されます.
 * @param out - 文字の出力関数. 一文字ずつ ASCII コードが出力されます.
 * @returns
 */
export function initializeGlobalStack(
  in_: () => string,
  out: (text: string) => unknown,
): GlobalStack {
  let text: string[] = [];
  return [
    {
      type: "raw",
      prog: (_) => {
        if (text.length === 0) {
          text = [...(in_())];
        }
        return createGrassCharacter(text.shift()!);
      },
    },
    createGrassCharacter("w"),
    {
      type: "raw",
      prog: (arg): GrassCharacter => {
        if (arg.type !== "character") {
          throw new GrassTypeError("`Succ` function takes only a character.");
        }
        return createGrassCharacter(arg.value + 1);
      },
    },
    {
      type: "raw",
      prog: (arg) => {
        if (arg.type !== "character") {
          throw new GrassTypeError("`Out` function takes only a character.");
        }
        out(String.fromCodePoint(arg.value));
        return arg;
      },
    },
  ];
}
