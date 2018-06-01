import { tokenise, nextToken } from 'subobject/internal/tokens';
import { expect } from 'chai';
import 'mocha';


describe('subobject/internal/tokens:nextToken', () => {

  it('should return null at the end of the pattern', () => {
    expect(nextToken(0, '')).to.deep.equal({
      nextPosition: 0,
      token: null
    });

    expect(nextToken(1, 'a')).to.deep.equal({
      nextPosition: 1,
      token: null
    });
  });

  it('should correctly handle open object', () => {
    expect(nextToken(0, '{')).to.deep.equal({
      nextPosition: 1,
      token: {type: 'start', position: 0, length: 1}
    });
  });

  it('should correctly handle close object', () => {
    expect(nextToken(0, '}')).to.deep.equal({
      nextPosition: 1,
      token: {type: 'end', position: 0, length: 1}
    });
  });

  it('should correctly handle commas', () => {
    expect(nextToken(0, ',')).to.deep.equal({
      nextPosition: 1,
      token: {type: 'comma', position: 0, length: 1}
    });
  });

  it('should correctly handle colons', () => {
    expect(nextToken(0, ':')).to.deep.equal({
      nextPosition: 1,
      token: {type: 'colon', position: 0, length: 1}
    });
  });

  it('should correctly handle quoted text', () => {
    expect(nextToken(0, '"some \\"quoted\\" text"')).to.deep.equal({
      nextPosition: 22,
      token: {
        type: 'text',
        text: 'some "quoted" text',
        position: 0,
        length: 22
      }
    });
  });

  it('should correctly handle quoted text in an object', () => {
    expect(nextToken(1, '{"some \\"quoted\\" text"}')).to.deep.equal({
      nextPosition: 23,
      token: {
        type: 'text',
        text: 'some "quoted" text',
        position: 1,
        length: 22
      }
    });
  });

  it('should throw if there is no closing quote', () => {
    expect(() => nextToken(0, '"no \\"closing\\" quote')).to.throw('Missing closing quote');
  });

  it('should correctly handle simple text', () => {
    expect(nextToken(0, 'simpleText')).to.deep.equal({
      nextPosition: 10,
      token: {
        type: 'text',
        text: 'simpleText',
        position: 0,
        length: 10
      }
    });
  });

  it('should throw if there are invalid characters in simple key', () => {
    expect(() => nextToken(0, '%bar')).to.throw('Unexpected character');
  });

  it('should return the correct token for a given position', () => {
    expect(nextToken(4, 'foo,bar,baz')).to.deep.equal({
      nextPosition: 7,
      token: {
        type: 'text',
        text: 'bar',
        position: 4,
        length: 3
      }
    });
  });

});


describe('subobject/inernal/tokens:tokenise', () => {

  it('should correctly handle open/close object', () => {
    expect(tokenise('{}')).to.deep.equal([
      {type: 'start', position: 0, length: 1},
      {type: 'end', position: 1, length: 1}
    ]);
  });

  it('should correctly handle colons', () => {
    expect(tokenise(':::')).to.deep.equal([
      {type: 'colon', position: 0, length: 1},
      {type: 'colon', position: 1, length: 1},
      {type: 'colon', position: 2, length: 1}
    ]);
  });

  it('should correctly handle commas', () => {
    expect(tokenise(',,,')).to.deep.equal([
      {type: 'comma', position: 0, length: 1},
      {type: 'comma', position: 1, length: 1},
      {type: 'comma', position: 2, length: 1}
    ]);
  });

  it('should correctly handle simple keys', () => {
    expect(tokenise('simpleKey')).to.deep.equal([
      {
        type: 'text',
        text: 'simpleKey',
        position: 0,
        length: 9
      }
    ]);
  });

  it('should throw if there are invalid characters in simple key', () => {
    expect(() => tokenise('foo%bar')).to.throw('Unexpected character');
  });

  it('should correctly handle quoted keys', () => {
    expect(tokenise('"a \\"quoted\\" key"')).to.deep.equal([
      {
        type: 'text',
        text: 'a "quoted" key',
        position: 0,
        length: 18
      }
    ]);
  });

  it('should throw if there is no closing quote', () => {
    expect(() => tokenise('"no \\"closing\\" quote')).to.throw('Missing closing quote');
  });

  it('should correctly handle whitespace between tokens', () => {
    expect(tokenise('  { test: \n\t   text   }      ')).to.deep.equal([
      {type: 'start', position: 2, length: 1},
      {
        type: 'text',
        text: 'test',
        position: 4,
        length: 4
      },
      {type: 'colon', position: 8, length: 1},
      {
        type: 'text',
        text: 'text',
        position: 15,
        length: 4
      },
      {type: 'end', position: 22, length: 1}
    ]);
  });

});
