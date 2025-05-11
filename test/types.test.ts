import { assertType, type Has } from "@std/testing/types";
import type { AbstractGrassFunction, GrassFunction } from "../src/types.ts";

Deno.test("All `GrassFunction` type must be in `AbstractGrassFunction` type.", () => {
  assertType<Has<GrassFunction, AbstractGrassFunction>>(true);
});
