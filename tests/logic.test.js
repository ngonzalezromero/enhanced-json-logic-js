const jsonLogic = require("../logic.js");
const fs = require("fs");
const path = require("path");


test("applies() tests", () => {
  // Data contains a real object with methods and local state
  const body = fs.readFileSync(path.resolve(__dirname, "tests.json"), "utf8");

  let tests = JSON.parse(body);
  tests = tests.filter((test) => {
    return typeof test !== "string";
  });

  for (let test of tests) {
    const rule = test[0];
    const data = test[1];
    const expected = test[2];
    const result = jsonLogic.apply(rule, data);
    expect(result).toEqual(expected);
  }

});

test("rule_like() tests", () => {
  // Data contains a real object with methods and local state
  const body = fs.readFileSync(path.resolve(__dirname, "rule_like.json"), "utf8");

  let tests = JSON.parse(body);
  tests = tests.filter((test) => {
    return typeof test !== "string";
  });


  for (let test of tests) {
    const rule = test[0];
    const data = test[1];
    const expected = test[2];
    const result = jsonLogic.rule_like(rule, data);
    expect(result).toEqual(expected);

  }

});


test("Expanding functionality with method", () => {
  // Data contains a real object with methods and local state
  const a = {
    count: 0,
    increment: function() {
      return this.count += 1;
    },
    add: function(b) {
      return this.count += b;
    },
  };
  expect(jsonLogic.apply(
    {"method": [{"var": "a"}, "increment"]},
    {"a": a},
  )).toEqual(1);
  // Look up "a" in data, and run the increment method on it with no args.


  expect(a.count).toEqual(1); // Happy state change

  expect(jsonLogic.apply(
    {"method": [{"var": "a"}, "add", [41]]},
    {"a": a},
  )).toEqual(42);
  expect(a.count).toEqual(42);

});


test("Control structures don't eval depth-first", () => {
  // Depth-first recursion was wasteful but not harmful until we added custom operations that could have side-effects.

  // If operations run the condition, if truthy, it runs and returns that consequent.
  // Consequents of falsy conditions should not run.
  // After one truthy condition, no other condition should run
  let conditions = [];
  let consequents = [];
  jsonLogic.add_operation("push.if", function(v) {
    conditions.push(v);
    return v;
  });
  jsonLogic.add_operation("push.then", function(v) {
    consequents.push(v);
    return v;
  });
  jsonLogic.add_operation("push.else", function(v) {
    consequents.push(v);
    return v;
  });

  jsonLogic.apply({
    "if": [
      {"push.if": [true]},
      {"push.then": ["first"]},
      {"push.if": [false]},
      {"push.then": ["second"]},
      {"push.else": ["third"]},
    ],
  });


  expect(conditions).toEqual([true]);
  expect(consequents).toEqual(["first"]);


  conditions = [];
  consequents = [];
  jsonLogic.apply({
    "if": [
      {"push.if": [false]},
      {"push.then": ["first"]},
      {"push.if": [true]},
      {"push.then": ["second"]},
      {"push.else": ["third"]},
    ],
  });
  expect(conditions).toEqual([false, true]);
  expect(consequents).toEqual(["second"]);

  conditions = [];
  consequents = [];
  jsonLogic.apply({
    "if": [
      {"push.if": [false]},
      {"push.then": ["first"]},
      {"push.if": [false]},
      {"push.then": ["second"]},
      {"push.else": ["third"]},
    ],
  });
  expect(conditions).toEqual([false, false]);
  expect(consequents).toEqual(["third"]);


  jsonLogic.add_operation("push", function(arg) {
    i.push(arg);
    return arg;
  });
  let i = [];

  i = [];
  jsonLogic.apply({"and": [{"push": [false]}, {"push": [false]}]});
  expect(i).toEqual([false]);
  i = [];
  jsonLogic.apply({"and": [{"push": [false]}, {"push": [true]}]});
  expect(i).toEqual([false]);
  i = [];
  jsonLogic.apply({"and": [{"push": [true]}, {"push": [false]}]});
  expect(i).toEqual([true, false]);
  i = [];
  jsonLogic.apply({"and": [{"push": [true]}, {"push": [true]}]});
  expect(i).toEqual([true, true]);


  i = [];
  jsonLogic.apply({"or": [{"push": [false]}, {"push": [false]}]});
  expect(i).toEqual([false, false]);
  i = [];
  jsonLogic.apply({"or": [{"push": [false]}, {"push": [true]}]});
  expect(i).toEqual([false, true]);
  i = [];
  jsonLogic.apply({"or": [{"push": [true]}, {"push": [false]}]});
  expect(i).toEqual([true]);
  i = [];
  jsonLogic.apply({"or": [{"push": [true]}, {"push": [true]}]});
  expect(i).toEqual([true]);

});



