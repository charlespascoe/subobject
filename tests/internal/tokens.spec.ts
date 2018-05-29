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
      token: {type: 'start'}
    });
  });

  it('should correctly handle close object', () => {
    expect(nextToken(0, '}')).to.deep.equal({
      nextPosition: 1,
      token: {type: 'end'}
    });
  });

  it('should correctly handle commas', () => {
    expect(nextToken(0, ',')).to.deep.equal({
      nextPosition: 1,
      token: {type: 'comma'}
    });
  });

  it('should correctly handle colons', () => {
    expect(nextToken(0, ':')).to.deep.equal({
      nextPosition: 1,
      token: {type: 'colon'}
    });
  });

  it('should correctly handle quoted text', () => {
    expect(nextToken(0, '"some \\"quoted\\" text"')).to.deep.equal({
      nextPosition: 22,
      token: {type: 'text', text: 'some "quoted" text'}
    });
  });

  it('should throw if there is no closing quote', () => {
    expect(() => nextToken(0, '"no \\"closing\\" quote')).to.throw('Missing closing quote');
  });

  it('should correctly handle simple text', () => {
    expect(nextToken(0, 'simpleText')).to.deep.equal({
      nextPosition: 10,
      token: {type: 'text', text: 'simpleText'}
    });
  });

  it('should throw if there are invalid characters in simple key', () => {
    expect(() => nextToken(0, '%bar')).to.throw('Unexpected character');
  });

  it('should return the correct token for a given position', () => {
    expect(nextToken(4, 'foo,bar,baz')).to.deep.equal({
      nextPosition: 7,
      token: {type: 'text', text: 'bar'}
    });
  });

});


describe('subobject/inernal/tokens:tokenise', () => {

  it('should correctly handle open/close object', () => {
    expect(tokenise('{}')).to.deep.equal([
      {type: 'start'},
      {type: 'end'}
    ]);
  });

  it('should correctly handle colons', () => {
    expect(tokenise(':::')).to.deep.equal([
      {type: 'colon'},
      {type: 'colon'},
      {type: 'colon'}
    ]);
  });

  it('should correctly handle commas', () => {
    expect(tokenise(',,,')).to.deep.equal([
      {type: 'comma'},
      {type: 'comma'},
      {type: 'comma'}
    ]);
  });

  it('should correctly handle simple keys', () => {
    expect(tokenise('simpleKey')).to.deep.equal([
      {
        type: 'text',
        text: 'simpleKey',
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
        text: 'a "quoted" key'
      }
    ]);
  });

  it('should throw if there is no closing quote', () => {
    expect(() => tokenise('"no \\"closing\\" quote')).to.throw('Missing closing quote');
  });

  it('should correctly handle whitespace between tokens', () => {
    expect(tokenise('  { test: \n\t   text   }      ')).to.deep.equal([
      {type: 'start'},
      {
        type: 'text',
        text: 'test',
      },
      {type: 'colon'},
      {
        type: 'text',
        text: 'text',
      },
      {type: 'end'}
    ]);
  });

});
