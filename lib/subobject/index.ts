import { tokenise } from 'subobject/internal/tokens';
import { buildRootObjectFilterTree } from 'subobject/internal/filter-tree';
import { filter } from 'subobject/internal/filter';
import { ParsingError } from 'subobject/internal/errors';

export { ParsingError } from 'subobject/internal/errors';


export function subobject(pattern: string): (obj: any) => any {
  try {
    const tokens = tokenise(pattern);

    const filterTree = buildRootObjectFilterTree(tokens);

    return (obj) => filter(filterTree, obj);
  } catch (err) {
    if (!(err instanceof ParsingError)) {
      throw err;
    }

    throw new ParsingError(
      err.position,
      err.length,
      err.message,
      pattern
    );
  }
}
