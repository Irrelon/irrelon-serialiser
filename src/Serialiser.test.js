import Serialiser from "./Serialiser";
import handlers from "./handlers"
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
});