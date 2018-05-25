const closingQuoteRegex = /[^\\](\\{2})*"/;


export interface StartObjectToken {
  type: 'start';
}


export interface EndObjectToken {
  type: 'end';
}


export interface TextToken {
  type: 'text';
  value: string;
  followedByColon: boolean;
}


export type Token = StartObjectToken | EndObjectToken | TextToken;


const simpleKeyPattern = /^[a-z0-9$_\-]+$/i;


export function tokenise(pattern: string): Token[] {
  let currentToken = '';
  const tokens: Token[] = [];

  for (let i = 0; i < pattern.length; i++) {
    const character = pattern[i]

    if (character === '{') {
      tokens.push({type: 'start'});
      continue;
    }

    if (character === '}') {
      tokens.push({type: 'end'});
      continue;
    }

    if (character === ':') {
      if (currentToken === '') {
        throw new Error('Unexpected colon');
      }

      if (!simpleKeyPattern.test(currentToken)) {
        throw new Error('Invalid unquoted text');
      }

      tokens.push({
        type: 'text',
        value: currentToken,
        followedByColon: true
      });
      currentToken = '';
      continue;
    }

    if (character === '"') {
      const closingQuoteMatch = pattern.slice(i).match(closingQuoteRegex);

      if (closingQuoteMatch === null || closingQuoteMatch.index === undefined) {
        throw new Error('Missing closing quote');
      }

      const closingIndex = closingQuoteMatch.index + closingQuoteMatch[0].length - 1;

      const quotedString = pattern.slice(i + 1, closingIndex)
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');

      const followedByColon = pattern[closingIndex + 1] === ':';

      tokens.push({type: 'text', value: quotedString, followedByColon});
      currentToken = '';
      i = closingIndex + (followedByColon ? 1 : 0);
      continue;
    }

    if (character.trim() === '') {
      if (currentToken !== '') {
        if (!simpleKeyPattern.test(currentToken)) {
          throw new Error('Invalid unquoted text');
        }

        tokens.push({
          type: 'text',
          value: currentToken,
          followedByColon: false
        });
        currentToken = '';
      }
    } else {
      currentToken += character;
    }
  }

  if (currentToken !== '') {
    if (!simpleKeyPattern.test(currentToken)) {
      throw new Error('Invalid unquoted text');
    }

    tokens.push({
      type: 'text',
      value: currentToken,
      followedByColon: false
    });
  }

  return tokens;
}
