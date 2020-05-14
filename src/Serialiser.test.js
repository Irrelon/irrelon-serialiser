import Serialiser from "./Serialiser";
import handlers from "./handlers";
import assert from "assert";

describe("Serialiser", () => {
	describe("constructor()", () => {
		it("Constructs correctly", () => {
			const serialiser = new Serialiser();
			
			assert.strictEqual(serialiser instanceof Serialiser, true, "Correct");
		});
	});
	
	describe("addHandler()", () => {
		it("Allows a new handler to be registered", () => {
			const serialiser = new Serialiser();
			const result = serialiser.addHandler("Date", handlers.Date);
			
			assert.strictEqual(result, true, "Correct");
		});
	});
	
	describe("make()", () => {
		it("Correctly modifies an object to use the toJSON from the stringifier", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", handlers.Date);
			serialiser.addHandler("RegExp", handlers.RegExp);
			serialiser.addHandler("Function", handlers.Function);
			
			const result = serialiser.make(new Date("2020-01-01T00:01:02Z"));
			
			assert.strictEqual(result.toJSON, handlers.Date.stringify.convert, "Correct");
		});
		
		it("Calling toJSON() after make returns the correct string", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", handlers.Date);
			serialiser.addHandler("RegExp", handlers.RegExp);
			serialiser.addHandler("Function", handlers.Function);
			
			const intermediary = serialiser.make(new Date("2020-02-03T00:01:02Z"));
			
			assert.ok(typeof intermediary.toJSON === "function", "The toJSON property is a function");
			
			const result = intermediary.toJSON();
			
			assert.strictEqual(result, "@date:2020-02-03T00:01:02.000Z", "Correct");
		});
	});
	
	describe("stringify()", () => {
		describe("Date", () => {
			it("Correctly stringifies using stock handler: Date", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj = {
					"foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
				};
				
				const result = serialiser.stringify(testObj);
				
				assert.strictEqual(result, `{"foo":"@date:2020-01-01T00:01:02.000Z"}`, "Correct");
			});
		});
		
		describe("RegExp", () => {
			it("Correctly stringifies using stock handler: RegExp", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj = {
					"foo": serialiser.make(new RegExp("(.*?)", "ig"))
				};
				
				const result = serialiser.stringify(testObj);
				
				assert.strictEqual(result, `{"foo":"@regexp:5:(.*?):gi"}`, "Correct");
			});
		});
		
		describe("Function", () => {
			it("Correctly stringifies using stock handler: Function", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj = {
					"foo": serialiser.make((a, b) => { return a + b; })
				};
				
				const result = serialiser.stringify(testObj);
				
				assert.strictEqual(result, `{"foo":"@function:function (a, b) {\\n            return a + b;\\n          }"}`, "Correct");
			});
		});
	});
	
	describe("parse()", () => {
		describe("Date", () => {
			it("Correctly parses using stock handler", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj = {
					"foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
				};
				
				const intermediary = serialiser.stringify(testObj);
				const result = serialiser.parse(intermediary);
				
				assert.deepStrictEqual(result, testObj, "Correct");
			});
			
			it("Correctly auto-applies make() to rematerialised data", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj = {
					"foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
				};
				
				const intermediary = serialiser.stringify(testObj);
				const result = serialiser.parse(intermediary);
				
				assert.strictEqual(result.foo.toJSON, handlers.Date.stringify.convert, "Correct");
			});
		});
		
		describe("RegExp", () => {
			it("Correctly parses using stock handler", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj = {
					"foo": serialiser.make(new RegExp("(.*?)", "ig"))
				};
				
				const intermediary = serialiser.stringify(testObj);
				const result = serialiser.parse(intermediary);
				
				assert.deepStrictEqual(result, testObj, "Correct");
			});
		});
		
		describe("Function", () => {
			it("Correctly parses using stock handler", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj = {
					"foo": serialiser.make((a, b) => {
						return a + b;
					})
				};
				
				const intermediary = serialiser.stringify(testObj);
				const result = serialiser.parse(intermediary);
				
				assert.strictEqual(result.foo.toString(), testObj.foo.toString(), "Correct");
				assert.strictEqual(result.foo(1, 2), 3, "Function call works")
				assert.strictEqual(testObj.foo(1, 2), 3, "Function call works")
			});
		});
	});
	
	describe("Auto-Transcoding", () => {
		describe("stringify()", () => {
			it("Can auto-transcode and stringify object hierarchies", () => {
				const serialiser = new Serialiser();
				serialiser.addHandler("Date", handlers.Date);
				serialiser.addHandler("RegExp", handlers.RegExp);
				serialiser.addHandler("Function", handlers.Function);
				
				const testObj1 = {
					"dt": new Date("1960-12-01T01:02:03Z"),
					"foo": [{
						"_id": "123",
						"num": 34,
						"func": (a, b) => a + b
					}, {
						"regexp": /(.*?)/gi
					}]
				};
				
				const testObj2 = {
					"dt": new Date("1960-12-01T01:02:03Z"),
					"foo": [{
						"_id": "123",
						"num": 34,
						"func": (a, b) => a + b
					}, {
						"regexp": /(.*?)/gi
					}]
				};
				
				// Run stringify without auto-transcoding
				const result1 = serialiser.stringify(testObj1);
				
				// Run it again with auto-transcoding
				const result2 = serialiser.stringify(testObj2, true);
				
				// Run it again without auto-transcoding - it has already
				// been transcoded though so should resolve to a rich
				// serialisation rather than a vanilla one because by default
				// we use mutable object manipulation rather than immutable
				// cloning and return
				const result3 = serialiser.stringify(testObj2);
				
				assert.strictEqual(result1, "{\"dt\":\"1960-12-01T01:02:03.000Z\",\"foo\":[{\"_id\":\"123\",\"num\":34},{\"regexp\":{}}]}", "Stringify data should match expected");
				assert.strictEqual(result2, "{\"dt\":\"@date:1960-12-01T01:02:03.000Z\",\"foo\":[{\"_id\":\"123\",\"num\":34,\"func\":\"@function:function func(a, b) {\\n              return a + b;\\n            }\"},{\"regexp\":\"@regexp:5:(.*?):gi\"}]}", "Stringify data should match expected");
				assert.strictEqual(result3, "{\"dt\":\"@date:1960-12-01T01:02:03.000Z\",\"foo\":[{\"_id\":\"123\",\"num\":34,\"func\":\"@function:function func(a, b) {\\n              return a + b;\\n            }\"},{\"regexp\":\"@regexp:5:(.*?):gi\"}]}", "Stringify data should match expected");
				
				// Now parse and check the values
				const result1p = serialiser.parse(result1);
				const result2p = serialiser.parse(result2);
				const result3p = serialiser.parse(result3);
				
				assert.deepStrictEqual(result1p, {
					"dt": "1960-12-01T01:02:03.000Z",
					"foo": [{
						"_id": "123",
						"num": 34
					}, {
						"regexp": {}
					}]
				}, "The parsed object is as expected");
				
				assert.strictEqual(result2p.dt.toISOString(), testObj2.dt.toISOString(), "The parsed object is as expected");
				assert.strictEqual(result2p.foo[0].func.toString(), testObj2.foo[0].func.toString(), "The parsed object is as expected");
				assert.strictEqual(result2p.foo[1].regexp.toString(), testObj2.foo[1].regexp.toString(), "The parsed object is as expected");
				
				assert.strictEqual(result3p.dt.toISOString(), testObj2.dt.toISOString(), "The parsed object is as expected");
				assert.strictEqual(result3p.foo[0].func.toString(), testObj2.foo[0].func.toString(), "The parsed object is as expected");
				assert.strictEqual(result3p.foo[1].regexp.toString(), testObj2.foo[1].regexp.toString(), "The parsed object is as expected");
			});
		});
	});
});