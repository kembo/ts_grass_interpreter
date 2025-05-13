import { assertEquals, assertThrows } from "@std/assert";
import { dummyFunc, getStackByDummy } from "../test_init.ts";
import { createGrassCharacter } from "../../grass_character.ts";
import { GrassTypeError } from "../../types.ts";

Deno.test("[2](Succ) - Successor function", () => {
  const stack = getStackByDummy();
  const succ = stack[2].prog;

  const nextOf_a = succ(createGrassCharacter("a"));
  assertEquals(
    "value" in nextOf_a && String.fromCodePoint(nextOf_a.value),
    "b",
  );

  const c_255 = createGrassCharacter(255);
  assertEquals(c_255.value, 255);
  const nextOf_255 = succ(c_255);
  assertEquals("value" in nextOf_255 && nextOf_255.value, 0);

  assertThrows(() => succ(dummyFunc), GrassTypeError);
  assertThrows(() => succ(stack[0]), GrassTypeError);
});
