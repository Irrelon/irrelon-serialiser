"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var functionHandler = {
  "identifier": "@function",
  "stringify": {
    // Check if we want to operate on this data
    //"match": (objInstance) => objInstance instanceof Function,
    // You can specify a match constructor instead of a `match` function,
    // this significantly increases the performance of the serialiser but
    // will not use your `match` function so if you have any more complex
    // comparison logic requirements, you should not use `matchConstructorName`.
    "matchConstructorName": "Function",
    // Define a function that converts the data to a string
    // we don't use an arrow function here because this function
    // will be assigned to obj.toJSON and we want to be able
    // to access the object's internal `this` context
    "convert": function convert() {
      return this.toString();
    }
  },
  "parse": {
    // Check if we should be responsible for converting this
    // string data back to an object
    //"match": (data, transcoder) => typeof data === 'string' && data.indexOf(`${transcoder.identifier}:`) === 0,
    // You can specify a match identifier instead of a `match` function,
    // this significantly increases the performance of the serialiser but
    // will not use your `match` function so if you have any more complex
    // comparison logic requirements, you should not use `matchIdentifier`.
    "matchIdentifier": true,
    // If the data matched our `match()` test function above, use
    // this function to convert the string back to an object
    "convert": function convert(data, transcoder) {
      var newFunc;
      eval("newFunc = " + data + ";");
      return newFunc;
    }
  }
};
var _default = functionHandler;
exports["default"] = _default;