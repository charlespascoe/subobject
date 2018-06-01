import { Selector } from 'subobject/internal/selector-tree';


function applyFilter(filter: Selector, value: any): any {
  if (value === undefined) {
    return undefined;
  }

  if (filter.children) {
    return buildSubobject(filter.children, value);
  }

  return value;
}


export function buildSubobject(filters: Selector[], obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => buildSubobject(filters, item));
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
