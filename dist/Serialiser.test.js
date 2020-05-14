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
    it("Calling toJSON() after make returns the correct string", function () {
      var serialiser = new _Serialiser["default"]();
      serialiser.addHandler("Date", _handlers["default"].Date);
      serialiser.addHandler("RegExp", _handlers["default"].RegExp);
      serialiser.addHandler("Function", _handlers["default"].Function);
      var intermediary = serialiser.make(new Date("2020-02-03T00:01:02Z"));

      _assert["default"].ok(typeof intermediary.toJSON === "function", "The toJSON property is a function");

      var result = intermediary.toJSON();

      _assert["default"].strictEqual(result, "@date:2020-02-03T00:01:02.000Z", "Correct");
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
  describe("Auto-Transcoding", function () {
    describe("stringify()", function () {
      it("Can auto-transcode and stringify object hierarchies", function () {
        var serialiser = new _Serialiser["default"]();
        serialiser.addHandler("Date", _handlers["default"].Date);
        serialiser.addHandler("RegExp", _handlers["default"].RegExp);
        serialiser.addHandler("Function", _handlers["default"].Function);
        var testObj1 = {
          "dt": new Date("1960-12-01T01:02:03Z"),
          "foo": [{
            "_id": "123",
            "num": 34,
            "func": function func(a, b) {
              return a + b;
            }
          }, {
            "regexp": /(.*?)/gi
          }]
        };
        var testObj2 = {
          "dt": new Date("1960-12-01T01:02:03Z"),
          "foo": [{
            "_id": "123",
            "num": 34,
            "func": function func(a, b) {
              return a + b;
            }
          }, {
            "regexp": /(.*?)/gi
          }]
        }; // Run stringify without auto-transcoding

        var result1 = serialiser.stringify(testObj1); // Run it again with auto-transcoding

        var result2 = serialiser.stringify(testObj2, true); // Run it again without auto-transcoding - it has already
        // been transcoded though so should resolve to a rich
        // serialisation rather than a vanilla one because by default
        // we use mutable object manipulation rather than immutable
        // cloning and return

        var result3 = serialiser.stringify(testObj2);

        _assert["default"].strictEqual(result1, "{\"dt\":\"1960-12-01T01:02:03.000Z\",\"foo\":[{\"_id\":\"123\",\"num\":34},{\"regexp\":{}}]}", "Stringify data should match expected");

        _assert["default"].strictEqual(result2, "{\"dt\":\"@date:1960-12-01T01:02:03.000Z\",\"foo\":[{\"_id\":\"123\",\"num\":34,\"func\":\"@function:function func(a, b) {\\n              return a + b;\\n            }\"},{\"regexp\":\"@regexp:5:(.*?):gi\"}]}", "Stringify data should match expected");

        _assert["default"].strictEqual(result3, "{\"dt\":\"@date:1960-12-01T01:02:03.000Z\",\"foo\":[{\"_id\":\"123\",\"num\":34,\"func\":\"@function:function func(a, b) {\\n              return a + b;\\n            }\"},{\"regexp\":\"@regexp:5:(.*?):gi\"}]}", "Stringify data should match expected"); // Now parse and check the values


        var result1p = serialiser.parse(result1);
        var result2p = serialiser.parse(result2);
        var result3p = serialiser.parse(result3);

        _assert["default"].deepStrictEqual(result1p, {
          "dt": "1960-12-01T01:02:03.000Z",
          "foo": [{
            "_id": "123",
            "num": 34
          }, {
            "regexp": {}
          }]
        }, "The parsed object is as expected");

        _assert["default"].strictEqual(result2p.dt.toISOString(), testObj2.dt.toISOString(), "The parsed object is as expected");

        _assert["default"].strictEqual(result2p.foo[0].func.toString(), testObj2.foo[0].func.toString(), "The parsed object is as expected");

        _assert["default"].strictEqual(result2p.foo[1].regexp.toString(), testObj2.foo[1].regexp.toString(), "The parsed object is as expected");

        _assert["default"].strictEqual(result3p.dt.toISOString(), testObj2.dt.toISOString(), "The parsed object is as expected");

        _assert["default"].strictEqual(result3p.foo[0].func.toString(), testObj2.foo[0].func.toString(), "The parsed object is as expected");

        _assert["default"].strictEqual(result3p.foo[1].regexp.toString(), testObj2.foo[1].regexp.toString(), "The parsed object is as expected");
      });
    });
  });
});