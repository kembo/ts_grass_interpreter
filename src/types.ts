import type { GrassCharacter } from "./grass_character.ts";

/** Grass の処理で用いるグローバルスタックの型 */
export type GlobalStack = [
  /**
   * 入力に関わらず入力された文字を GrassCharacter として返す.
   * 入力が複数字の文字列の場合は内部に記録して先頭から 1 字ずつ返す.
   * 文字列は UTF-16 コード単位で分解され, コードが 255 (0xFF) を超える非ASCII文字は \0 として解釈される.
   */
  in_: GrassRawFunction,
  /**
   * "w" (code 119 0x77) の文字を表す GrassCharacter 型の primitive function.
   * 引数に同じ文字を表す GrassCharacter が与えられた場合 True (λxy.x) を返します.
   * それ以外の場合(型が GrassCharacter でない場合を含む) False (λxy.y) を返します.
   */
  w: GrassCharacter,
  /**
   * GrassCharacter を取って文字コードを 1 増やした GrassCharacter を返します.
   * 引数が GrassCharacter でない場合は GrassTypeError が発生します.
   */
  succ: GrassRawFunction,
  /**
   * GrassCharacter を取ってその文字を表示し, 引数自体を返します.
   * 引数が GrassCharacter でない場合は GrassTypeError が発生します.
   */
  out: GrassRawFunction,
  ...GrassClosure[],
];

/** Grass 上の関数型の定義 */
export type GrassFunction = GrassClosure | GrassRawFunction | GrassCharacter;

/** Grass における "関数適用" を示す */
export type GrassApplication = readonly [
  func: GrassFunction,
  arg: GrassFunction,
];

/** Grass 処理中の引数の型の不整合 */
export class GrassTypeError extends TypeError {
  static readonly isGrass = false;
}

/** 全ての GrassFunction 型の基礎 */
export type AbstractGrassFunction = {
  /** GrassFunction の種類(固定値) */
  readonly type: string;
  /** GrassFunction の処理の実態 */
  readonly prog: readonly GrassApplication[] | GrassBasicFunction;
};

/** 主にプリミティブ関数内で使われる, 直接実行するタイプの関数の中身 */
export type GrassBasicFunction = (arg: GrassFunction) => GrassFunction;
/** 主に GrassCharacter 以外の, javascript 側で実行可能な処理実態を持つ GrassFunction */
export type GrassRawFunction = AbstractGrassFunction & {
  readonly type: "raw";
  readonly prog: GrassBasicFunction;
};

/** プリミティブ関数以外の Grass プログラム処理中に一般に発生するクロージャ */
export type GrassClosure = {
  readonly type: "closure";
  readonly prog: readonly GrassApplication[];
  /** グローバルスタック */
  readonly stackIndex: number;
  readonly stack: readonly GrassClosure[];
  readonly argLength: number;
};

export { GrassCharacter };
