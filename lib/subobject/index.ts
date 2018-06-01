import { tokenise } from 'subobject/internal/tokens';
import { buildRootObjectSelectors } from 'subobject/internal/selector-tree';
import { buildSubobject } from 'subobject/internal';
import { ParsingError } from 'subobject/internal/errors';

export { ParsingError } from 'subobject/internal/errors';


export function subobject(pattern: string): (obj: any) => any {
  try {
    const tokens = tokenise(pattern);

    const selectors = buildRootObjectSelectors(tokens);

    return (obj) => buildSubobject(selectors, obj);
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
