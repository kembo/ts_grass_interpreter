import { assertEquals, assertThrows } from "@std/assert";
import { assertSpyCallArg, assertSpyCalls, spy } from "@std/testing/mock";
import { initializeGlobalStack } from "../../grass_init.ts";
import { dummyFunc, dummyInputFunc, dummyOutputFunc } from "./test_init.ts";
import { GrassTypeError } from "../../types.ts";

Deno.test("[3](Out) - Output function", () => {
  const outputRawFunc = spy(dummyOutputFunc);
  const stack = initializeGlobalStack(dummyInputFunc, outputRawFunc);
  const outputWrappedFunc = stack[3].prog;
  const c_w = stack[1];

  assertSpyCalls(outputRawFunc, 0);

  assertEquals(outputWrappedFunc(c_w), c_w);
  assertSpyCalls(outputRawFunc, 1);
  assertSpyCallArg(outputRawFunc, 0, 0, "w");

  assertThrows(() => outputWrappedFunc(dummyFunc), GrassTypeError);
  assertThrows(() => outputWrappedFunc(stack[0]), GrassTypeError);
});
