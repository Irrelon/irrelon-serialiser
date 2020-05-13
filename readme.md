# Irrelon Serialiser
An advanced, high performance and configurable JSON parser /
serialiser that allows data like Date, RegExp and Function
instances to be serialised to pure JSON strings and then be
parsed back to original instances as required.

## Why?
When you stringify objects to JSON format they must be able
to resolve to a string representation of their internal state.
When you stringify a Date instance it outputs to an ISO format
string but if you then parse that JSON string back to an object
the Date instance is gone, e.g.

```js
const a = {
	dt: new Date()
};

a.dt instanceof Date; // true

const b = JSON.stringify(a); // "{"dt":"2020-02-11T09:52:49.170Z"}"
const c = JSON.parse(b); // {dt: "2020-02-11T09:52:49.170Z"}

c.dt instanceof Date; // false
```

With @irrelon/serialiser your date will rematerialise back to
an actual date instance:

```js
import Serialiser from "@irrelon/serialiser";

// The serialiser is modular so you can import only what you
// need to use. Take a look in the src/handlers folder to see
// how to make your own custom handlers!
import dateHandler from "@irrelon/serialiser/handlers/dateHandler";
import regExpHandler from "@irrelon/serialiser/handlers/regExpHandler";
import functionHandler from "@irrelon/serialiser/handlers/functionHandler";

const serialiser = new Serialiser();
serialiser.addHandler("Date", dateHandler);
serialiser.addHandler("RegExp", regExpHandler);
serialiser.addHandler("Function", functionHandler);

const a = {
	dt: serialiser.make(new Date())
};

a.dt instanceof Date; // true

const b = serialiser.stringify(a); // "{"dt":"2020-02-11T09:52:49.170Z"}"
const c = serialiser.parse(b); // {dt: "2020-02-11T09:52:49.170Z"}

c.dt instanceof Date; // true
```

## Install

#### npm
```bash
npm i @irrelon/serialiser
```
#### yarn
```bash
yarn add @irrelon/serialiser
```