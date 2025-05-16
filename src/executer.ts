import {
  type GrassApplication,
  type GrassCharacter,
  type GrassFunction,
  GrassIndexError,
  type GrassRawFunction,
} from "./types.ts";
import { last, map } from "./utils.ts";

/** 関数の実行 */
export function execGrassFunction<F extends GrassRawFunction | GrassCharacter>(
  fn: F,
  arg: GrassFunction,
): ReturnType<F["prog"]>;
export function execGrassFunction<F extends GrassFunction>(
  fn: F,
  arg: GrassFunction,
): GrassFunction;
export function execGrassFunction(
  fn: GrassFunction,
  arg: GrassFunction,
): GrassFunction {
  if (fn.type === "closure") {
    const stack = [...fn.args, arg];
    if (fn.argLength > 1) {
      // クロージャの残り引数が複数ある時は arg に1つ積んで返す
      return {
        type: "closure",
        prog: fn.prog,
        args: stack,
        argLength: fn.argLength - 1,
      };
    } else {
      // クロージャの残り引数が1つの時は arg を積んで実行
      return last(
        fn.prog.reduce<GrassFunction[]>(execGrassApplication, stack),
      );
    }
  } else {
    return fn.prog(arg);
  }
}

function execGrassApplication(
  stack: GrassFunction[],
  app: GrassApplication,
): GrassFunction[] {
  const [fn, arg] = map<
    number | GrassFunction,
    GrassFunction,
    GrassApplication
  >(app, (f) => getFunc(stack, f));
  return [...stack, execGrassFunction(fn, arg)];
}

function getFunc(
  stack: GrassFunction[],
  fn: number | GrassFunction,
): GrassFunction {
  if (typeof fn === "number") {
    if (fn < 0 || stack.length <= fn) {
      throw new GrassIndexError("stack index is negative");
    }
    return stack[fn];
  } else {
    return fn;
  }
}
