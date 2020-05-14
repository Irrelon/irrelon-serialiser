"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var regExpHandler = {
  "identifier": "@regexp",
  "stringify": {
    // Check if we want to operate on this data
    //"match": (objInstance) => objInstance instanceof RegExp,
    // You can specify a match constructor instead of a `match` function,
    // this significantly increases the performance of the serialiser but
    // will not use your `match` function so if you have any more complex
    // comparison logic requirements, you should not use `matchConstructorName`.
    "matchConstructorName": "RegExp",
    // Define a function that converts the data to a string
    // we don't use an arrow function here because this function
    // will be assigned to obj.toJSON and we want to be able
    // to access the object's internal `this` context
    "convert": function convert() {
      return "".concat(this.source.length, ":").concat(this.source, ":").concat(this.global ? "g" : "").concat(this.ignoreCase ? "i" : "");
    }
  },
  "parse": {
    // Check if we should be responsible for converting this
    // string data back to an object
    //"match": (data) => typeof data === "string" && data.indexOf("@regexp:") === 0,
    // You can specify a match identifier instead of a `match` function,
    // this significantly increases the performance of the serialiser but
    // will not use your `match` function so if you have any more complex
    // comparison logic requirements, you should not use `matchIdentifier`.
    "matchIdentifier": true,
    // If the data matched our `match()` test function above, use
    // this function to convert the string back to an object
    "convert": function convert(dataStr) {
      var lengthEnd = dataStr.indexOf(":");
      var sourceLength = Number(dataStr.substr(0, lengthEnd));
      var source = dataStr.substr(lengthEnd + 1, sourceLength);
      var params = dataStr.substr(lengthEnd + sourceLength + 2);
      return new RegExp(source, params);
    }
  }
};
var _default = regExpHandler;
exports["default"] = _default;