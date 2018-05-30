import { FilterTree } from 'subobject/internal/selector-tree';


function filterValue(include: FilterTree | true, value: any): any {
  if (!include) {
    return undefined;
  }

  if (typeof include === 'object') {
    if (value === undefined) {
      return undefined;
    } else if (value instanceof Array) {
      return value.map(item => filter(include, item));
    } else {
      return filter(include, value)
    }
  }

  if (value !== undefined) {
    return value;
  }

  return undefined;
}


export function filter(filterTree: FilterTree, obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const newObject: any = {};

  for (const key of Object.keys(filterTree)) {
    const value = filterValue(filterTree[key], obj[key]);

    if (value !== undefined) {
      newObject[key] = value;
    }
  }

  return newObject;
}
