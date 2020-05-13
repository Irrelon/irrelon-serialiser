const Mocha = require('mocha');
const {
	EVENT_RUN_BEGIN,
	EVENT_RUN_END,
	EVENT_TEST_FAIL,
	EVENT_TEST_PASS,
	EVENT_SUITE_BEGIN,
	EVENT_SUITE_END,
	EVENT_TEST_BEGIN,
	EVENT_TEST_END
} = Mocha.Runner.constants;

const color = Mocha.reporters.Base.color;
const symbols = Mocha.reporters.Base.symbols;

// this reporter outputs test results, indenting two spaces per suite
class MyReporter extends Mocha.reporters.Base {
	constructor (runner, options) {
		super(runner, options);
		
		this._indents = 0;
		const stats = runner.stats;
		
		const seenSuites = [];
		
		const outputSuiteFail = (suite) => {
			if (seenSuites.indexOf(suite) > -1) return;
			seenSuites.push(suite);
			
			this.decreaseIndent();
			console.log(color('fail', `${this.indent()}${symbols.err} ${suite.title}`));
			this.increaseIndent();
		}
		
		runner
			.once(EVENT_RUN_BEGIN, () => {
				console.log(color('green', 'Running tests...'));
			})
			.on(EVENT_SUITE_BEGIN, (test) => {
				this.increaseIndent();
				if (!test.tests.length) {
					if (test.title) console.log(color('pass', `${this.indent()}${test.title}`));
				}
			})
			.on(EVENT_SUITE_END, (test) => {
				if (!test.tests.length || test.tests.find((item) => item.state !== "passed")) {
					this.decreaseIndent();
					return;
				}
				
				if (test.title) {
					console.log(color('pass', `${this.indent()}${symbols.ok} ${test.title}`));
				}
				this.decreaseIndent();
			})
			.on(EVENT_TEST_BEGIN, (test) => {
				this.increaseIndent();
				test.startTime = new Date().getTime();
			})
			.on(EVENT_TEST_END, (test) => {
				this.decreaseIndent();
			})
			.on(EVENT_TEST_PASS, (test) => {
				// Test#fullTitle() returns the suite name(s)
				// prepended to the test title
				test.timeTaken = new Date().getTime() - test.startTime;
				//console.log(color('bright yellow', `${this.indent()}${symbols.ok} ${test.title} - ${test.timeTaken}ms`));
			})
			.on(EVENT_TEST_FAIL, (test, err) => {
				outputSuiteFail(test.parent);
				
				test.timeTaken = new Date().getTime() - test.startTime;
				console.log(color('fail',
					`${this.indent()}${symbols.err} ${test.title}`
				));
				this.increaseIndent();
				this.increaseIndent();
				const files = err.stack.match(/\((.*?)\)/g);
				console.log(color('fail', `${this.indent()}Assertion:`), err.message, "\n" + this.indent() + "   at " + files[0]);
				this.increaseIndent();
				
				if (typeof err.expected !== "string") {
					if (err.expected && err.expected.toString) {
						err.expected = err.expected.toString();
					} else {
						err.expected = "[unknown value] <-- Please realtime debug, we can't work out this type"
					}
				}
				
				console.log();
				console.log(color('bright pass', `${this.indent()} Expected:`));
				this.increaseIndent();
				console.log(`${this.indent()} ${err.expected.replace(/\n\s*?/g, "\n " + this.indent())}`);
				this.decreaseIndent();
				
				if (typeof err.actual !== "string") {
					if (err.actual && err.actual.toString) {
						err.actual = err.actual.toString();
					} else {
						err.actual = "[unknown value] <-- Please realtime debug, we can't work out this type"
					}
				}
				
				console.log();
				console.log(color('bright fail', `${this.indent()} Actual:`));
				this.increaseIndent();
				console.log(`${this.indent()} ${err.actual.replace(/\n\s*?/g, "\n " + this.indent())}`);
				console.log();
				this.decreaseIndent();
				
				this.decreaseIndent();
				this.decreaseIndent();
				this.decreaseIndent();
			})
			.once(EVENT_RUN_END, () => {
				this.increaseIndent();
				this.increaseIndent();
				
				if (stats.failures) {
					console.log(color('fail',`${this.indent()}${symbols.ok} Passed: ${stats.passes}/${stats.passes + stats.failures}, ${symbols.err} Failed: ${stats.failures}`));
				} else {
					console.log(color('bright pass', `${this.indent()}${symbols.ok} Passed: ${stats.passes}/${stats.passes + stats.failures}`));
				}
			});
	}
	
	indent () {
		return Array(this._indents).join('  ');
	}
	
	increaseIndent () {
		this._indents++;
	}
	
	decreaseIndent () {
		this._indents--;
	}
}

module.exports = MyReporter;