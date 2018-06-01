import { Selector } from 'subobject/internal/selector-tree';


function applyFilter(filter: Selector, value: any): any {
  if (value === undefined) {
    return undefined;
  }

  if (filter.children) {
    const childFilters = filter.children;

    if (value instanceof Array) {
      return value.map(item => buildSubobject(childFilters, item));
    } else {
      return buildSubobject(childFilters, value);
    }
  }

  return value;
}


export function buildSubobject(filters: Selector[], obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const newObject: any = {};

  for (const filter of filters) {
    const value = applyFilter(filter, obj[filter.key]);

    if (value !== undefined) {
      newObject[filter.key] = value;
    }
  }

  return newObject;
}
