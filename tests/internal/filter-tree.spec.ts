import {
  findClosingBrace,
  readNextExpression,
  buildObjectFilterTree,
  buildRootObjectFilterTree
} from 'subobject/internal/filter-tree';
import { Token } from 'subobject/internal/tokens';
import { expect } from 'chai';
import 'mocha';


describe('subobject/internal/filter-tree:findClosingBrace', () => {

  it('should return -1 when starting index is outside the array', () => {
    expect(findClosingBrace(1, [])).to.equal(-1);
  });

  it('should return -1 when starting index is the last item of the array', () => {
    expect(findClosingBrace(1, [{type: 'start', position: 0, length: 1}])).to.equal(-1);
  });

  it('should return the correct index when there are no nested objects', () => {
    expect(findClosingBrace(0, [{type: 'start', position: 0, length: 1}, {type: 'end', position: 1, length: 1}])).to.equal(1);
  });

  it('should return the correct index when there are nested objects', () => {
    expect(
      findClosingBrace(
        1,
        [
          {type: 'text', text: 'foo', position: 0, length: 3},
          {type: 'start', position: 3, length: 1},
          {type: 'colon', position: 4, length: 1},
          {type: 'start', position: 5, length: 1},
          {type: 'end', position: 6, length: 1},
          {type: 'start', position: 7, length: 1},
          {type: 'start', position: 8, length: 1},
          {type: 'end', position: 9, length: 1},
          {type: 'end', position: 10, length: 1},
          {type: 'end', position: 11, length: 1},
          {type: 'comma', position: 12, length: 1}
        ]
      )
    ).to.equal(9);
  });

  it('should return -1 when there is no closing bracket', () => {
    expect(findClosingBrace(0, [
      {type: 'start', position: 0, length: 1},
      {type: 'start', position: 1, length: 1},
      {type:'end', position: 2, length: 1}
    ])).to.equal(-1);
  });

});


describe('subobject/internal/filter-tree:readNextExpression', () => {

  it('should return an empty filter tree when 0 tokens are given', () => {
    expect(readNextExpression(0, [])).to.deep.equal({
      nextPosition: 0,
      filterTree: {}
    });
  });

  it('should throw when the next token is not text', () => {
    const exception = expect(() => readNextExpression(0, [{type: 'start', position: 0, length: 1}]))
      .to.throw('Unexpected token (was expecting a key)');
    exception.has.property('position', 0);
    exception.has.property('length', 1);
  });

  it('should return a filter tree with a text key', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'test',
        position: 0,
        length: 4
      }
    ];

    expect(readNextExpression(0, tokens)).to.deep.equal({
      nextPosition: 1,
      filterTree: {test: true}
    });
  });

  it('should return a filter tree with a text key, skipping commas', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'test',
        position: 0,
        length: 4
      },
      {
        type: 'comma',
        position: 4,
        length: 1
      }
    ];

    expect(readNextExpression(0, tokens)).to.deep.equal({
      nextPosition: 2,
      filterTree: {test: true}
    });
  });

  it('should throw an error if a colon is not followed by an object', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'test',
        position: 0,
        length: 4
      },
      {
        type: 'colon',
        position: 4,
        length: 1
      }
    ];

    const exception = expect(() => readNextExpression(0, tokens)).to.throw('Expected object after colon');

    exception.has.property('position', 4);
    exception.has.property('length', 1);
  });

  it('should throw if there is no closing brace', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'test',
        position: 0,
        length: 4
      },
      {
        type: 'colon',
        position: 4,
        length: 1
      },
      {
        type: 'start',
        position: 5,
        length: 1
      }
    ];

    const exception = expect(() => readNextExpression(0, tokens)).to.throw('Missing closing brace');

    exception.has.property('position', 5);
    exception.has.property('length', 1);
  });

  it('should return the appropriate filter tree for nested objects', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'test',
        position: 0,
        length: 4
      },
      {
        type: 'colon',
        position: 4,
        length: 1
      },
      {
        type: 'start',
        position: 5,
        length: 1
      },
      {
        type: 'text',
        text: 'foo',
        position: 6,
        length: 3
      },
      {
        type: 'end',
        position: 9,
        length: 1
      }
    ];

    expect(readNextExpression(0, tokens)).to.deep.equal({
      nextPosition: 5,
      filterTree: {
        test: {
          foo: true
        }
      }
    });
  });
});


describe('subobject/internal/filter-tree:buildObjectFilterTree', () => {

  it('should return an empty filter tree for an empty array of tokens', () => {
    expect(buildObjectFilterTree([])).to.deep.equal({});
  });

  it('should return the correct filter tree for one key', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'test',
        position: 0,
        length: 4
      }
    ];

    expect(buildObjectFilterTree(tokens)).to.deep.equal({test: true});
  });

  it('should return the correct filter tree for multiple keys', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'foo',
        position: 0,
        length: 3
      },
      {
        type: 'comma',
        position: 3,
        length: 1
      },
      {
        type: 'text',
        text: 'bar',
        position: 4,
        length: 3
      },
      {
        type: 'comma',
        position: 7,
        length: 1
      },
      {
        type: 'text',
        text: 'baz',
        position: 8,
        length: 3
      }
    ];

    expect(buildObjectFilterTree(tokens)).to.deep.equal({
      foo: true,
      bar: true,
      baz: true
    });
  });

  it('should correctly handle nested objects', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'foo',
        position: 0,
        length: 3
      },
      {
        type: 'colon',
        position: 3,
        length: 1
      },
      {
        type: 'start',
        position: 4,
        length: 1
      },
      {
        type: 'text',
        text: 'bar',
        position: 5,
        length: 3
      },
      {
        type: 'comma',
        position: 8,
        length: 1
      },
      {
        type: 'text',
        text: 'baz',
        position: 9,
        length: 3
      },
      {
        type: 'end',
        position: 12,
        length: 1
      }
    ];

    expect(buildObjectFilterTree(tokens)).to.deep.equal({
      foo: {
        bar: true,
        baz: true
      }
    });
  });

  it('should throw when duplicate keys are specified', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'foo',
        position: 0,
        length: 3
      },
      {
        type: 'comma',
        position: 3,
        length: 1
      },
      {
        type: 'text',
        text: 'foo',
        position: 4,
        length: 3
      }
    ];

    const exception = expect(() => buildObjectFilterTree(tokens)).to.throw('Duplicate key specified');
    exception.has.property('position', 4);
    exception.has.property('length', 3);
  });

});


describe('subobject/internal/filter-tree:buildRootObjectFilterTree', () => {

  it('should throw if no tokens are given', () => {
    const exception = expect(() => buildRootObjectFilterTree([])).to.throw('No input provided');
    exception.has.property('position', 0);
    exception.has.property('length', 0);
  });

  it('should throw if the first token isn\'t an opening brace', () => {
    const tokens: Token[] = [
      {
        type: 'text',
        text: 'foo',
        position: 0,
        length: 3
      }
    ];

    const exception = expect(() => buildRootObjectFilterTree(tokens)).to.throw('Unexpected token (expected open brace)');
    exception.has.property('position', 0);
    exception.has.property('length', 3);
  });

  it('should throw if there is no closing brace', () => {
    const tokens: Token[] = [
      {
        type: 'start',
        position: 0,
        length: 1
      },
      {
        type: 'start',
        position: 1,
        length: 1
      },
      {
        type: 'end',
        position: 2,
        length: 1
      }
    ];

    const exception = expect(() => buildRootObjectFilterTree(tokens)).to.throw('Cannot find closing brace');
    exception.has.property('position', 0);
    exception.has.property('length', 1);
  });

  it('should throw if there is unexpected text after the object', () => {
    const tokens: Token[] = [
      {
        type: 'start',
        position: 0,
        length: 1
      },
      {
        type: 'text',
        text: 'foo',
        position: 1,
        length: 3
      },
      {
        type: 'end',
        position: 4,
        length: 1
      },
      {
        type: 'colon',
        position: 5,
        length: 1
      },
      // Space
      {
        type: 'text',
        text: 'foob',
        position: 7,
        length: 4
      }
    ];

    const exception = expect(() => buildRootObjectFilterTree(tokens)).to.throw('Unexpected text after end of object');
    exception.has.property('position', 5);
    exception.has.property('length', 6);
  });

  it('should return the correct filter tree for valid input', () => {
    const tokens: Token[] = [
      {
        type: 'start',
        position: 0,
        length: 1
      },
      {
        type: 'text',
        text: 'foo',
        position: 1,
        length: 3
      },
      {
        type: 'end',
        position: 4,
        length: 1
      }
    ];

    expect(buildRootObjectFilterTree(tokens)).to.deep.equal({foo: true});
  });

});
