import { initializeGlobalStack } from "../grass_init.ts";
import type { GrassRawFunction } from "../types.ts";

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
