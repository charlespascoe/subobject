# Subobject - pick a subset of keys from an object

## Usage

```ts
import { subobject } from 'subobject';

// An example object
const user = {
    id: 123,
    firstName: 'Bob',
    otherNames: 'Smith',
    role: {
        name: 'Admin',
        canDeleteWidgets: true
    }
};

const pickNames = subobject('{firstName,otherNames}');

console.log(pickNames(user));
//{
//    firstName: 'Bob',
//    otherNames: 'Smith'
//}

const idAndRole = subojbect('{id, role: { name }}');

console.log(idAndRole(user));
{
    id: 123,
    role: {
        name: 'Admin'
    }
}

```

## Syntax

```ebnf
whitespace = ? Any whitespace character ? ;

simple_char = 'a'..'z' | 'A'..'Z' | '0'..'9' | '-' | '$' | '_' ;

simple_key = simple_char, { simple_char } ;

complex_key = '"', ? Backslash-escaped string of characters ?, '"' ;

key = simple_key | complex_key ;

expression = key, [ ':', { whitespace }, object ] ;

object = "{", { whitespace } [ expression, { ",", { whitespace }, expression } ], { whitespace }, "}";
```
