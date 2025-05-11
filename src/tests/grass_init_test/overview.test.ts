import { assertEquals } from "@std/assert";
import { getStackByDummy } from "./test_init.ts";

const stack = getStackByDummy();

Deno.test("Stack length", () => {
  assertEquals(stack.length, 4);
});

Deno.test("Element types of the stack", () => {
  assertEquals(stack[0].type, "raw");
  assertEquals(stack[1].type, "character");
  assertEquals(String.fromCodePoint(stack[1].value), "w");
  assertEquals(stack[2].type, "raw");
  assertEquals(stack[3].type, "raw");
});
