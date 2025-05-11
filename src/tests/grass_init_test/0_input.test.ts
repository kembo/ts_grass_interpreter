import { assertEquals, assertGreaterOrEqual } from "@std/assert";
import { spy } from "@std/testing/mock";
import {
  dummyFunc,
  dummyInputFunc,
  dummyInputText,
  dummyOutputFunc,
} from "./test_init.ts";
import { initializeGlobalStack } from "../../grass_init.ts";

Deno.test("[0](In) - Input function", async (t) => {
  const inputRawFunc = spy(dummyInputFunc);
  const stack = initializeGlobalStack(inputRawFunc, dummyOutputFunc);
  const inputWrappedFunc = spy(stack[0].prog);

  await t.step("Before", () => {
    assertEquals(inputRawFunc.calls.length, 0);
  });

  await t.step("First character", () => {
    assertEquals(inputWrappedFunc.calls.length, 0);
    const result = inputWrappedFunc(dummyFunc);
    assertEquals(inputRawFunc.calls.length, 1);
    assertEquals(result.type, "character");
    assertEquals(
      "value" in result && result.value,
      dummyInputText.codePointAt(0),
    );
  });

  await t.step("Second character", () => {
    assertEquals(inputWrappedFunc.calls.length, 1);
    const beforeRawCalled = inputRawFunc.calls.length;
    const result = inputWrappedFunc(dummyFunc);
    assertEquals(
      inputRawFunc.calls.length - beforeRawCalled,
      0,
      "`In` function must not be called again until the all characters are read.",
    );
    assertEquals(result.type, "character");
    assertEquals(
      "value" in result && result.value,
      dummyInputText.codePointAt(1),
    );
  });

  await t.step("Second text", () => {
    const beforeRawCalled = inputRawFunc.calls.length;
    const unreadCharacterLength = dummyInputText.length -
      inputWrappedFunc.calls.length;
    assertGreaterOrEqual(unreadCharacterLength, 0);
    for (let i = 0; i < unreadCharacterLength; i++) {
      inputWrappedFunc(dummyFunc);
    }
    assertEquals(inputWrappedFunc.calls.length, dummyInputText.length);
    assertEquals(
      inputRawFunc.calls.length - beforeRawCalled,
      0,
      "`In` function must not be called again until the all characters are read.",
    );
    const result = inputWrappedFunc(dummyFunc);
    assertEquals(
      inputRawFunc.calls.length - beforeRawCalled,
      1,
      "`In` function must be called again after the all characters are read.",
    );
    assertEquals(result.type, "character");
    assertEquals(
      "value" in result && result.value,
      dummyInputText.codePointAt(0),
    );
  });
});
