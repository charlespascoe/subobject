import { filter } from 'subobject/internal/filter';
import { FilterTree } from 'subobject/internal/matcher-tree';
import { expect } from 'chai';
import 'mocha';


describe('subobject/internal/filter:filter', () => {
  it('should return the input value for non-objects', () => {
    const filterTree: FilterTree = {foo: true};

    const ident = (val: any) => expect(filter(filterTree, val)).to.equal(val);

    ident(0);
    ident(1);
    ident('foo');
    ident(null);
    ident(undefined);
    ident(true);
    ident(false);
  });

  it('should return a simplified object when given a shallow filter tree', () => {
    const filterTree: FilterTree = {
      foo: true,
      bar: true
    };

    const input = {
      foo: 123,
      bar: 'abc',
      baz: true
    };

    const expected = {
      foo: 123,
      bar: 'abc'
    };

    expect(filter(filterTree, input)).to.deep.equal(expected);
  });

  it('should return a simplified object when given a deep filter tree', () => {
    const filterTree: FilterTree = {
      foo: {
        bar: true
      }
    };

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

    expect(filter(filterTree, input)).to.deep.equal(expected);
  });

  it('should not include missing keys', () => {
    const filterTree: FilterTree = {
      foo: true,
      bar: true,
      baz: {
        blip: true
      }
    };

    const input = {
      foo: 123,
      blah: 'abc'
    };

    const expected = {
      foo: 123
    };

    expect(filter(filterTree, input)).to.deep.equal(expected);
  });

  it('should filter items of arrays', () => {
    const filterTree: FilterTree = {
      foo: {
        bar: true
      }
    };

    const input = {
      foo: [
        {bar: 123, baz: 'abc'},
        {bar: 456, baz: 'def'},
      ]
    };

    const expected = {
      foo: [
        {bar: 123},
        {bar: 456}
      ]
    };

    expect(filter(filterTree, input)).to.deep.equal(expected);
  });
});
