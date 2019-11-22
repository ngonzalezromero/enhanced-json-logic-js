# json-logic-js

This parser accepts [JsonLogic](http://jsonlogic.com) rules and executes them in JavaScript.

The JsonLogic format is designed to allow you to share rules (logic) between front-end and back-end code (regardless of language difference), even to store logic along with a record in a database.  JsonLogic is documented extensively at [JsonLogic.com](http://jsonlogic.com), including examples of every [supported operation](http://jsonlogic.com/operations.html) and a place to [try out rules in your browser](http://jsonlogic.com/play.html).

The same format can also be executed in PHP by the library [json-logic-php](https://github.com/jwadhams/json-logic-php/)
## Examples

### Simple
```js
jsonLogic.apply( { "==" : [1, 1] } );
// true
```

This is a simple test, equivalent to `1 == 1`.  A few things about the format:

  1. The operator is always in the "key" position. There is only one key per JsonLogic rule.
  1. The values are typically an array.
  1. Each value can be a string, number, boolean, array (non-associative), or null

### Compound
Here we're beginning to nest rules.

```js
jsonLogic.apply(
  {"and" : [
    { ">" : [3,1] },
    { "<" : [1,3] }
  ] }
);
// true
```
