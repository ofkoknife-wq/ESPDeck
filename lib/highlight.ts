export type TokenKind = 'comment' | 'string' | 'preproc' | 'keyword' | 'constant' | 'number' | 'function' | 'plain'

export type Token = { text: string; kind: TokenKind }

const KEYWORDS = new Set([
  'void', 'int', 'const', 'bool', 'float', 'double', 'if', 'else', 'for', 'while', 'return',
  'true', 'false', 'unsigned', 'long', 'char', 'uint8_t', 'uint16_t', 'String', 'auto',
])

const CONSTANTS = new Set([
  'HIGH', 'LOW', 'OUTPUT', 'INPUT', 'INPUT_PULLUP', 'LED_BUILTIN', 'WL_CONNECTED', 'DHT11', 'T0',
  'Serial', 'WiFi', 'ESP',
])

const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(^\s*#\w+.*$)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)|([^A-Za-z_\d"/#]+|.)/g

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  for (const m of line.matchAll(TOKEN_RE)) {
    const [text, comment, str, pre, num, fn, word] = m
    if (comment) tokens.push({ text, kind: 'comment' })
    else if (str) tokens.push({ text, kind: 'string' })
    else if (pre) tokens.push({ text, kind: 'preproc' })
    else if (num) tokens.push({ text, kind: 'number' })
    else if (fn) tokens.push({ text, kind: KEYWORDS.has(fn) ? 'keyword' : 'function' })
    else if (word)
      tokens.push({
        text,
        kind: KEYWORDS.has(word) ? 'keyword' : CONSTANTS.has(word) ? 'constant' : 'plain',
      })
    else tokens.push({ text, kind: 'plain' })
  }
  return tokens
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  comment: 'text-muted-foreground italic',
  string: 'text-primary/80',
  preproc: 'text-accent',
  keyword: 'text-primary font-medium',
  constant: 'text-accent font-medium',
  number: 'text-primary',
  function: 'text-accent',
  plain: 'text-foreground',
}
