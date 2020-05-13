"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _Serialiser = _interopRequireDefault(require("./Serialiser"));

var _handlers = _interopRequireDefault(require("./handlers"));

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
      var result = serialiser.addHandler("Date", _handlers["default"].Date);

      _assert["default"].strictEqual(result, true, "Correct");
    });
  });
  describe("make()", function () {
    it("Correctly modifies an object to use the toJSON from the stringifier", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _handlers["default"].Date);
      serialiser.addHandler("RegExp", _handlers["default"].RegExp);
      serialiser.addHandler("Function", _handlers["default"].Function);
      var result = serialiser.make(new Date("2020-01-01T00:01:02Z"));

      _assert["default"].strictEqual(result.toJSON, _handlers["default"].Date.stringify.convert, "Correct");
    });
  });
  describe("stringify()", function () {
    describe("Date", function () {
      it("Correctly stringifies using stock handler: Date", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj = {
          "foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
        };
        var result = serialiser.stringify(testObj);

        _assert["default"].strictEqual(result, "{\"foo\":\"@date:2020-01-01T00:01:02.000Z\"}", "Correct");
      });
    });
    describe("RegExp", function () {
      it("Correctly stringifies using stock handler: RegExp", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj = {
          "foo": serialiser.make(new RegExp("(.*?)", "ig"))
        };
        var result = serialiser.stringify(testObj);

        _assert["default"].strictEqual(result, "{\"foo\":\"@regexp:5:(.*?):gi\"}", "Correct");
      });
    });
    describe("Function", function () {
      it("Correctly stringifies using stock handler: Function", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj = {
          "foo": serialiser.make(function (a, b) {
            return a + b;
          })
        };
        var result = serialiser.stringify(testObj);

        _assert["default"].strictEqual(result, "{\"foo\":\"@function:function (a, b) {\\n            return a + b;\\n          }\"}", "Correct");
      });
    });
  });
  describe("parse()", function () {
    describe("Date", function () {
      it("Correctly parses using stock handler", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj = {
          "foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
        };
        var intermediary = serialiser.stringify(testObj);
        var result = serialiser.parse(intermediary);

        _assert["default"].deepStrictEqual(result, testObj, "Correct");
      });
      it("Correctly auto-applies make() to rematerialised data", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj = {
          "foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
        };
        var intermediary = serialiser.stringify(testObj);
        var result = serialiser.parse(intermediary);

        _assert["default"].strictEqual(result.foo.toJSON, _handlers["default"].Date.stringify.convert, "Correct");
      });
    });
    describe("RegExp", function () {
      it("Correctly parses using stock handler", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj = {
          "foo": serialiser.make(new RegExp("(.*?)", "ig"))
        };
        var intermediary = serialiser.stringify(testObj);
        var result = serialiser.parse(intermediary);

        _assert["default"].deepStrictEqual(result, testObj, "Correct");
      });
    });
    describe("Function", function () {
      it("Correctly parses using stock handler", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj = {
          "foo": serialiser.make(function (a, b) {
            return a + b;
          })
        };
        var intermediary = serialiser.stringify(testObj);
        var result = serialiser.parse(intermediary);

        _assert["default"].strictEqual(result.foo.toString(), testObj.foo.toString(), "Correct");

        _assert["default"].strictEqual(result.foo(1, 2), 3, "Function call works");

        _assert["default"].strictEqual(testObj.foo(1, 2), 3, "Function call works");
      });
    });
  });
});