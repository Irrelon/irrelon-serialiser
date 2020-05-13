/**
 * @typedef {Object} Transcoder
 * @property {String} [identifier]
 * @property {Object} stringify
 * @property {Function} stringify.match
 * @property {String} [stringify.matchConstructorName]
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
		this._transcoderLookup = {};
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
		
		// Do some wrapping
		const originalConvert = transcoder.stringify.convert;
		
		if (!originalConvert.___irrelonWrapper) {
			transcoder.stringify.convert = function () {
				return `${transcoder.identifier}:${originalConvert.apply(this)}`;
			}
			
			transcoder.stringify.convert.___irrelonWrapper = true;
		}
		
		
		if (transcoder.stringify.matchConstructorName) {
			this._transcoderLookup[transcoder.stringify.matchConstructorName] = transcoder;
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
	_defineToJson (obj, value) {
		Object.defineProperty(obj, 'toJSON', {
			value,
			writable: true
		});
		
		return obj;
	}
	
	getTranscoder (data, phase = "encode") {
		if (phase === "encode") return this.getTranscoderForEncoding(data);
		return this.getTranscoderForDecoding(data);
	}
	
	getTranscoderForEncoding (data) {
		let transcoder;
		
		if (data && data.constructor && data.constructor.name) {
			transcoder = this._transcoderLookup[data.constructor.name];
		}
		
		// Run through encoders and check for any that are advertising
		// they want to handle this data type
		transcoder = transcoder || this._transcoder.find((transcoderItem) => {
			return transcoderItem.stringify.match(data, transcoderItem);
		});
		
		// Return the encoder
		if (transcoder) return transcoder;
		
		return undefined;
	}
	
	getTranscoderForDecoding (data) {
		// Run through decoders and check for any that are advertising
		// they want to handle this data type
		const transcoder = this._transcoder.find((transcoderItem) => {
			return transcoderItem.parse.match(data, transcoderItem);
		});
		
		// Return the decoder
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
	make = (data, transcoder) => {
		// Run through encoders and check for any that are advertising
		// they want to handle this data type
		transcoder = transcoder || this.getTranscoder(data, "encode");
		
		if (transcoder) {
			// We have a match and the transcoder wants to handle this data type
			// so apply the transcoder's stringify convert function to the data's
			// toJSON property
			this._defineToJson(data, transcoder.stringify.convert);
		}
		
		return data;
	};
	
	reviver = (key, data) => {
		// Run through decoders and check for any that are advertising
		// they want to handle this data identifier
		const transcoder = this.getTranscoder(data, "decode");
		
		if (!transcoder) {
			return data;
		}
		
		// We have a match and the decoder wants to handle this data identifier
		// so apply the decoder's convert function to the data and convert it
		// back to it's original type
		const decodedData = transcoder.parse.convert(data.substr(transcoder.identifier.length + 1), transcoder);
		
		if (decodedData !== undefined) {
			// The decoder we called matched the object and decoded it
			// so let's return it now
			return this.make(decodedData, transcoder);
		}
		
		// No decoder or undefined result, return basic data
		return data;
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
	
	stringifyMake (data) {
		data = this.makeRecursive(data);
		
		return this.stringify(data);
	}
	
	makeRecursive (data) {
		// Recursively scan the object and auto-make any objects
		// that we find
		if (typeof data === "object" && data !== null) {
			data = this.make(data);
			
		}
		
		return data;
	}
}

export default Serialiser;