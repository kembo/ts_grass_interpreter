import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { assertSpyCallArg, assertSpyCalls, spy } from "@std/testing/mock";
import { execGrassFunction } from "../executer.ts";
import { createGrassCharacter } from "../grass_character.ts";
import { initializeGlobalStack } from "../grass_init.ts";
import {
  type GrassClosure,
  type GrassFunction,
  GrassIndexError,
} from "../types.ts";
import {
  dummyInputFunc,
  dummyInputText,
  dummyOutputFunc,
  getStackByDummy,
} from "./test_init.ts";
import {
  assertEqualsGrassCharacter,
  assertGrassFunctionType,
  Combinator as Comb,
} from "./test_utils.ts";

function createClosure(
  argLength: number,
  applications: GrassClosure["prog"],
  args: GrassClosure["args"] = [],
): GrassClosure {
  return {
    type: "closure",
    prog: applications,
    args,
    argLength,
  };
}

function noAppFn(argLength: number = 1): GrassClosure {
  return createClosure(argLength, []);
}

Deno.test("GrassFunction with no application returns just argument", () => {
  const target = noAppFn();
  const c_a = createGrassCharacter("a");

  const result = execGrassFunction(target, c_a);
  assertEquals(result, c_a);
});

Deno.test("GrassFunction with no application returns last argument", () => {
  const target = noAppFn(3);
  const c_x = createGrassCharacter("x");
  const c_y = createGrassCharacter("y");
  const c_z = createGrassCharacter("z");
  let result: GrassFunction;

  result = execGrassFunction(target, c_x);
  assertGrassFunctionType(result, "closure");
  assertEquals(result.prog, target.prog);
  assertEquals(result.args, [c_x]);
  assertEquals(result.argLength, 2);

  result = execGrassFunction(result, c_y);
  assertGrassFunctionType(result, "closure");
  assertEquals(result.prog, target.prog);
  assertEquals(result.args, [c_x, c_y]);
  assertEquals(result.argLength, 1);

  result = execGrassFunction(result, c_z);
  assertEquals(result, c_z);
});

Deno.test("One application", () => {
  const target = createClosure(2, [[0, 1]]);
  const noAppFn2 = noAppFn(2);
  const c_x = createGrassCharacter("x");
  let result: GrassFunction;

  result = execGrassFunction(target, noAppFn2);
  assertGrassFunctionType(result, "closure");
  assertEquals(result.prog, target.prog);
  assertEquals(result.args, [noAppFn2]);
  assertEquals(result.argLength, 1);

  result = execGrassFunction(result, c_x);
  assertGrassFunctionType(result, "closure");
  assertEquals(result.prog, noAppFn2.prog);
  assertEquals(result.args, [c_x]);
  assertEquals(result.argLength, 1);
});

Deno.test("Multiple applications", async (t) => {
  /** target := λxyz.xyz */
  const target = createClosure(3, [[0, 1], [3, 2]]);
  const c_x = createGrassCharacter("x");
  const c_y = createGrassCharacter("y");

  await t.step("IIx => x", () => {
    let temp = execGrassFunction(target, Comb.I);
    temp = execGrassFunction(temp, Comb.I);
    assertEquals(temp.prog, target.prog);

    let result = execGrassFunction(temp, c_x);
    assertEquals(result, c_x);
    result = execGrassFunction(temp, c_y);
    assertEquals(result, c_y);
  });

  await t.step("KIx => I", () => {
    let temp = execGrassFunction(target, Comb.K);
    temp = execGrassFunction(temp, Comb.I);

    let result = execGrassFunction(temp, c_x);
    assertEquals(result, Comb.I);
    result = execGrassFunction(temp, c_y);
    assertEquals(result, Comb.I);
  });
});

Deno.test("Use primitives", async (t) => {
  const outputSpy = spy(dummyOutputFunc);
  const inputSpy = spy(dummyInputFunc);
  const [In_, c_w, Succ, Out] = initializeGlobalStack(inputSpy, outputSpy);
  const c_x = createGrassCharacter("x");
  /**
   * (f, x) => In の結果を f に適用.
   *
   *    その値が "w" に一致すれば x を返す.
   *    一致しなければ値を表示して値を返す.
   */
  // deno-fmt-ignore
  const target = createClosure(2, [
    [In_, In_], // 2: In
    [0, 2],     // 3: 入力に f を適用
    [Comb.K, 1], // 4: λy.x
    [c_w, 3],   // 5: "w" と比較
    [5, 4],     // 6: 一致の場合ただ x を返す関数
    [6, Out],   // 7: 不一致の場合
    [7, 3],     // 比較結果に値を代入
  ]);

  await t.step("Return double incremented input", () => {
    const beforeOutputCalls = outputSpy.calls.length;

    if (inputSpy.calls.length > 0) {
      throw new Error("Input function is incorrectly called!");
    }
    if (dummyInputText[0] !== "H") throw new Error("Dummy text is invalid!");
    /** "H" の2つとなりは "J" */
    const secondNextChar = createGrassCharacter("J");
    /** λxy.x(xy) */
    const fnDouble = createClosure(1, [[Succ, 0], [Succ, 1]]);

    const result = execGrassFunction(execGrassFunction(target, fnDouble), c_x);

    assertEqualsGrassCharacter(result, secondNextChar);
    assertSpyCalls(inputSpy, 1);
    assertSpyCalls(outputSpy, beforeOutputCalls + 1);
    assertSpyCallArg(
      outputSpy,
      beforeOutputCalls,
      0,
      String.fromCodePoint(secondNextChar.value),
    );
  });

  await t.step("Return x", () => {
    const beforeOutputCalls = outputSpy.calls.length;
    const returnW = execGrassFunction(Comb.K, c_w);
    const result = execGrassFunction(execGrassFunction(target, returnW), c_x);

    assertEqualsGrassCharacter(result, c_x);
    assertSpyCalls(outputSpy, beforeOutputCalls);
  });
});

Deno.test("Y Combinator", async (t) => {
  /** y := λfgx.g(ffg)x  # f = y, g =: (Yg, x) => ? */
  const preY = createClosure(3, [
    [0, 0], // 3: ff
    [3, 1], // 4: ffg
    [1, 4], // 5: g(ffg)
    [5, 2], // g(ffg)x
  ]);
  // Y = yy
  //   = (λfgx.g(ffg)x)y
  //   = λgx.g(Yg)x
  /** Ygx = g(Yg)x */
  const CombinatorY = execGrassFunction(preY, preY);
  const c0 = createGrassCharacter(0);
  assertEquals(c0.value, 0);

  await t.step("Preview character", () => {
    const [_In, c_w, Succ, _Out] = getStackByDummy();
    /** f := (a, Y(fa), x) => Succ(x) == a ? x : Y(fa)(Succ(x)) */
    // deno-fmt-ignore
    const target = createClosure(3, [
      [Succ, 2],    // 3: Succ(x)
      [3, 0],       // 4: Succ(x) == a
      [Comb.K, 2],  // 5: Kx
      [4, 5], // 6: Succ(x) == a ? Kx
      [6, 1], // 7: Succ(x) == a ? Kx : Y(fa)
      [7, 3], // (Succ(x) == a ? Kx : Y(fa))(Succ(x))
    ]);
    const result = execGrassFunction(
      execGrassFunction(
        CombinatorY,
        execGrassFunction(target, c_w), // fa
      ), // Y(fa)
      c0,
    ); // Y(fa)0
    assertGrassFunctionType(result, "character");
    assertEquals(result.value, c_w.value - 1);
  });

  await t.step(
    "Print all input text for first break and return the length",
    () => {
      const dummyInputText = "Hello, \nWorld!\n\0";
      const outputSpy = spy(dummyOutputFunc);
      const [In_, _w, Succ, Out] = initializeGlobalStack(
        () => dummyInputText,
        outputSpy,
      );
      const c_end = createGrassCharacter("\n");
      /** g := (a, Yf, x) => (Out(a); Yf(Succ(x))) */
      const printAndNext = createClosure(3, [[Out, 0], [Succ, 2], [1, 4]]);
      /** f := (Yf, x) => a = In(); a == c_end ? x : (Out(a); Yf(Succ(x))) */
      // deno-fmt-ignore
      const target = createClosure(2, [
      [In_, In_],   // 2: a = In()
      [c_end, 2],   // 3: a == c_end
      [3, Comb.I],  // 4: a == c_end ? I
      [printAndNext, 2], // 5
      [5, 0],   // 6: (x) => (Out(a); Yf(Succ(x)))
      [4, 6],   // 7: a == c_end ? I : (x) => (Out(a); Yf(Succ(x)))
      [7, 1],   // (a == c_end ? I : (x) => (Out(a); Yf(Succ(x))))(x)
    ]);

      const expectedOutput = "Hello, ";
      const result = execGrassFunction(
        execGrassFunction(CombinatorY, target),
        c0,
      );
      assertSpyCalls(outputSpy, expectedOutput.length);
      for (const [i, char] of [...expectedOutput].entries()) {
        assertSpyCallArg(outputSpy, i, 0, char);
      }
      assertGrassFunctionType(result, "character");
      assertEquals(result.value, expectedOutput.length);
    },
  );
});

Deno.test("Invalid Index", async (t) => {
  await t.step("negative index", () => {
    let target = createClosure(1, [[-1, 0]]);
    let error = assertThrows(() => execGrassFunction(target, Comb.I));
    assertInstanceOf(error, GrassIndexError);

    target = createClosure(1, [[0, -1]]);
    error = assertThrows(() => execGrassFunction(target, Comb.I));
    assertInstanceOf(error, GrassIndexError);
  });

  await t.step("too large", () => {
    let target = createClosure(1, [[1, 0]]);
    let error = assertThrows(() => execGrassFunction(target, Comb.I));
    assertInstanceOf(error, GrassIndexError);

    target = createClosure(1, [[0, 1]]);
    error = assertThrows(() => execGrassFunction(target, Comb.I));
    assertInstanceOf(error, GrassIndexError);
  });
});
