import { Token } from 'subobject/internal/tokens';
import { ParsingError } from 'subobject/internal/errors';


export type FilterTree = {[key: string]: FilterTree | true};


export function findClosingBrace(startIndex: number, tokens: Token[]): number {
  if (startIndex >= tokens.length - 1) {
    return -1;
  }

  let depth = 1;

  for (let i = startIndex + 1; i < tokens.length; i++) {
    if (tokens[i].type === 'start') {
      depth++;
    } else if (tokens[i].type === 'end') {
      depth--;

      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}


function getToken(tokens: Token[], index: number): Token | null {
  if (index < 0 || index >= tokens.length) {
    return null;
  } else {
    return tokens[index];
  }
}


export function readNextExpression(position: number, tokens: Token[]): {nextPosition: number, filterTree: FilterTree} {
  const token = getToken(tokens, position);

  if (token === null) {
    return {
      nextPosition: position,
      filterTree: {}
    };
  }

  if (token.type !== 'text') {
    throw new ParsingError(token.position, token.length, 'Unexpected token (was expecting a key)');
  }

  const key = token.text;

  const nextToken = getToken(tokens, position + 1);

  if (nextToken === null) {
    return {
      nextPosition: position + 1,
      filterTree: {[key]: true}
    };
  }

  if (nextToken.type === 'comma') {
    return {
      nextPosition: position + 2,
      filterTree: {[key]: true}
    };
  }

  if (nextToken.type === 'colon') {
    const openingBraceIndex = position + 2;

    const openingBraceToken = getToken(tokens, openingBraceIndex);

    if (openingBraceToken === null || openingBraceToken.type !== 'start') {
      throw new ParsingError(nextToken.position, nextToken.length, 'Expected object after colon');
    }

    const closingBraceIndex = findClosingBrace(openingBraceIndex, tokens);

    if (closingBraceIndex === -1) {
      throw new ParsingError(openingBraceToken.position, openingBraceToken.length, 'Missing closing brace');
    }

    const tokenAfterObject = getToken(tokens, closingBraceIndex + 1);

    if (tokenAfterObject !== null && tokenAfterObject.type !== 'comma') {
      throw new ParsingError(tokenAfterObject.position, tokenAfterObject.length, 'Expected comma between expressions');
    }

    return {
      nextPosition: closingBraceIndex + 1 + (tokenAfterObject === null ? 0 : 1),
      filterTree: {[key]: buildObjectFilterTree(tokens.slice(openingBraceIndex + 1, closingBraceIndex))}
    };
  }

  throw new ParsingError(nextToken.position, nextToken.length, 'Unexpected token (was expecting a comma or a colon)');
}


export function buildObjectFilterTree(tokens: Token[]): FilterTree {
  let result: FilterTree = {};
  let position = 0;

  while (position < tokens.length) {
    const { nextPosition, filterTree } = readNextExpression(position, tokens);

    // Note: readNextExpression only reads one expression,
    // therefore at most one key will be on filterTree
    for (const key in filterTree) {
      if (result.hasOwnProperty(key)) {
        const token = tokens[position];
        throw new ParsingError(token.position, token.length, 'Duplicate key specified');
      }
    }

    position = nextPosition;
    result = {...result, ...filterTree};
  }

  return result;
}


export function buildRootObjectFilterTree(tokens: Token[]): FilterTree {
  const openingBraceToken = getToken(tokens, 0);

  if (openingBraceToken === null) {
    throw new ParsingError(0, 0, 'No input provided');
  }

  if (openingBraceToken.type !== 'start') {
    throw new ParsingError(openingBraceToken.position, openingBraceToken.length, 'Unexpected token (expected open brace)');
  }

  const closingBraceIndex = findClosingBrace(0, tokens);

  if (closingBraceIndex === -1) {
    throw new ParsingError(openingBraceToken.position, openingBraceToken.length, 'Cannot find closing brace');
  }

  if (closingBraceIndex !== tokens.length - 1) {
    const unexpectedToken = tokens[closingBraceIndex + 1];
    const lastToken = tokens[tokens.length - 1];
    const unexpectedTextLength = (lastToken.position + lastToken.length) - unexpectedToken.position;

    throw new ParsingError(unexpectedToken.position, unexpectedTextLength, 'Unexpected text after end of object');
  }

  return buildObjectFilterTree(tokens.slice(1, tokens.length - 1));
}
