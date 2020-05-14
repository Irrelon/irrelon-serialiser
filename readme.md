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
	dt: serialiser.make(new Date()) // <-- Notice we call make() here?
};

a.dt instanceof Date; // true

const b = serialiser.stringify(a); // "{"dt":"2020-02-11T09:52:49.170Z"}"
const c = serialiser.parse(b); // {dt: "2020-02-11T09:52:49.170Z"}

c.dt instanceof Date; // true
```

## Optional Transcoding
You'll notice that when we assign the `Date` instance to the `dt`
property we call `serialiser.make()`, passing it the `new Date()`.
The `make()` function is used to mark the `Date` instance as one that
we want to transcode from instance to string and back to instance.

If you don't wrap the instance of `Date` in a `make()` call the
serialiser will not operate on it and it will stringify in the normal
way and also parse in the normal way that `JSON.stringify()` and 
`JSON.parse()` do. This allows you to have very fine control over
which instances are transcoded and which are not.

## Auto-Transcoding
If you don't want to (or can't) call make() on each instance you need
transcoding (a good example would be when dealing with an arbitrary
object hierarchy) you can have the serialiser automatically handle
calling `make()` on every instance that matches a handler you have
added to it. 

## Install

#### npm
```bash
npm i @irrelon/serialiser
```
#### yarn
```bash
yarn add @irrelon/serialiser
```