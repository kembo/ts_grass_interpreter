export interface Position {
  readonly index: number;
  readonly line: number;
}
interface AbstractToken {
  readonly type: string;
}
interface AbstractTextToken extends AbstractToken {
  readonly position: Position;
}
type WToken = AbstractTextToken & {
  readonly type: "Small" | "Large";
  readonly length: number;
};
type VToken = AbstractTextToken & {
  readonly type: "V";
};
export const EOF_TOKEN = {
  type: "EOF",
} as const satisfies AbstractToken;
type EofToken = typeof EOF_TOKEN;
export type Token = WToken | VToken | EofToken;
const TOKEN_LABEL = {
  w: "Small",
  W: "Large",
  v: "V",
} as const satisfies Record<string, Token["type"]>;

function isTokenLetter(letter: string): letter is keyof typeof TOKEN_LABEL {
  return letter in TOKEN_LABEL;
}

type LexerStatus = {
  readonly tokenList: readonly Token[];
  readonly token?: Token;
};
function lexer(
  status: LexerStatus,
  currentLetter: string,
  position: Position,
  _code: string,
): LexerStatus {
  if (!isTokenLetter(currentLetter)) {
    return status;
  }
  const type = TOKEN_LABEL[currentLetter];
  const token = status.token;
  if (token?.type === type && token.type !== "V") {
    // 前のトークンの続き
    return {
      tokenList: status.tokenList,
      token: {
        ...token,
        length: token.length + 1,
      },
    };
  }
  // 新しいトークン
  const tokenList = [
    ...status.tokenList,
    ...(token ? [token] : []),
  ];
  if (type === "V") {
    // v は 1 字のみのトークン
    return {
      tokenList: [
        ...tokenList,
        { position, type: "V" },
      ],
    };
  }
  // 新しいトークンを追加して返す
  return {
    tokenList,
    token: {
      position,
      type,
      length: 1,
    },
  };
}

export function lexicalAnalyze(code: string): Token[] {
  const { tokenList, token: lastToken } = code.split("\n").reduce<LexerStatus>(
    (status, line, lineNum) =>
      [...line].reduce<LexerStatus>(
        (status, letter, index) =>
          lexer(
            status,
            letter,
            { index, line: lineNum },
            code,
          ),
        status,
      ),
    { tokenList: [] },
  );
  return [
    ...tokenList,
    ...(lastToken ? [lastToken] : []),
    EOF_TOKEN,
  ];
}
