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

    const nextNextToken = getToken(tokens, openingBraceIndex);

    if (nextNextToken === null || nextNextToken.type !== 'start') {
      throw new ParsingError(nextToken.position, nextToken.length, 'Expected object after colon');
    }

    const closingBraceIndex = findClosingBrace(openingBraceIndex, tokens);

    if (closingBraceIndex === -1) {
      throw new ParsingError(nextNextToken.position, nextNextToken.length, 'Missing closing brace');
    }

    return {
      nextPosition: closingBraceIndex + 1,
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
    position = nextPosition;
    result = {...result, ...filterTree};
  }

  return result;
}