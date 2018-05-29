import { subobject } from 'subobject';
import { expect } from 'chai';
import 'mocha';


describe('subobject:subobject', () => {

  it('should throw when invalid tokens are given', () => {
    const exception = expect(() => subobject('foo%bar')).to.throw('Unexpected character');
    exception.has.property('position', 3);
    exception.has.property('length', 1);
  });

  it('should throw when the pattern is incorrect', () => {
    const exception = expect(() => subobject('{foo} bar,baz')).to.throw('Unexpected text after end of object');
    exception.has.property('position', 6);
    exception.has.property('length', 7);
  });

  it('should correctly parse pattern and return the correct object', () => {
    const input = {
      foo: {
        bar: 123,
        baz: 'abc'
      },
      blah: true
    };

    const expected = {
      foo: {
        bar: 123
      }
    };

    const func = subobject('{foo: {bar}, "floob flarb"}');

    expect(func(input)).to.deep.equal(expected);
  });

});
