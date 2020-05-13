const dateHandler = {
	"identifier": "@date",
	"stringify": {
		// Check if we want to operate on this data
		"match": (objInstance) => objInstance instanceof Date,
		
		// Define a function that converts the data to a string
		// we don't use an arrow function here because this function
		// will be assigned to obj.toJSON and we want to be able
		// to access the object's internal `this` context so we can
		// call its `toISOString()` function
		"convert": function () {
			return "@date:" + this.toISOString();
		}
	},
	"parse": {
		// Check if we should be responsible for converting this
		// string data back to an object
		"match": (data) => typeof data === 'string' && data.indexOf('@date:') === 0,
		
		// If the data matched our `match()` test function above, use
		// this function to convert the string back to an object
		"convert": (data) => new Date(data.substr(6))
	}
};

const regExpHandler = {
	"identifier": "@regexp",
	"stringify": {
		// Check if we want to operate on this data
		"match": (objInstance) => objInstance instanceof RegExp,
		
		// Define a function that converts the data to a string
		// we don't use an arrow function here because this function
		// will be assigned to obj.toJSON and we want to be able
		// to access the object's internal `this` context
		"convert": function () {
			return `@regexp:${this.source.length}:${this.source}:${this.global ? "g" : ""}${this.ignoreCase ? "i" : ""}`;
		}
	},
	"parse": {
		// Check if we should be responsible for converting this
		// string data back to an object
		"match": (data) => typeof data === "string" && data.indexOf("@regexp:") === 0,
		
		// If the data matched our `match()` test function above, use
		// this function to convert the string back to an object
		"convert": (data) => {
			const dataStr = data.substr(8);
			const lengthEnd = dataStr.indexOf(":");
			const sourceLength = Number(dataStr.substr(0, lengthEnd));
			const source = dataStr.substr(lengthEnd + 1, sourceLength);
			const params = dataStr.substr(lengthEnd + sourceLength + 2);
			
			return new RegExp(source, params);
		}
	}
};

export const standardHandlers = {
	// Handler for Date() objects
	"Date": dateHandler,
	
	// Handler for RegExp() objects
	"RegExp": regExpHandler
};

/**
 * @typedef {Object} Transcoder
 * @property {String} [identifier]
 * @property {Object} stringify
 * @property {Function} stringify.match
 * @property {Function} stringify.convert
 * @property {Object} parse
 * @property {Function} parse.match
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
class Serialiser {
	constructor () {
		this._transcoder = [];
	};
	
	/**
	 * Registers a handler to intercept stringify and parse operations on
	 * a particular piece of data. This allows you to add custom handlers
	 * for any type or shape of data such as transcoding functions, dates,
	 * regular
	 * @param {String} handles The name of the data handler. This can be any
	 * string you like. Often it is useful to use the name of the constructor
	 * / class that the handler will operate on (e.g. `Date` or `RegExp` or
	 * `MyClass`).
	 * @param {Transcoder} transcoder The match and convert functions for encoding
	 * and decoding the data.
	 */
	addHandler (handles, transcoder) {
		if (!handles) { return false; }
		if (!transcoder) { return false; }
		if (!transcoder.stringify) { return false; }
		if (!transcoder.parse) { return false; }
		if (!transcoder.stringify.match) { return false; }
		if (!transcoder.stringify.convert) { return false; }
		if (!transcoder.parse.match) { return false; }
		if (!transcoder.parse.convert) { return false; }
		
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
	_defineToJson (obj, value) {
		Object.defineProperty(obj, 'toJSON', {
			value,
			writable: true
		});
		
		return obj;
	}
	
	/**
	 * Loops encoders and finds one that matches the `data` in order to
	 * attach a custom toJSON function to it. This function *HAS* to modify
	 * the `data` object and add or replace the existing toJSON function since
	 * that is the function that is called when you run a `JSON.stringify()`
	 * on any `data` in order to convert it to a serialisable string.
	 * @param {Object} data The data object (usually an instance of some
	 * constructor but not always) that we want to add a toJSON function to.
	 * @param {Transcoder} [transcoder] If specified we skip asking each
	 * transcoder if it wants to take responsibility for handling the `data`
	 * and we use this one instead. Useful for performance if you already
	 * know what transcoder to use.
	 * @returns {Object} The same `data` object we pass in but modified
	 * if we found an encoder that wants to handle the `data`.
	 */
	make = (data, transcoder) => {
		// Run through encoders and check for any that are advertising
		// they want to handle this data type
		transcoder = transcoder || this._transcoder.find((transcoderItem) => {
			return transcoderItem.stringify.match(data);
		});
		
		if (transcoder) {
			// We have a match and the transcoder wants to handle this data type
			// so apply the transcoder's stringify convert function to the data's
			// toJSON property
			this._defineToJson(data, transcoder.stringify.convert);
		}
		
		return data;
	};
	
	reviver = (key, value) => {
		// Run through decoders and check for any that are advertising
		// they want to handle this data identifier
		const transcoder = this._transcoder.find((transcoder) => {
			return transcoder.parse.match(value);
		});
		
		if (!transcoder) {
			return value;
		}
		
		// We have a match and the decoder wants to handle this data identifier
		// so apply the decoder's convert function to the data and convert it
		// back to it's original type
		const decodedData = transcoder.parse.convert(value);
		
		if (decodedData !== undefined) {
			// The decoder we called matched the object and decoded it
			// so let's return it now
			return this.make(decodedData, transcoder);
		}
		
		// No decoder or undefined result, return basic value
		return value;
	};
	
	/**
	 * Parses and returns data from stringified version.
	 * @param {String} data The stringified version of data to parse.
	 * @returns {Object} The parsed JSON object from the data.
	 */
	parse = (data) => {
		return JSON.parse(data, this.reviver);
	};
	
	/**
	 * Converts a JSON object into a stringified version.
	 * @param {Object} data The data to stringify.
	 * @returns {String} The stringified data.
	 */
	stringify = JSON.stringify;
}

export default Serialiser;