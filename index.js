const safeeval = require('safe-eval');
const ObjectId = require('bson/lib/bson/objectid');
const XRegExp = require('xregexp');

const JSONT = {};

const operators = [ '+', '-', '*', '/' ];

const r = String.raw.bind(String.raw);

/* Removed temporarily because of no support on node<6.
	See: https://github.com/codefeathers/jsont/issues/1 */
// const esc = r`(?<!\\)`;

const esc = '';

const t = {};
t['1m'] = 1000 * 60;
t['1h'] = t['1m'] * 60;
t['1d'] = t['1h'] * 24;

const opRegex = XRegExp(
	'^['
	+ operators
		.reduce((acc, cur, i) =>
			(i === 1 ? '\\' : '') + acc + '\\' + cur)
	+ ']'
);

const last = list =>
	list[list.length - 1];

const stringReplaceByIndex = (s, [start, end], r) =>
	s.slice(0, start) + r + s.slice(end);

const getOp = str =>
	str.match(opRegex) && str[0];

const getDate = {
	'+': (n, seg) => new Date(new Date().valueOf() + (t['1' + seg] * n)),
	'-': (n, seg) => new Date(new Date().valueOf() - (t['1' + seg] * n)),
};

const stdlib = {

	date(str) {

		let returnable;
		if (str === 'now') returnable = new Date();
		else {
			const op = getOp(str);
			if (op) {
				returnable =
					getDate[op](str.slice(1, str.length - 1), last(str));
			}
			else throw new Error(str + ' cannot be cast as a date');
		}

		return returnable.toISOString();

	},

	oid (str) {

		return (str === 'new') ? new ObjectId() : new ObjectId(str);

	}

};

const stdJS = {

	/* Inline JS support is removed.
		See: https://github.com/codefeathers/jsont/issues/1
	js: (str) => safeeval(str.replace(XRegExp(esc + ''), ''), {}), */

};

const ExecSTD = (test, string, STD) => {

	const regexp = new XRegExp(
		esc + r`\$`
		+ esc + r`\[`
		+ test
		+ esc + ':'
		+ r`(?<arguments>((\\\])|[^\]])*)`
		+ esc + r`\]`, 'g');

	let match;
	while((match = XRegExp.exec(string, regexp)) !== null) {

		const stdReplaceable = STD[test](match.arguments);

		string = stringReplaceByIndex(
			string,
			[ match.index, match.index + match[0].length ],
			stdReplaceable
		);

	}

	return string;

};

JSONT.parse = (text, ENV = {}, STD = {}, options = {}) => {

	Object.assign(STD, stdlib);
	if (options.js) Object.assign(STD, stdJS);

	// Replace plain values from ENV
	let string =
		Object.keys(ENV)
		.reduce(
			(acc, key) => {
				const re = new XRegExp(`\\$\\[${key}\\]`, 'g');
				return XRegExp.replace(acc, re, ENV[key]);
			},
			text
		);

	return Object.keys(STD)
		.reduce(
			/* For every stdlib item */
			(str, stdKey) => ExecSTD(stdKey, str, STD),
			string
		).replace(/\\/g, '');

};

JSONT.toJSON = str => JSON.parse(str);

module.exports = JSONT;
