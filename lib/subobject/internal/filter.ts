import { FilterTree } from 'subobject/internal/filter-tree';


export function filter(filterTree: FilterTree, obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  return Object
    .keys(filterTree)
    .reduce((newObj, key) => {
      const include = filterTree[key];

      if (typeof include === 'object') {
        if (obj[key] === undefined) {
          return newObj;
        } else {
          return Object.assign(
            {},
            newObj,
            {[key]: filter(include, obj[key])}
          );
        }
      }

      if (include && obj[key] !== undefined) {
        return Object.assign(
          {},
          newObj,
          {[key]: obj[key]}
        );
      }

      return newObj;
    }, {});
}
