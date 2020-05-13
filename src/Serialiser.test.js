import Serialiser, {standardHandlers} from "./Serialiser";
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
			const result = serialiser.addHandler("Date", standardHandlers.Date);
			
			assert.strictEqual(result, true, "Correct");
		});
	});
	
	describe("make()", () => {
		it("Correctly modifies an object to use the toJSON from the stringifier", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", standardHandlers.Date);
			serialiser.addHandler("RegExp", standardHandlers.RegExp);
			
			const result = serialiser.make(new Date("2020-01-01T00:01:02Z"));
			
			assert.strictEqual(result.toJSON, standardHandlers.Date.stringify.convert, "Correct");
		});
	});
	
	describe("stringify()", () => {
		it("Correctly stringifies using stock handler: Date", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", standardHandlers.Date);
			serialiser.addHandler("RegExp", standardHandlers.RegExp);
			
			const testObj = {
				"foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
			};
			
			const result = serialiser.stringify(testObj);
			
			assert.strictEqual(result, `{"foo":"@date:2020-01-01T00:01:02.000Z"}`, "Correct");
		});
		
		it("Correctly stringifies using stock handler: RegExp", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", standardHandlers.Date);
			serialiser.addHandler("RegExp", standardHandlers.RegExp);
			
			const testObj = {
				"foo": serialiser.make(new RegExp("(.*?)", "ig"))
			};
			
			const result = serialiser.stringify(testObj);
			
			assert.strictEqual(result, `{"foo":"@regexp:5:(.*?):gi"}`, "Correct");
		});
	});
	
	describe("parse()", () => {
		it("Correctly parses using stock handler: Date", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", standardHandlers.Date);
			serialiser.addHandler("RegExp", standardHandlers.RegExp);
			
			const testObj = {
				"foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
			};
			
			const intermediary = serialiser.stringify(testObj);
			const result = serialiser.parse(intermediary);
			
			assert.deepStrictEqual(result, testObj, "Correct");
		});
		
		it("Correctly parses using stock handler: RegExp", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", standardHandlers.Date);
			serialiser.addHandler("RegExp", standardHandlers.RegExp);
			
			const testObj = {
				"foo": serialiser.make(new RegExp("(.*?)", "ig"))
			};
			
			const intermediary = serialiser.stringify(testObj);
			const result = serialiser.parse(intermediary);
			
			assert.deepStrictEqual(result, testObj, "Correct");
		});
		
		it("Correctly auto-applies make() to rematerialised data", () => {
			const serialiser = new Serialiser();
			serialiser.addHandler("Date", standardHandlers.Date);
			serialiser.addHandler("RegExp", standardHandlers.RegExp);
			
			const testObj = {
				"foo": serialiser.make(new Date("2020-01-01T00:01:02Z"))
			};
			
			const intermediary = serialiser.stringify(testObj);
			const result = serialiser.parse(intermediary);
			
			assert.strictEqual(result.foo.toJSON, standardHandlers.Date.stringify.convert, "Correct");
		});
	});
});