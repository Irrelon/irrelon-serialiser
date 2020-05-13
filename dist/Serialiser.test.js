"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _Serialiser = _interopRequireWildcard(require("./Serialiser"));

var _assert = _interopRequireDefault(require("assert"));

describe("Serialiser", function () {
  describe("constructor()", function () {
    it("Constructs correctly", function () {
      var serialiser = new _Serialiser["default"]();

      _assert["default"].strictEqual(serialiser instanceof _Serialiser["default"], true, "Correct");
    });
  });
  describe("addHandler()", function () {
    it("Allows a new handler to be registered", function () {
      var serialiser = new _Serialiser["default"]();
      var result = serialiser.addHandler("Date", _Serialiser.standardHandlers.Date);

      _assert["default"].strictEqual(result, true, "Correct");
    });
  });
  describe("make()", function () {
    it("Correctly modifies an object to use the toJSON from the stringifier", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _Serialiser.standardHandlers.Date);
      serialiser.addHandler("RegExp", _Serialiser.standardHandlers.RegExp);
      var result = serialiser.make(new Date("2020-01-01T00:01:02Z"));

      _assert["default"].strictEqual(result.toJSON, _Serialiser.standardHandlers.Date.stringify.convert, "Correct");
    });
  });
  describe("stringify()", function () {
    it("Correctly stringifies using stock handler: Date", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _Serialiser.standardHandlers.Date);
      serialiser.addHandler("RegExp", _Serialiser.standardHandlers.RegExp);
      var testObj = {
        "foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
      };
      var result = serialiser.stringify(testObj);

      _assert["default"].strictEqual(result, "{\"foo\":\"@date:2020-01-01T00:01:02.000Z\"}", "Correct");
    });
    it("Correctly stringifies using stock handler: RegExp", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _Serialiser.standardHandlers.Date);
      serialiser.addHandler("RegExp", _Serialiser.standardHandlers.RegExp);
      var testObj = {
        "foo": serialiser.make(new RegExp("(.*?)", "ig"))
      };
      var result = serialiser.stringify(testObj);

      _assert["default"].strictEqual(result, "{\"foo\":\"@regexp:5:(.*?):gi\"}", "Correct");
    });
  });
  describe("parse()", function () {
    it("Correctly parses using stock handler: Date", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _Serialiser.standardHandlers.Date);
      serialiser.addHandler("RegExp", _Serialiser.standardHandlers.RegExp);
      var testObj = {
        "foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
      };
      var intermediary = serialiser.stringify(testObj);
      var result = serialiser.parse(intermediary);

      _assert["default"].deepStrictEqual(result, testObj, "Correct");
    });
    it("Correctly parses using stock handler: RegExp", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _Serialiser.standardHandlers.Date);
      serialiser.addHandler("RegExp", _Serialiser.standardHandlers.RegExp);
      var testObj = {
        "foo": serialiser.make(new RegExp("(.*?)", "ig"))
      };
      var intermediary = serialiser.stringify(testObj);
      var result = serialiser.parse(intermediary);

      _assert["default"].deepStrictEqual(result, testObj, "Correct");
    });
    it("Correctly auto-applies make() to rematerialised data", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _Serialiser.standardHandlers.Date);
      serialiser.addHandler("RegExp", _Serialiser.standardHandlers.RegExp);
      var testObj = {
        "foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
      };
      var intermediary = serialiser.stringify(testObj);
      var result = serialiser.parse(intermediary);

      _assert["default"].strictEqual(result.foo.toJSON, _Serialiser.standardHandlers.Date.stringify.convert, "Correct");
    });
  });
});