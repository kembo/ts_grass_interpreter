import { initializeGlobalStack } from "../../src/grass_init.ts";
import type { GrassRawFunction } from "../../src/types.ts";

const dummyInputText = "Hi!";
const dummyInputFunc = () => dummyInputText;
const dummyOutputFunc = (_text: string) => {};

const getStackByDummy = () =>
  initializeGlobalStack(dummyInputFunc, dummyOutputFunc);

const dummyFunc: GrassRawFunction = {
  type: "raw",
  prog: (f) => f,
};

export {
  dummyFunc,
  dummyInputFunc,
  dummyInputText,
  dummyOutputFunc,
  getStackByDummy,
};
