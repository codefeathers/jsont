const JSONT = require('.');

const r = String.raw.bind(String.raw);

const sampleString = r`{
	"sample": $[a],
	"2 mins ago": "$[date:-2m]",
	"2 days later": "$[date:+2d]",
	"now": "$[date:now]",
	"oid": "$[oid:5b639cef06c208f42ee09bfe]",
	"inlineJS:": "$[js:(() => [ 4 \])()]"
}`;

const env = { a: '[ "5" ]' };

const parsed = (
	JSONT.toJSON(
		JSONT.parse(
			sampleString,
			env,
			undefined,
			{ js: true }
		)
	)
);

console.log('---> parsed\n', parsed);
