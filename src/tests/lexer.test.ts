import { assertEquals } from "@std/assert";
import { EOF_TOKEN, lexicalAnalyze, Token } from "../lexer.ts";

Deno.test("Lexer: Empty code", () => {
  const code = "";
  const result = lexicalAnalyze(code);
  assertEquals(result, [EOF_TOKEN]);
});

Deno.test("Lexer: One letter code", () => {
  const code = "w";
  const expectedTokens = [
    { position: { line: 0, index: 0 }, type: "Small", length: 1 },
    EOF_TOKEN,
  ] as const satisfies Token[];
  const result = lexicalAnalyze(code);
  assertEquals(result, expectedTokens);
});

Deno.test("Lexer: Simple code", () => {
  const code = "wwWWwWWWwvWwwwWwwwwwWWWWw";
  const tokenLengthList: [Token["type"], number][] = [
    ["Small", 2],
    ["Large", 2],
    ["Small", 1],
    ["Large", 3],
    ["Small", 1],
    ["V", 1],
    ["Large", 1],
    ["Small", 3],
    ["Large", 1],
    ["Small", 5],
    ["Large", 4],
    ["Small", 1],
    ["EOF", 0],
  ];
  const [expectedTokens, _] = tokenLengthList.reduce<[Token[], number]>(
    ([tokenList, counter], [type, length]) => {
      return [
        [
          ...tokenList,
          ((t, index, length): Token => {
            switch (t) {
              case "EOF":
                return { type: t };
              case "V":
                return { type: t, position: { line: 0, index } };
              default:
                return {type: t, length, position: {line: 0, index}};
            }
          })(type, counter, length),
        ],
        counter + length,
      ];
    },
    [[], 0],
  );
  const result = lexicalAnalyze(code);
  assertEquals(result, expectedTokens);
});

Deno.test("Lexer: position", () => {
  const lines: [
    string,
    [index: number, type: Token["type"], length: number][],
  ][] = [
    ["  w w", [[2, "Small", 2]]],
    ["WxWw%WあW", [[0, "Large", 2], [3, "Small", 1], [5, "Large", 3]]],
    ["Ww　漢字v ", [[1, "Small", 1], [5, "V", 1], [7, "EOF", 0]]],
  ];
  const [code, expectedTokens] = lines.reduce<[string, Token[]]>(
    ([code, tokens], [codeLine, tokenLine], line) => [
      code ? code + "\n" + codeLine : codeLine,
      [
        ...tokens,
        ...tokenLine.map(([index, type, length]) => {
          const position = { line, index };
          switch (type) {
            case "EOF":
              return { type };
            case "V":
              return { type, position };
            default:
              return {type, length, position};
          }
        }),
      ],
    ],
    ["", []],
  );
  const result = lexicalAnalyze(code);
  assertEquals(result, expectedTokens);
});
