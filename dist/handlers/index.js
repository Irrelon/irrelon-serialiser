"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dateHandler = _interopRequireDefault(require("./dateHandler"));

var _regExpHandler = _interopRequireDefault(require("./regExpHandler"));

var _functionHandler = _interopRequireDefault(require("./functionHandler"));

var _default = {
  // Handler for Date() instances
  "Date": _dateHandler["default"],
  // Handler for RegExp() instances
  "RegExp": _regExpHandler["default"],
  // Handler for Function() instances
  "Function": _functionHandler["default"]
};
exports["default"] = _default;