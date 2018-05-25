import { tokenise } from '../../lib/internal/tokens';
import { expect } from 'chai';
import 'mocha';


describe('tokenise', () => {
  it('should correctly handle open/close object', () => {
    expect(tokenise('{}')).to.deep.equal([
      {type: 'start'},
      {type: 'end'}
    ]);
  });

  it('should correctly handle simple keys', () => {
    expect(tokenise('simpleKey')).to.deep.equal([
      {
        type: 'text',
        value: 'simpleKey',
        followedByColon: false
      }
    ]);
  });

  it('should correctly handle colons on simple keys', () => {
    expect(tokenise('simpleKey:')).to.deep.equal([
      {
        type: 'text',
        value: 'simpleKey',
        followedByColon: true
      }
    ]);
  });

  it('should throw if there are invalid characters in simple key', () => {
    expect(() => tokenise('foo%bar')).to.throw('Invalid unquoted text');
    expect(() => tokenise('foo%bar:')).to.throw('Invalid unquoted text');
    expect(() => tokenise('foo%bar foo')).to.throw('Invalid unquoted text');
  });

  it('should throw if there are unexpected colons', () => {
    expect(() => tokenise('foo::')).to.throw('Unexpected colon');
  });

  it('should correctly handle quoted keys', () => {
    expect(tokenise('"a \\"quoted\\" key"')).to.deep.equal([
      {
        type: 'text',
        value: 'a "quoted" key',
        followedByColon: false
      }
    ]);
  });

  it('should correctly handle colons on quoted keys', () => {
    expect(tokenise('"a \\"quoted\\" key":')).to.deep.equal([
      {
        type: 'text',
        value: 'a "quoted" key',
        followedByColon: true
      }
    ]);
  });

  it('should throw if there is no closing quote', () => {
    expect(() => tokenise('"no \\"closing\\" quote')).to.throw('Missing closing quote');
  });

  it('should correctly handle spaces between tokens', () => {
    expect(tokenise('{ test: \n\t   text   }')).to.deep.equal([
      {type: 'start'},
      {
        type: 'text',
        value: 'test',
        followedByColon: true
      },
      {
        type: 'text',
        value: 'text',
        followedByColon: false
      },
      {type: 'end'}
    ]);
  });
});
