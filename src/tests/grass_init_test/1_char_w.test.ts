/** GrassCharacter's other tests are here: {@link ../../grass_character.test.ts} */

import { assertEquals } from "@std/assert";
import { getStackByDummy } from "./test_init.ts";

Deno.test('[1]("w") - GrassCharacter of small "w"', () => {
  const stack = getStackByDummy();
  const result = stack[1];
  assertEquals(result.type, "character");
  assertEquals(String.fromCodePoint(result.value), "w");
});
