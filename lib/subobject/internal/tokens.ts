import { ParsingError } from 'subobject/internal/errors';


const closingQuoteRegex = /[^\\](\\{2})*"/;


export interface StartObjectToken {
  type: 'start';
}


export interface EndObjectToken {
  type: 'end';
}


export interface CommaToken {
  type: 'comma';
}


export interface ColonToken {
  type: 'colon';
}


export interface TextToken {
  type: 'text';
  text: string;
}


export type Token = StartObjectToken | EndObjectToken | CommaToken | ColonToken | TextToken;


const simpleKeyPattern = /^[a-z0-9$_\-]+/i;


export function nextToken(position: number, pattern: string): {nextPosition: number, token: Token | null} {
  if (position >= pattern.length) {
    return {
      nextPosition: position,
      token: null
    };
  }

  const character = pattern[position];

  if (character.trim() === '') {
    return nextToken(position + 1, pattern);
  }

  if (character === '{') {
    return {
      nextPosition: position + 1,
      token: {type: 'start'}
    };
  }

  if (character === '}') {
    return {
      nextPosition: position + 1,
      token: {type: 'end'}
    };
  }

  if (character === ',') {
    return {
      nextPosition: position + 1,
      token: {type: 'comma'}
    };
  }

  if (character === ':') {
    return {
      nextPosition: position + 1,
      token: {type: 'colon'}
    };
  }

  if (character === '"') {
    const closingQuoteMatch = pattern.slice(position).match(closingQuoteRegex);

    if (closingQuoteMatch === null || closingQuoteMatch.index === undefined) {
      throw new ParsingError(position, 1, 'Missing closing quote');
    }

    const closingIndex = closingQuoteMatch.index + closingQuoteMatch[0].length - 1;

    const quotedString = pattern.slice(position + 1, closingIndex)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');

    return {
      nextPosition: closingIndex + 1,
      token: {type: 'text', text: quotedString}
    };
  }

  const simpleTextMatch = pattern.slice(position).match(simpleKeyPattern);

  if (simpleTextMatch === null || simpleTextMatch[0].length === 0) {
    throw new ParsingError(position, 1, 'Unexpected character');
  }

  const simpleText = simpleTextMatch[0];

  return {
    nextPosition: position + simpleText.length,
    token: {type: 'text', text: simpleTextMatch[0]}
  };
}


export function tokenise(pattern: string): Token[] {
  let position = 0;
  const tokens: Token[] = [];

  while (true) {
    const { nextPosition, token } = nextToken(position, pattern);

    if (token === null) {
      break
    }

    tokens.push(token);
    position = nextPosition;
  }

  return tokens;
}
