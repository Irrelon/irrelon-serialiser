"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/**
 * @typedef {Object} Transcoder
 * @property {String} identifier
 * @property {Object} stringify
 * @property {Function} [stringify.match]
 * @property {String} [stringify.matchConstructorName]
 * @property {Function} stringify.convert
 * @property {Object} parse
 * @property {Function} [parse.match]
 * @property {Boolean} [parse.matchIdentifier]
 * @property {Function} parse.convert
 */

/**
 * Provides functionality to encode and decode JavaScript objects to strings
 * and back again. This differs from JSON.stringify and JSON.parse in that
 * special objects such as dates can be encoded to strings and back again
 * so that the reconstituted version of the string still contains a JavaScript
 * date object.
 * @constructor
 */
var Serialiser = /*#__PURE__*/function () {
  function Serialiser() {
    var _this = this;

    (0, _classCallCheck2["default"])(this, Serialiser);
    (0, _defineProperty2["default"])(this, "make", function (data, transcoder) {
      // Run through encoders and check for any that are advertising
      // they want to handle this data type
      transcoder = transcoder || _this.getTranscoder(data, "encode");

      if (transcoder) {
        // We have a match and the transcoder wants to handle this data type
        // so apply the transcoder's stringify convert function to the data's
        // toJSON property
        _this._defineToJson(data, transcoder.stringify.convert);
      }

      return data;
    });
    (0, _defineProperty2["default"])(this, "reviver", function (key, data) {
      // Attempt early exit
      if (typeof data !== "string") {
        return data;
      } // Run through decoders and check for any that are advertising
      // they want to handle this data identifier


      var transcoder = _this.getTranscoder(data, "decode");

      if (!transcoder) {
        return data;
      } // We have a match and the decoder wants to handle this data identifier
      // so apply the decoder's convert function to the data and convert it
      // back to it's original type


      var decodedData = transcoder.parse.convert(data.substr(transcoder.identifier.length + 1), transcoder);

      if (decodedData !== undefined) {
        // The decoder we called matched the object and decoded it
        // so let's return it now
        return _this.make(decodedData, transcoder);
      } // No decoder or undefined result, return basic data


      return data;
    });
    (0, _defineProperty2["default"])(this, "parse", function (data) {
      return JSON.parse(data, _this.reviver);
    });
    this._transcoderById = {};
    this._transcoder = [];
    this._transcoderForEncodingLookup = {};
    this._transcoderForDecodingLookup = {};
  }

  (0, _createClass2["default"])(Serialiser, [{
    key: "addHandler",

    /**
     * Registers a handler to intercept stringify and parse operations on
     * a particular piece of data. This allows you to add custom handlers
     * for any type or shape of data such as transcoding functions, dates,
     * regular
     * @param {String} id The name of the data handler. This can be any
     * string you like. Often it is useful to use the name of the constructor
     * / class that the handler will operate on (e.g. `Date` or `RegExp` or
     * `MyClass`). Only one transcoder with a specific id can be registered.
     * @param {Transcoder} transcoder The match and convert functions for encoding
     * and decoding the data.
     */
    value: function addHandler(id, transcoder) {
      if (!id) {
        return false;
      }

      if (this._transcoderById[id]) {
        return false;
      }

      if (!transcoder) {
        return false;
      }

      if (!transcoder.identifier) {
        throw new Error("Transcoder requires `identifier` to be defined");
      }

      if (!transcoder.stringify) {
        throw new Error("Transcoder requires `stringify` object to be defined");
      }

      if (!transcoder.parse) {
        throw new Error("Transcoder requires `parse` object to be defined");
      }

      if (!transcoder.stringify.match && !transcoder.stringify.matchConstructorName) {
        throw new Error("Transcoder requires either `stringify.match()` or `stringify.matchConstructorName` to be defined");
      }

      if (!transcoder.stringify.convert) {
        throw new Error("Transcoder requires `stringify.convert()` function to be defined");
      }

      if (!transcoder.parse.match && !transcoder.parse.matchIdentifier) {
        throw new Error("Transcoder requires either `parse.match()` or `parse.matchIdentifier` to be defined");
      }

      if (!transcoder.parse.convert) {
        throw new Error("Transcoder requires `parse.convert()` function to be defined");
      }

      this._transcoderById[id] = transcoder; // Do some wrapping

      var originalConvert = transcoder.stringify.convert;

      if (!originalConvert.___irrelonWrapper) {
        transcoder.stringify.convert = function () {
          return "".concat(transcoder.identifier, ":").concat(originalConvert.apply(this));
        };

        transcoder.stringify.convert.___irrelonWrapper = true;
      }

      if (transcoder.parse.matchIdentifier && transcoder.identifier) {
        this._transcoderForDecodingLookup[transcoder.identifier] = transcoder;
      }

      if (transcoder.stringify.matchConstructorName) {
        this._transcoderForEncodingLookup[transcoder.stringify.matchConstructorName] = transcoder;
      }

      this._transcoder.push(transcoder);

      return true;
    }
    /**
     * Define the `toJSON()` function on the passed object, assigning the `value`
     * as the function that executes when `obj.toJSON()` is called.
     * @param {Object} obj The object to modify.
     * @param {Function} value The function to assign to `obj.toJSON`.
     * @private
     */

  }, {
    key: "_defineToJson",
    value: function _defineToJson(obj, value) {
      Object.defineProperty(obj, 'toJSON', {
        value: value,
        writable: true
      });
      return obj;
    }
  }, {
    key: "getTranscoder",
    value: function getTranscoder(data) {
      var phase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "encode";
      if (phase === "encode") return this.getTranscoderForEncoding(data);
      return this.getTranscoderForDecoding(data);
    }
  }, {
    key: "getTranscoderForEncoding",
    value: function getTranscoderForEncoding(data) {
      var transcoder;

      if (data && data.constructor && data.constructor.name) {
        transcoder = this._transcoderForEncodingLookup[data.constructor.name];
      } // Run through encoders and check for any that are advertising
      // they want to handle this data type


      transcoder = transcoder || this._transcoder.find(function (transcoderItem) {
        return transcoderItem.stringify.match ? transcoderItem.stringify.match(data, transcoderItem) : false;
      }); // Return the encoder

      if (transcoder) return transcoder;
      return undefined;
    }
  }, {
    key: "getTranscoderForDecoding",
    value: function getTranscoderForDecoding() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var identifier = data.substr(0, data.indexOf(":"));
      var transcoder; // Attempt high-speed lookup

      transcoder = this._transcoderForDecodingLookup[identifier]; // Run through decoders and check for any that are advertising
      // they want to handle this data type

      transcoder = transcoder || this._transcoder.find(function (transcoderItem) {
        return transcoderItem.parse.match ? transcoderItem.parse.match(data, transcoderItem) : false;
      }); // Return the decoder

      if (transcoder) return transcoder;
      return undefined;
    }
    /**
     * Loops encoders and finds one that matches the `data` in order to
     * attach a custom toJSON function to it. This function *HAS* to modify
     * the `data` object and add or replace the existing toJSON function since
     * that is the function that is called when you run a `JSON.stringify()`
     * on any `data` in order to convert it to a serialisable string.
     * @param {*|Function|String|Number|Object|RegExp|Date|Boolean|Null|undefined} data The data object (usually an instance of some
     * constructor but not always) that we want to add a toJSON function to.
     * @param {Transcoder} [transcoder] If specified we skip asking each
     * transcoder if it wants to take responsibility for handling the `data`
     * and we use this one instead. Useful for performance if you already
     * know what transcoder to use.
     * @returns {*} The same `data` object we pass in but modified
     * if we found an encoder that wants to handle the `data`.
     */

  }, {
    key: "stringify",

    /**
     * Converts a JSON object into a stringified version.
     * @param {Object} data The data to stringify.
     * @param {Boolean} [autoTranscode=false] If set to true the
     * serialiser will transcode all instances that have a registered
     * handler. This is slower than manually wrapping instances you
     * want to have transcoded in a make() call because we have to
     * scan the object tree and identify every matching instance rather
     * than you just telling us where the instances are.
     * @returns {String} The stringified data.
     */
    value: function stringify(data) {
      var autoTranscode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return autoTranscode ? this.stringifyMake(data) : JSON.stringify(data);
    }
  }, {
    key: "stringifyMake",
    value: function stringifyMake(data) {
      return this.stringify(this.makeRecursive(data));
    }
  }, {
    key: "makeRecursive",
    value: function makeRecursive(data) {
      var _this2 = this;

      // Recursively scan the object and auto-make any objects
      // that we find
      if ((0, _typeof2["default"])(data) === "object" && data !== null) {
        // Scan each property in the object and recurse
        Object.values(data).forEach(function (value) {
          return _this2.makeRecursive(value);
        });
      } // Wrap the object in make()


      data = this.make(data);
      return data;
    }
  }]);
  return Serialiser;
}();

var _default = Serialiser;
exports["default"] = _default;